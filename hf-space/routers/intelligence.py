"""Intelligence PDF operations: OCR, Compare."""
import os
import io
import json
from typing import List
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import StreamingResponse, JSONResponse
from utils.file_utils import get_temp_dir, cleanup_dir, save_upload

router = APIRouter()


@router.post("/ocr")
async def ocr_pdf(
    file: UploadFile = File(...),
    language: str = Form("eng"),
):
    """OCR a scanned PDF and produce a searchable PDF."""
    tmp = get_temp_dir()
    try:
        path = await save_upload(file, tmp)
        from pdf2image import convert_from_path
        import pytesseract
        from pypdf import PdfWriter, PdfReader
        from reportlab.pdfgen import canvas as rl_canvas
        from reportlab.lib.units import inch

        images = convert_from_path(path, dpi=300)
        writer = PdfWriter()

        for idx, img in enumerate(images):
            w_px, h_px = img.size
            w_pt = w_px * 72 / 300
            h_pt = h_px * 72 / 300

            # Save image
            img_path = os.path.join(tmp, f"ocr_page_{idx}.png")
            img.save(img_path, "PNG")

            # Create PDF page with image
            page_pdf = os.path.join(tmp, f"ocr_p_{idx}.pdf")
            c = rl_canvas.Canvas(page_pdf, pagesize=(w_pt, h_pt))
            c.drawImage(img_path, 0, 0, width=w_pt, height=h_pt)

            # Overlay OCR text (invisible but searchable)
            ocr_data = pytesseract.image_to_data(
                img, lang=language, output_type=pytesseract.Output.DICT
            )
            c.setFillColorRGB(1, 1, 1, alpha=0)
            for i in range(len(ocr_data["text"])):
                text = ocr_data["text"][i].strip()
                if text:
                    x = ocr_data["left"][i] * 72 / 300
                    y = h_pt - (ocr_data["top"][i] + ocr_data["height"][i]) * 72 / 300
                    fs = max(ocr_data["height"][i] * 72 / 300 * 0.8, 4)
                    c.setFont("Helvetica", fs)
                    c.drawString(x, y, text)

            c.save()
            page_reader = PdfReader(page_pdf)
            writer.add_page(page_reader.pages[0])

        output = os.path.join(tmp, "ocr_output.pdf")
        with open(output, "wb") as out:
            writer.write(out)
        with open(output, "rb") as out:
            data = out.read()
        return StreamingResponse(
            io.BytesIO(data),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=ocr_output.pdf"},
        )
    finally:
        cleanup_dir(tmp)


@router.post("/compare")
async def compare_pdfs(files: List[UploadFile] = File(...)):
    """Compare two PDFs and return differences as JSON."""
    tmp = get_temp_dir()
    try:
        if len(files) < 2:
            return JSONResponse({"error": "Two PDF files required"}, status_code=400)

        path1 = await save_upload(files[0], tmp, "file1.pdf")
        path2 = await save_upload(files[1], tmp, "file2.pdf")

        import pdfplumber

        differences = []
        with pdfplumber.open(path1) as pdf1, pdfplumber.open(path2) as pdf2:
            max_pages = max(len(pdf1.pages), len(pdf2.pages))
            for i in range(max_pages):
                text1 = pdf1.pages[i].extract_text() if i < len(pdf1.pages) else ""
                text2 = pdf2.pages[i].extract_text() if i < len(pdf2.pages) else ""

                if text1 != text2:
                    lines1 = (text1 or "").split("\n")
                    lines2 = (text2 or "").split("\n")
                    page_diff = {
                        "page": i + 1,
                        "file1_lines": len(lines1),
                        "file2_lines": len(lines2),
                        "differences": [],
                    }
                    max_lines = max(len(lines1), len(lines2))
                    for j in range(max_lines):
                        l1 = lines1[j] if j < len(lines1) else ""
                        l2 = lines2[j] if j < len(lines2) else ""
                        if l1 != l2:
                            page_diff["differences"].append({
                                "line": j + 1,
                                "file1": l1,
                                "file2": l2,
                            })
                    differences.append(page_diff)

        return JSONResponse({
            "total_pages_file1": len(pdfplumber.open(path1).pages),
            "total_pages_file2": len(pdfplumber.open(path2).pages),
            "differences": differences,
            "identical": len(differences) == 0,
        })
    finally:
        cleanup_dir(tmp)
