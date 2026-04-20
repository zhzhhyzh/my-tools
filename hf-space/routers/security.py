"""Security PDF operations: unlock, protect."""
import os
import io
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pypdf import PdfReader, PdfWriter
from utils.file_utils import get_temp_dir, cleanup_dir, save_upload

router = APIRouter()


@router.post("/unlock")
async def unlock_pdf(
    file: UploadFile = File(...),
    password: str = Form(""),
):
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)
        reader = PdfReader(path)

        if reader.is_encrypted:
            reader.decrypt(password)

        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)

        output = os.path.join(tmp, "unlocked.pdf")
        with open(output, "wb") as out:
            writer.write(out)
        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=unlocked.pdf"},
        )
    finally:
        cleanup_dir(tmp)


@router.post("/protect")
async def protect_pdf(
    file: UploadFile = File(...),
    password: str = Form(...),
):
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)
        reader = PdfReader(path)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        writer.encrypt(password)

        output = os.path.join(tmp, "protected.pdf")
        with open(output, "wb") as out:
            writer.write(out)
        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=protected.pdf"},
        )
    finally:
        cleanup_dir(tmp)
