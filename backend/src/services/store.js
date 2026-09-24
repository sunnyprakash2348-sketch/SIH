const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const FILES = {
  inspections: path.join(DATA_DIR, "inspections.json"),
  complaints: path.join(DATA_DIR, "complaints.json")
};

function ensureFile(filePath) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf-8");
}

function readAll(key) {
  ensureFile(FILES[key]);
  const raw = fs.readFileSync(FILES[key], "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(key, items) {
  ensureFile(FILES[key]);
  fs.writeFileSync(FILES[key], JSON.stringify(items, null, 2), "utf-8");
}

function add(key, item) {
  const items = readAll(key);
  items.unshift(item);
  writeAll(key, items);
  return item;
}

function update(key, id, patch) {
  const items = readAll(key);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  writeAll(key, items);
  return items[idx];
}

function getById(key, id) {
  return readAll(key).find((i) => i.id === id) || null;
}

module.exports = { readAll, writeAll, add, update, getById };
