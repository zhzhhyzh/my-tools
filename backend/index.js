const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");

const app = express();
const PORT = 3001;
const PYTHON_SERVICE = "http://localhost:5000";

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB limit

// Helper: forward request with files to Python service
async function forwardToPython(endpoint, files, fields = {}, res) {
  const form = new FormData();

  // Attach files
  if (Array.isArray(files)) {
    files.forEach((f) => {
      form.append("files", fs.createReadStream(f.path), f.originalname);
    });
  } else if (files) {
    form.append("file", fs.createReadStream(files.path), files.originalname);
  }

  // Attach form fields
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      form.append(key, String(value));
    }
  });

  try {
    const response = await axios.post(`${PYTHON_SERVICE}${endpoint}`, form, {
      headers: form.getHeaders(),
      responseType: "stream",
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 300000,
    });

    // Forward headers
    if (response.headers["content-type"]) {
      res.setHeader("Content-Type", response.headers["content-type"]);
    }
    if (response.headers["content-disposition"]) {
      res.setHeader("Content-Disposition", response.headers["content-disposition"]);
    }

    response.data.pipe(res);
  } catch (error) {
    const status = error.response?.status || 500;
    const msg = error.response?.data || error.message;
    res.status(status).json({ error: "Processing failed", details: String(msg) });
  } finally {
    // Cleanup uploaded files
    cleanupFiles(files);
  }
}

function cleanupFiles(files) {
  const arr = Array.isArray(files) ? files : files ? [files] : [];
  arr.forEach((f) => {
    try { fs.unlinkSync(f.path); } catch (e) { /* ignore */ }
  });
}

// ==================== ORGANIZE ROUTES ====================

app.post("/api/merge", upload.array("files", 50), (req, res) => {
  forwardToPython("/merge", req.files, {}, res);
});

app.post("/api/split", upload.single("file"), (req, res) => {
  forwardToPython("/split", req.file, { ranges: req.body.ranges }, res);
});

app.post("/api/rotate", upload.single("file"), (req, res) => {
  forwardToPython("/rotate", req.file, {
    angle: req.body.angle,
    pages: req.body.pages,
  }, res);
});

app.post("/api/organize", upload.single("file"), (req, res) => {
  forwardToPython("/organize", req.file, { page_order: req.body.page_order }, res);
});

app.post("/api/crop", upload.single("file"), (req, res) => {
  forwardToPython("/crop", req.file, {
    margin_left: req.body.margin_left,
    margin_right: req.body.margin_right,
    margin_top: req.body.margin_top,
    margin_bottom: req.body.margin_bottom,
    pages: req.body.pages,
  }, res);
});

// ==================== OPTIMIZE ROUTES ====================

app.post("/api/compress", upload.single("file"), (req, res) => {
  forwardToPython("/compress", req.file, { level: req.body.level }, res);
});

app.post("/api/repair", upload.single("file"), (req, res) => {
  forwardToPython("/repair", req.file, {}, res);
});

// ==================== CONVERT ROUTES ====================

app.post("/api/pdf-to-word", upload.single("file"), (req, res) => {
  forwardToPython("/pdf-to-word", req.file, {}, res);
});

app.post("/api/pdf-to-ppt", upload.single("file"), (req, res) => {
  forwardToPython("/pdf-to-ppt", req.file, {}, res);
});

app.post("/api/pdf-to-excel", upload.single("file"), (req, res) => {
  forwardToPython("/pdf-to-excel", req.file, {}, res);
});

app.post("/api/word-to-pdf", upload.single("file"), (req, res) => {
  forwardToPython("/word-to-pdf", req.file, {}, res);
});

app.post("/api/ppt-to-pdf", upload.single("file"), (req, res) => {
  forwardToPython("/ppt-to-pdf", req.file, {}, res);
});

app.post("/api/excel-to-pdf", upload.single("file"), (req, res) => {
  forwardToPython("/excel-to-pdf", req.file, {}, res);
});

app.post("/api/pdf-to-jpg", upload.single("file"), (req, res) => {
  forwardToPython("/pdf-to-jpg", req.file, {
    dpi: req.body.dpi,
    pages: req.body.pages,
  }, res);
});

app.post("/api/jpg-to-pdf", upload.array("files", 100), (req, res) => {
  forwardToPython("/jpg-to-pdf", req.files, {}, res);
});

app.post("/api/html-to-pdf", (req, res) => {
  const form = new FormData();
  if (req.body.url) form.append("url", req.body.url);
  if (req.body.html_content) form.append("html_content", req.body.html_content);

  axios.post(`${PYTHON_SERVICE}/html-to-pdf`, form, {
    headers: form.getHeaders(),
    responseType: "stream",
    timeout: 120000,
  }).then((response) => {
    if (response.headers["content-type"]) res.setHeader("Content-Type", response.headers["content-type"]);
    if (response.headers["content-disposition"]) res.setHeader("Content-Disposition", response.headers["content-disposition"]);
    response.data.pipe(res);
  }).catch((error) => {
    res.status(500).json({ error: "Conversion failed", details: error.message });
  });
});

app.post("/api/pdf-to-pdfa", upload.single("file"), (req, res) => {
  forwardToPython("/pdf-to-pdfa", req.file, {}, res);
});

// ==================== EDIT ROUTES ====================

app.post("/api/watermark", upload.single("file"), (req, res) => {
  forwardToPython("/watermark", req.file, {
    text: req.body.text,
    font_size: req.body.font_size,
    opacity: req.body.opacity,
    angle: req.body.angle,
    color: req.body.color,
  }, res);
});

app.post("/api/page-numbers", upload.single("file"), (req, res) => {
  forwardToPython("/page-numbers", req.file, {
    position: req.body.position,
    start_number: req.body.start_number,
    font_size: req.body.font_size,
    margin: req.body.margin,
  }, res);
});

app.post("/api/redact", upload.single("file"), (req, res) => {
  forwardToPython("/redact", req.file, {
    search_text: req.body.search_text,
    areas: req.body.areas,
  }, res);
});

app.post("/api/edit", upload.single("file"), (req, res) => {
  forwardToPython("/edit", req.file, { operations: req.body.operations }, res);
});

// ==================== SECURITY ROUTES ====================

app.post("/api/unlock", upload.single("file"), (req, res) => {
  forwardToPython("/unlock", req.file, { password: req.body.password }, res);
});

app.post("/api/protect", upload.single("file"), (req, res) => {
  forwardToPython("/protect", req.file, { password: req.body.password }, res);
});

// ==================== INTELLIGENCE ROUTES ====================

app.post("/api/ocr", upload.single("file"), (req, res) => {
  forwardToPython("/ocr", req.file, { language: req.body.language }, res);
});

app.post("/api/compare", upload.array("files", 2), (req, res) => {
  forwardToPython("/compare", req.files, {}, res);
});

// ==================== HEALTH CHECK ====================

app.get("/api/health", async (req, res) => {
  try {
    const pyHealth = await axios.get(`${PYTHON_SERVICE}/health`, { timeout: 5000 });
    res.json({ backend: "ok", processing: pyHealth.data });
  } catch (err) {
    res.json({ backend: "ok", processing: "unavailable" });
  }
});

// ==================== STATIC FRONTEND (PRODUCTION) ====================

const frontendDist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`PDF Tools running on http://localhost:${PORT}`);
});
