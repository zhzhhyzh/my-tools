"""Organize PDF operations: merge, split, rotate, organize, crop."""
import os
import io
import json
import zipfile
from typing import List
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pypdf import PdfReader, PdfWriter
from utils.file_utils import get_temp_dir, cleanup_dir, save_upload

router = APIRouter()


@router.post("/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    tmp = get_temp_dir()
    try:
        writer = PdfWriter()
        for f in files:
            path = await save_upload(f, tmp)
            reader = PdfReader(path)
            for page in reader.pages:
                writer.add_page(page)
        output = os.path.join(tmp, "merged.pdf")
        with open(output, "wb") as out:
            writer.write(out)
        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=merged.pdf"},
        )
    finally:
        cleanup_dir(tmp)


@router.post("/split")
async def split_pdf(
    file: UploadFile = File(...),
    ranges: str = Form("all"),
):
    """Split PDF by page ranges. ranges format: '1-3,5,7-9' or 'all' for each page."""
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)
        reader = PdfReader(path)
        total = len(reader.pages)

        if ranges == "all":
            page_groups = [[i] for i in range(total)]
        else:
            page_groups = []
            for part in ranges.split(","):
                part = part.strip()
                if "-" in part:
                    start, end = part.split("-")
                    page_groups.append(list(range(int(start) - 1, int(end))))
                else:
                    page_groups.append([int(part) - 1])

        if len(page_groups) == 1:
            writer = PdfWriter()
            for pi in page_groups[0]:
                writer.add_page(reader.pages[pi])
            output = os.path.join(tmp, "split.pdf")
            with open(output, "wb") as out:
                writer.write(out)
            with open(output, "rb") as out:
                data = out.read()
            return StreamingResponse(
                io.BytesIO(data),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=split.pdf"},
            )
        else:
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, "w") as zf:
                for idx, group in enumerate(page_groups):
                    writer = PdfWriter()
                    for pi in group:
                        if 0 <= pi < total:
                            writer.add_page(reader.pages[pi])
                    buf = io.BytesIO()
                    writer.write(buf)
                    zf.writestr(f"split_{idx + 1}.pdf", buf.getvalue())
            zip_buffer.seek(0)
            return StreamingResponse(
                zip_buffer,
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=split_pages.zip"},
            )
    finally:
        cleanup_dir(tmp)


@router.post("/rotate")
async def rotate_pdf(
    file: UploadFile = File(...),
    angle: int = Form(90),
    pages: str = Form("all"),
):
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)
        reader = PdfReader(path)
        writer = PdfWriter()
        total = len(reader.pages)

        if pages == "all":
            target_pages = set(range(total))
        else:
            target_pages = set()
            for part in pages.split(","):
                part = part.strip()
                if "-" in part:
                    s, e = part.split("-")
                    target_pages.update(range(int(s) - 1, int(e)))
                else:
                    target_pages.add(int(part) - 1)

        for i, page in enumerate(reader.pages):
            if i in target_pages:
                page.rotate(angle)
            writer.add_page(page)

        output = os.path.join(tmp, "rotated.pdf")
        with open(output, "wb") as out:
            writer.write(out)
        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=rotated.pdf"},
        )
    finally:
        cleanup_dir(tmp)


@router.post("/organize")
async def organize_pdf(
    file: UploadFile = File(...),
    page_order: str = Form(...),
):
    """Reorder/remove pages. page_order: comma-separated page numbers, e.g. '3,1,2,5'"""
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)
        reader = PdfReader(path)
        writer = PdfWriter()

        order = [int(p.strip()) - 1 for p in page_order.split(",")]
        for pi in order:
            if 0 <= pi < len(reader.pages):
                writer.add_page(reader.pages[pi])

        output = os.path.join(tmp, "organized.pdf")
        with open(output, "wb") as out:
            writer.write(out)
        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=organized.pdf"},
        )
    finally:
        cleanup_dir(tmp)


@router.post("/crop")
async def crop_pdf(
    file: UploadFile = File(...),
    margin_left: float = Form(0),
    margin_right: float = Form(0),
    margin_top: float = Form(0),
    margin_bottom: float = Form(0),
    pages: str = Form("all"),
):
    """Crop PDF pages by adjusting margins (in points, 72pt = 1 inch)."""
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)
        reader = PdfReader(path)
        writer = PdfWriter()
        total = len(reader.pages)

        if pages == "all":
            target_pages = set(range(total))
        else:
            target_pages = set()
            for part in pages.split(","):
                part = part.strip()
                if "-" in part:
                    s, e = part.split("-")
                    target_pages.update(range(int(s) - 1, int(e)))
                else:
                    target_pages.add(int(part) - 1)

        for i, page in enumerate(reader.pages):
            if i in target_pages:
                box = page.mediabox
                page.mediabox.lower_left = (
                    float(box.lower_left[0]) + margin_left,
                    float(box.lower_left[1]) + margin_bottom,
                )
                page.mediabox.upper_right = (
                    float(box.upper_right[0]) - margin_right,
                    float(box.upper_right[1]) - margin_top,
                )
            writer.add_page(page)

        output = os.path.join(tmp, "cropped.pdf")
        with open(output, "wb") as out:
            writer.write(out)
        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=cropped.pdf"},
        )
    finally:
        cleanup_dir(tmp)
