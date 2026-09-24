const { createWorker } = require("tesseract.js");
const sharp = require("sharp");

/**
 * Performance note:
 * Spinning up a fresh Tesseract worker per request is the single biggest
 * source of latency in this pipeline (worker init + model load can take
 * seconds). We instead keep ONE worker warm for the lifetime of the server
 * and serialize requests through a tiny promise queue, since a single
 * Tesseract worker can only run one recognition job at a time. This makes
 * every request after the first dramatically faster.
 */
let workerPromise = null;
let queue = Promise.resolve();

function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng");
  }
  return workerPromise;
}

function enqueue(task) {
  const result = queue.then(task, task);
  // Swallow errors in the queue chain itself so one failure doesn't wedge future jobs
  queue = result.catch(() => {});
  return result;
}

/**
 * Runs OCR on an image buffer using Tesseract.js.
 * 100% free and open-source — no API key, no external network call at runtime
 * beyond the one-time language model download that Tesseract.js caches locally.
 */
async function runOCR(imageBuffer) {
  return enqueue(async () => {
    // Light preprocessing improves OCR accuracy on real-world label photos:
    // upscale small images, grayscale, and normalize contrast.
    const preprocessed = await sharp(imageBuffer)
      .resize({ width: 1800, withoutEnlargement: false })
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();

    const worker = await getWorker();
    const { data } = await worker.recognize(preprocessed);

    // Per-word confidences let us reason about *which* regions were unreadable,
    // not just an overall number — used to power "manual check suggested" flags.
    const words = (data.words || []).map((w) => ({ text: w.text, confidence: w.confidence }));

    return {
      text: data.text || "",
      confidence: data.confidence ?? null,
      words
    };
  });
}

async function shutdownOCR() {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
}

module.exports = { runOCR, shutdownOCR };
