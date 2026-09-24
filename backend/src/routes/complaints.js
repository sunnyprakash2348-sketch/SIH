const express = require("express");
const { v4: uuid } = require("uuid");
const store = require("../services/store");

const router = express.Router();

// POST /api/complaints  { productName, issue, contact, inspectionId? }
router.post("/", (req, res) => {
  const { productName, issue, contact, inspectionId } = req.body;
  if (!productName || !issue) {
    return res.status(400).json({ error: "productName and issue are required." });
  }
  const complaint = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    productName,
    issue,
    contact: contact || null,
    inspectionId: inspectionId || null,
    status: "SUBMITTED"
  };
  store.add("complaints", complaint);
  res.status(201).json(complaint);
});

// GET /api/complaints
router.get("/", (req, res) => {
  res.json(store.readAll("complaints"));
});

module.exports = router;
