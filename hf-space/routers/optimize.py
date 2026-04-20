"""Optimize PDF operations: compress, repair."""
import os
import io
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import StreamingResponse
import pikepdf
from utils.file_utils import get_temp_dir, cleanup_dir, save_upload

router = APIRouter()


@router.post("/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    level: str = Form("recommended"),
):
    """Compress PDF. level: 'low', 'recommended', 'extreme'."""
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)
        output = os.path.join(tmp, "compressed.pdf")

        with pikepdf.open(path) as pdf:
            if level == "extreme":
                pdf.save(
                    output,
                    compress_streams=True,
                    object_stream_mode=pikepdf.ObjectStreamMode.generate,
                    recompress_flate=True,
                )
            elif level == "low":
                pdf.save(output, compress_streams=True)
            else:
                pdf.save(
                    output,
                    compress_streams=True,
                    object_stream_mode=pikepdf.ObjectStreamMode.generate,
                )

        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=compressed.pdf"},
        )
    finally:
        cleanup_dir(tmp)


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
