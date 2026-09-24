const express = require("express");
const path = require("path");
const { v4: uuid } = require("uuid");

const { upload, UPLOAD_DIR } = require("../middleware/upload");
const { runOCR } = require("../services/ocrService");
const { extractFields } = require("../services/extractor");
const { runCompliance } = require("../rules/ruleEngine");
const store = require("../services/store");

const router = express.Router();

// POST /api/inspections  (multipart: image, category, productName, officerName)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "An image file is required (field name: image)." });

    const category = req.body.category || "other";
    const productName = req.body.productName || "Unlabeled product";
    const officerName = req.body.officerName || "Unknown officer";

    const fs = require("fs");
    const imageBuffer = fs.readFileSync(req.file.path);

    const ocr = await runOCR(imageBuffer);
    const fields = extractFields(ocr.text, category);
    const compliance = runCompliance(fields, ocr.confidence);

    const inspection = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      officerName,
      productName,
      category,
      imagePath: `/uploads/${path.basename(req.file.path)}`,
      ocrConfidence: ocr.confidence,
      rawText: ocr.text,
      fields,
      verdict: compliance.verdict,
      score: compliance.score,
      checks: compliance.results,
      manualReview: compliance.manualReview
    };

    store.add("inspections", inspection);
    res.status(201).json(inspection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process inspection.", detail: err.message });
  }
});

// GET /api/inspections  (list, optional filters via query params)
router.get("/", (req, res) => {
  let items = store.readAll("inspections");
  const { verdict, category, q } = req.query;
  if (verdict) items = items.filter((i) => i.verdict === verdict);
  if (category) items = items.filter((i) => i.category === category);
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter(
      (i) =>
        i.productName.toLowerCase().includes(needle) ||
        (i.fields.manufacturerAddress || "").toLowerCase().includes(needle)
    );
  }
  res.json(items);
});

// GET /api/inspections/:id
router.get("/:id", (req, res) => {
  const item = store.getById("inspections", req.params.id);
  if (!item) return res.status(404).json({ error: "Inspection not found." });
  res.json(item);
});

module.exports = router;
