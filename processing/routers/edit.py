"""Edit PDF operations: watermark, page numbers, redact, edit (overlay)."""
import os
import io
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import Color
from utils.file_utils import get_temp_dir, cleanup_dir, save_upload

router = APIRouter()


@router.post("/watermark")
async def add_watermark(
    file: UploadFile = File(...),
    text: str = Form("WATERMARK"),
    font_size: int = Form(60),
    opacity: float = Form(0.3),
    angle: int = Form(45),
    color: str = Form("gray"),
):
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)
        reader = PdfReader(path)
        writer = PdfWriter()

        color_map = {
            "gray": Color(0.5, 0.5, 0.5, alpha=opacity),
            "red": Color(1, 0, 0, alpha=opacity),
            "blue": Color(0, 0, 1, alpha=opacity),
            "green": Color(0, 0.5, 0, alpha=opacity),
            "black": Color(0, 0, 0, alpha=opacity),
        }
        fill_color = color_map.get(color, Color(0.5, 0.5, 0.5, alpha=opacity))

        for page in reader.pages:
            box = page.mediabox
            w = float(box.width)
            h = float(box.height)

            watermark_path = os.path.join(tmp, "watermark.pdf")
            c = canvas.Canvas(watermark_path, pagesize=(w, h))
            c.saveState()
            c.translate(w / 2, h / 2)
            c.rotate(angle)
            c.setFillColor(fill_color)
            c.setFont("Helvetica-Bold", font_size)
            c.drawCentredString(0, 0, text)
            c.restoreState()
            c.save()

            wm_reader = PdfReader(watermark_path)
            page.merge_page(wm_reader.pages[0])
            writer.add_page(page)

        output = os.path.join(tmp, "watermarked.pdf")
        with open(output, "wb") as out:
            writer.write(out)
        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=watermarked.pdf"},
        )
    finally:
        cleanup_dir(tmp)


@router.post("/page-numbers")
async def add_page_numbers(
    file: UploadFile = File(...),
    position: str = Form("bottom-center"),
    start_number: int = Form(1),
    font_size: int = Form(12),
    margin: float = Form(30),
):
    """Add page numbers. position: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right."""
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)
        reader = PdfReader(path)
        writer = PdfWriter()

        for idx, page in enumerate(reader.pages):
            box = page.mediabox
            w = float(box.width)
            h = float(box.height)
            num = start_number + idx

            overlay_path = os.path.join(tmp, f"pn_{idx}.pdf")
            c = canvas.Canvas(overlay_path, pagesize=(w, h))
            c.setFont("Helvetica", font_size)

            positions = {
                "top-left": (margin, h - margin),
                "top-center": (w / 2, h - margin),
                "top-right": (w - margin, h - margin),
                "bottom-left": (margin, margin),
                "bottom-center": (w / 2, margin),
                "bottom-right": (w - margin, margin),
            }
            x, y = positions.get(position, (w / 2, margin))
            c.drawCentredString(x, y, str(num))
            c.save()

            overlay_reader = PdfReader(overlay_path)
            page.merge_page(overlay_reader.pages[0])
            writer.add_page(page)

        output = os.path.join(tmp, "numbered.pdf")
        with open(output, "wb") as out:
            writer.write(out)
        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=numbered.pdf"},
        )
    finally:
        cleanup_dir(tmp)


@router.post("/redact")
async def redact_pdf(
    file: UploadFile = File(...),
    search_text: str = Form(None),
    areas: str = Form(None),
):
    """Redact text or areas. areas format: JSON array of {page, x, y, width, height}."""
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)

        if search_text:
            import pdfplumber
            reader = PdfReader(path)
            writer = PdfWriter()

            with pdfplumber.open(path) as pdf:
                for i, pdfp_page in enumerate(pdf.pages):
                    page = reader.pages[i]
                    box = page.mediabox
                    w = float(box.width)
                    h = float(box.height)

                    words = pdfp_page.extract_words()
                    overlay_path = os.path.join(tmp, f"redact_{i}.pdf")
                    c = canvas.Canvas(overlay_path, pagesize=(w, h))

                    for word in words:
                        if search_text.lower() in word["text"].lower():
                            x0 = float(word["x0"])
                            y0 = h - float(word["bottom"])
                            x1 = float(word["x1"])
                            y1 = h - float(word["top"])
                            c.setFillColorRGB(0, 0, 0)
                            c.rect(x0 - 1, y0 - 1, x1 - x0 + 2, y1 - y0 + 2, fill=True, stroke=False)

                    c.save()
                    overlay_reader = PdfReader(overlay_path)
                    page.merge_page(overlay_reader.pages[0])
                    writer.add_page(page)

            output = os.path.join(tmp, "redacted.pdf")
            with open(output, "wb") as out:
                writer.write(out)

        elif areas:
            import json
            area_list = json.loads(areas)
            reader = PdfReader(path)
            writer = PdfWriter()

            for i, page in enumerate(reader.pages):
                box = page.mediabox
                w = float(box.width)
                h = float(box.height)

                page_areas = [a for a in area_list if a.get("page", 1) - 1 == i]
                if page_areas:
                    overlay_path = os.path.join(tmp, f"redact_{i}.pdf")
                    c = canvas.Canvas(overlay_path, pagesize=(w, h))
                    for area in page_areas:
                        c.setFillColorRGB(0, 0, 0)
                        c.rect(area["x"], h - area["y"] - area["height"],
                               area["width"], area["height"], fill=True, stroke=False)
                    c.save()
                    overlay_reader = PdfReader(overlay_path)
                    page.merge_page(overlay_reader.pages[0])
                writer.add_page(page)

            output = os.path.join(tmp, "redacted.pdf")
            with open(output, "wb") as out:
                writer.write(out)
        else:
            return {"error": "Provide search_text or areas"}

        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=redacted.pdf"},
        )
    finally:
        cleanup_dir(tmp)


@router.post("/edit")
async def edit_pdf(
    file: UploadFile = File(...),
    operations: str = Form(...),
):
    """Add text/image overlays. operations: JSON array of
    {type:'text', page:1, x:100, y:100, text:'Hello', fontSize:14, color:'black'}
    or {type:'image', page:1, x:100, y:100, width:200, height:100}
    """
    tmp = get_temp_dir()
    try:
        import json
        path = await save_upload(file, tmp)
        ops = json.loads(operations)
        reader = PdfReader(path)
        writer = PdfWriter()

        for i, page in enumerate(reader.pages):
            box = page.mediabox
            w = float(box.width)
            h = float(box.height)

            page_ops = [o for o in ops if o.get("page", 1) - 1 == i]
            if page_ops:
                overlay_path = os.path.join(tmp, f"edit_{i}.pdf")
                c = canvas.Canvas(overlay_path, pagesize=(w, h))

                for op in page_ops:
                    if op["type"] == "text":
                        font_size = op.get("fontSize", 14)
                        color = op.get("color", "black")
                        color_map = {
                            "black": (0, 0, 0), "red": (1, 0, 0),
                            "blue": (0, 0, 1), "green": (0, 0.5, 0),
                            "white": (1, 1, 1),
                        }
                        rgb = color_map.get(color, (0, 0, 0))
                        c.setFillColorRGB(*rgb)
                        c.setFont("Helvetica", font_size)
                        c.drawString(op["x"], h - op["y"], op["text"])

                c.save()
                overlay_reader = PdfReader(overlay_path)
                page.merge_page(overlay_reader.pages[0])
            writer.add_page(page)

        output = os.path.join(tmp, "edited.pdf")
        with open(output, "wb") as out:
            writer.write(out)
        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=edited.pdf"},
        )
    finally:
        cleanup_dir(tmp)
