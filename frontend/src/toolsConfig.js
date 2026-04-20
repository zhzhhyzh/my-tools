// Tool definitions for all 25 PDF tools
export const toolCategories = [
  {
    name: "Organize PDF",
    color: "from-blue-500 to-blue-600",
    tools: [
      { id: "merge", name: "Merge PDF", desc: "Combine multiple PDFs into one", icon: "merge", accept: ".pdf", multiple: true, endpoint: "/api/merge", fields: [] },
      { id: "split", name: "Split PDF", desc: "Split PDF into separate files", icon: "split", accept: ".pdf", multiple: false, endpoint: "/api/split", fields: [{ name: "ranges", label: "Page ranges", placeholder: "e.g. 1-3,5,7-9 or 'all'", default: "all" }] },
      { id: "rotate", name: "Rotate PDF", desc: "Rotate PDF pages", icon: "rotate", accept: ".pdf", multiple: false, endpoint: "/api/rotate", fields: [{ name: "angle", label: "Angle", type: "select", options: ["90", "180", "270"], default: "90" }, { name: "pages", label: "Pages", placeholder: "all or 1,3,5", default: "all" }] },
      { id: "organize", name: "Organize PDF", desc: "Reorder or remove pages", icon: "organize", accept: ".pdf", multiple: false, endpoint: "/api/organize", fields: [{ name: "page_order", label: "Page order", placeholder: "e.g. 3,1,2,5", required: true }] },
      { id: "crop", name: "Crop PDF", desc: "Crop PDF page margins", icon: "crop", accept: ".pdf", multiple: false, endpoint: "/api/crop", fields: [{ name: "margin_left", label: "Left (pt)", type: "number", default: "0" }, { name: "margin_right", label: "Right (pt)", type: "number", default: "0" }, { name: "margin_top", label: "Top (pt)", type: "number", default: "0" }, { name: "margin_bottom", label: "Bottom (pt)", type: "number", default: "0" }] },
    ],
  },
  {
    name: "Optimize PDF",
    color: "from-green-500 to-green-600",
    tools: [
      { id: "compress", name: "Compress PDF", desc: "Reduce PDF file size", icon: "compress", accept: ".pdf", multiple: false, endpoint: "/api/compress", fields: [{ name: "level", label: "Compression", type: "select", options: ["low", "recommended", "extreme"], default: "recommended" }] },
      { id: "repair", name: "Repair PDF", desc: "Fix damaged PDF files", icon: "repair", accept: ".pdf", multiple: false, endpoint: "/api/repair", fields: [] },
    ],
  },
  {
    name: "Convert PDF",
    color: "from-orange-500 to-orange-600",
    tools: [
      { id: "pdf-to-word", name: "PDF to Word", desc: "Convert PDF to DOCX", icon: "word", accept: ".pdf", multiple: false, endpoint: "/api/pdf-to-word", fields: [] },
      { id: "pdf-to-ppt", name: "PDF to PowerPoint", desc: "Convert PDF to PPTX", icon: "ppt", accept: ".pdf", multiple: false, endpoint: "/api/pdf-to-ppt", fields: [] },
      { id: "pdf-to-excel", name: "PDF to Excel", desc: "Extract tables to XLSX", icon: "excel", accept: ".pdf", multiple: false, endpoint: "/api/pdf-to-excel", fields: [] },
      { id: "word-to-pdf", name: "Word to PDF", desc: "Convert DOCX to PDF", icon: "word", accept: ".doc,.docx", multiple: false, endpoint: "/api/word-to-pdf", fields: [] },
      { id: "ppt-to-pdf", name: "PowerPoint to PDF", desc: "Convert PPTX to PDF", icon: "ppt", accept: ".ppt,.pptx", multiple: false, endpoint: "/api/ppt-to-pdf", fields: [] },
      { id: "excel-to-pdf", name: "Excel to PDF", desc: "Convert XLSX to PDF", icon: "excel", accept: ".xls,.xlsx", multiple: false, endpoint: "/api/excel-to-pdf", fields: [] },
      { id: "pdf-to-jpg", name: "PDF to JPG", desc: "Convert PDF pages to images", icon: "image", accept: ".pdf", multiple: false, endpoint: "/api/pdf-to-jpg", fields: [{ name: "dpi", label: "Quality (DPI)", type: "select", options: ["72", "150", "300"], default: "150" }] },
      { id: "jpg-to-pdf", name: "JPG to PDF", desc: "Convert images to PDF", icon: "image", accept: ".jpg,.jpeg,.png,.bmp,.webp", multiple: true, endpoint: "/api/jpg-to-pdf", fields: [] },
      { id: "html-to-pdf", name: "HTML to PDF", desc: "Convert webpage to PDF", icon: "html", accept: null, multiple: false, endpoint: "/api/html-to-pdf", fields: [{ name: "url", label: "URL", placeholder: "https://example.com", required: true }], noFile: true },
      { id: "pdf-to-pdfa", name: "PDF to PDF/A", desc: "Convert to archival format", icon: "pdfa", accept: ".pdf", multiple: false, endpoint: "/api/pdf-to-pdfa", fields: [] },
    ],
  },
  {
    name: "Edit PDF",
    color: "from-purple-500 to-purple-600",
    tools: [
      { id: "watermark", name: "Watermark", desc: "Add text watermark to PDF", icon: "watermark", accept: ".pdf", multiple: false, endpoint: "/api/watermark", fields: [{ name: "text", label: "Watermark text", default: "WATERMARK" }, { name: "font_size", label: "Font size", type: "number", default: "60" }, { name: "opacity", label: "Opacity (0-1)", type: "number", default: "0.3" }, { name: "angle", label: "Angle", type: "number", default: "45" }, { name: "color", label: "Color", type: "select", options: ["gray", "red", "blue", "green", "black"], default: "gray" }] },
      { id: "page-numbers", name: "Page Numbers", desc: "Add page numbers to PDF", icon: "numbers", accept: ".pdf", multiple: false, endpoint: "/api/page-numbers", fields: [{ name: "position", label: "Position", type: "select", options: ["bottom-center", "bottom-left", "bottom-right", "top-center", "top-left", "top-right"], default: "bottom-center" }, { name: "start_number", label: "Start from", type: "number", default: "1" }] },
      { id: "edit", name: "Edit PDF", desc: "Add text overlays to PDF", icon: "edit", accept: ".pdf", multiple: false, endpoint: "/api/edit", fields: [{ name: "operations", label: "Operations (JSON)", placeholder: '[{"type":"text","page":1,"x":100,"y":100,"text":"Hello","fontSize":14}]', required: true, textarea: true }] },
      { id: "redact", name: "Redact PDF", desc: "Black out sensitive content", icon: "redact", accept: ".pdf", multiple: false, endpoint: "/api/redact", fields: [{ name: "search_text", label: "Text to redact", placeholder: "Enter text to find and redact" }] },
    ],
  },
  {
    name: "PDF Security",
    color: "from-red-500 to-red-600",
    tools: [
      { id: "unlock", name: "Unlock PDF", desc: "Remove password protection", icon: "unlock", accept: ".pdf", multiple: false, endpoint: "/api/unlock", fields: [{ name: "password", label: "Password", type: "password", placeholder: "Enter PDF password" }] },
      { id: "protect", name: "Protect PDF", desc: "Add password protection", icon: "lock", accept: ".pdf", multiple: false, endpoint: "/api/protect", fields: [{ name: "password", label: "Password", type: "password", required: true, placeholder: "Enter password" }] },
    ],
  },
  {
    name: "PDF Intelligence",
    color: "from-teal-500 to-teal-600",
    tools: [
      { id: "ocr", name: "OCR PDF", desc: "Make scanned PDFs searchable", icon: "ocr", accept: ".pdf", multiple: false, endpoint: "/api/ocr", fields: [{ name: "language", label: "Language", type: "select", options: ["eng", "fra", "deu", "spa", "ita", "por", "chi_sim", "jpn", "kor"], default: "eng" }] },
      { id: "compare", name: "Compare PDF", desc: "Compare two PDF documents", icon: "compare", accept: ".pdf", multiple: true, maxFiles: 2, endpoint: "/api/compare", fields: [] },
    ],
  },
];

export const allTools = toolCategories.flatMap((cat) =>
  cat.tools.map((tool) => ({ ...tool, category: cat.name, categoryColor: cat.color }))
);

export function getToolById(id) {
  return allTools.find((t) => t.id === id);
}
