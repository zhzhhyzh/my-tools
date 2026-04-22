"""Optimize PDF operations: compress, repair."""
import os
import io
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import StreamingResponse
import pikepdf
from PIL import Image
from utils.file_utils import get_temp_dir, cleanup_dir, save_upload

router = APIRouter()

# Compression quality settings: (max_dimension, jpeg_quality)
COMPRESSION_LEVELS = {
    "low": (2400, 85),
    "recommended": (1600, 65),
    "extreme": (1024, 40),
}


def compress_image(image_obj, max_dim, quality):
    """Extract image from PDF, resize & recompress as JPEG, return raw bytes."""
    try:
        raw = image_obj.read_raw_bytes()
        pil_img = Image.open(io.BytesIO(raw))
    except Exception:
        try:
            pil_img = Image.open(io.BytesIO(image_obj.get_stream_buffer()))
        except Exception:
            return None

    # Convert to RGB if necessary (CMYK, palette, RGBA)
    if pil_img.mode in ("RGBA", "LA", "P"):
        pil_img = pil_img.convert("RGB")
    elif pil_img.mode == "CMYK":
        pil_img = pil_img.convert("RGB")
    elif pil_img.mode != "RGB":
        try:
            pil_img = pil_img.convert("RGB")
        except Exception:
            return None

    # Downscale if larger than max_dim
    w, h = pil_img.size
    if max(w, h) > max_dim:
        ratio = max_dim / max(w, h)
        new_w, new_h = int(w * ratio), int(h * ratio)
        pil_img = pil_img.resize((new_w, new_h), Image.LANCZOS)

    # Recompress as JPEG
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG", quality=quality, optimize=True)
    return buf.getvalue()


@router.post("/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    level: str = Form("recommended"),
):
    """Compress PDF by downscaling images and recompressing streams."""
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)
        output = os.path.join(tmp, "compressed.pdf")
        max_dim, quality = COMPRESSION_LEVELS.get(level, COMPRESSION_LEVELS["recommended"])

        with pikepdf.open(path) as pdf:
            # Iterate all pages and compress embedded images
            for page in pdf.pages:
                _compress_page_images(page, pdf, max_dim, quality)

            # Save with stream compression
            pdf.save(
                output,
                compress_streams=True,
                object_stream_mode=pikepdf.ObjectStreamMode.generate,
                recompress_flate=True,
            )

        # If compressed file is somehow larger, return original
        orig_size = os.path.getsize(path)
        comp_size = os.path.getsize(output)
        final_path = output if comp_size < orig_size else path

        with open(final_path, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=compressed.pdf",
                "X-Original-Size": str(orig_size),
                "X-Compressed-Size": str(os.path.getsize(final_path)),
            },
        )
    finally:
        cleanup_dir(tmp)


def _compress_page_images(page, pdf, max_dim, quality):
    """Find and replace images in a page's resources with compressed versions."""
    try:
        resources = page.get("/Resources", {})
        xobjects = resources.get("/XObject", {})
    except Exception:
        return

    for key in list(xobjects.keys()):
        try:
            xobj = xobjects[key]
            if not isinstance(xobj, pikepdf.Stream):
                continue
            if xobj.get("/Subtype") != "/Image":
                continue

            # Try to read and compress the image
            width = int(xobj.get("/Width", 0))
            height = int(xobj.get("/Height", 0))
            if width == 0 or height == 0:
                continue

            # Extract image data
            try:
                raw_data = xobj.read_bytes()
                pil_img = Image.open(io.BytesIO(raw_data))
            except Exception:
                # Try getting raw and rebuilding
                try:
                    raw_data = xobj.get_raw_stream_buffer()
                    # Skip if we can't decode
                    continue
                except Exception:
                    continue

            # Convert color mode
            if pil_img.mode in ("RGBA", "LA", "P"):
                pil_img = pil_img.convert("RGB")
            elif pil_img.mode == "CMYK":
                pil_img = pil_img.convert("RGB")
            elif pil_img.mode != "RGB":
                try:
                    pil_img = pil_img.convert("RGB")
                except Exception:
                    continue

            # Downscale
            w, h = pil_img.size
            if max(w, h) > max_dim:
                ratio = max_dim / max(w, h)
                new_w = max(1, int(w * ratio))
                new_h = max(1, int(h * ratio))
                pil_img = pil_img.resize((new_w, new_h), Image.LANCZOS)

            # Recompress
            buf = io.BytesIO()
            pil_img.save(buf, format="JPEG", quality=quality, optimize=True)
            jpeg_data = buf.getvalue()

            # Replace the image stream in the PDF
            new_image = pikepdf.Stream(pdf, jpeg_data)
            new_image["/Type"] = pikepdf.Name("/XObject")
            new_image["/Subtype"] = pikepdf.Name("/Image")
            new_image["/Width"] = pil_img.size[0]
            new_image["/Height"] = pil_img.size[1]
            new_image["/ColorSpace"] = pikepdf.Name("/DeviceRGB")
            new_image["/BitsPerComponent"] = 8
            new_image["/Filter"] = pikepdf.Name("/DCTDecode")

            xobjects[key] = new_image

        except Exception:
            # Skip images that can't be processed
            continue


@router.post("/repair")
async def repair_pdf(file: UploadFile = File(...)):
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)
        output = os.path.join(tmp, "repaired.pdf")

        with pikepdf.open(path, allow_overwriting_input=True) as pdf:
            pdf.save(output)

        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=repaired.pdf"},
        )
    finally:
        cleanup_dir(tmp)
