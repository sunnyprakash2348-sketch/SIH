require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const inspectionsRouter = require("./routes/inspections");
const complaintsRouter = require("./routes/complaints");
const analyticsRouter = require("./routes/analytics");
const authRouter = require("./routes/auth");
const { UPLOAD_DIR } = require("./middleware/upload");
const { runOCR, shutdownOCR } = require("./services/ocrService");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "PCCS backend" }));

app.use("/api/auth", authRouter);
app.use("/api/inspections", inspectionsRouter);
app.use("/api/complaints", complaintsRouter);
app.use("/api/analytics", analyticsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error", detail: err.message });
});

app.listen(PORT, () => {
  console.log(`PCCS backend running on http://localhost:${PORT}`);
  console.log("Warming up OCR worker in the background (keeps later requests fast)...");
  // Fire-and-forget warmup: initializes the Tesseract worker so the FIRST real
  // inspection request doesn't pay the multi-second cold-start cost.
  const tinyBlankPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64"
  );
  runOCR(tinyBlankPng)
    .then(() => console.log("OCR worker ready."))
    .catch((err) => console.warn("OCR warmup failed (will retry on first real request):", err.message));
});

process.on("SIGINT", async () => {
  await shutdownOCR();
  process.exit(0);
});
