/**
 * Extractor: turns raw OCR text into structured label fields.
 *
 * IMPORTANT ARCHITECTURAL NOTE:
 * This module only *reads* text and pattern-matches it into fields.
 * It never decides compliance. That is the rule engine's job (see rules/ruleEngine.js).
 * This separation is what makes the final verdict explainable and auditable.
 */

const MONTHS = "(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)";

function findMatch(text, regex) {
  const m = text.match(regex);
  return m ? m[0].trim() : null;
}

function findFirstGroup(text, regex) {
  const m = text.match(regex);
  return m ? m[1].trim() : null;
}

function extractManufacturerAddress(text) {
  // Look for "Mfd by / Marketed by / Manufactured by / Packed by" followed by text up to a line break or another keyword
  const regex = /(mfd\.?\s*by|manufactured\s*by|marketed\s*by|packed\s*by|packer)\s*[:\-]?\s*([^\n]{6,140})/i;
  const m = text.match(regex);
  if (m) return `${m[1]}: ${m[2]}`.trim();
  return null;
}

function extractCountryOfOrigin(text) {
  const regex = /(country\s*of\s*origin|made\s*in|origin)\s*[:\-]?\s*([a-zA-Z ]{3,40})/i;
  const m = text.match(regex);
  if (m) return m[2].trim();
  // If explicitly says "Made in India" it's domestic
  if (/made\s*in\s*india/i.test(text)) return "India";
  return null;
}

function isDomesticSignal(text) {
  return /made\s*in\s*india|manufactured\s*in\s*india|product\s*of\s*india/i.test(text);
}

function extractGenericName(text, brandGuessLine) {
  // Heuristic: look for common commodity nouns near the top of the label.
  const regex = /(contents?|generic\s*name|common\s*name)\s*[:\-]?\s*([a-zA-Z ]{3,40})/i;
  const m = text.match(regex);
  if (m) return m[2].trim();
  return null;
}

function extractNetQuantity(text) {
  const regex = /(net\s*(wt|weight|qty|quantity|volume|vol)\.?\s*[:\-]?\s*)?(\d+(\.\d+)?)\s*(kg|g|gm|gms|grams?|ml|millilitre|litre|l|ltr|liters?|n|pcs|pieces?)\b/i;
  const m = text.match(regex);
  if (m) return `${m[3]} ${m[5]}`.replace(/\s+/g, " ").trim();
  return null;
}

function extractDateNear(text, keywordsRegex) {
  // Look within ~60 chars after a keyword for a date-like token
  const dateToken = `(\\d{1,2}[\\/\\-.]\\d{1,2}[\\/\\-.]\\d{2,4}|${MONTHS}\\.?\\s*\\d{2,4}|\\d{2,4})`;
  const combined = new RegExp(`${keywordsRegex}[^\\n]{0,20}?${dateToken}`, "i");
  const m = text.match(combined);
  if (m) return m[0].trim();
  return null;
}

function extractManufactureDate(text) {
  return extractDateNear(text, "(mfg\\.?\\s*date|mfd\\.?\\s*date|manufactur(e|ing)\\s*date|pkd\\.?\\s*(on|date)|packing\\s*date|packed\\s*on)\\s*[:\\-]?");
}

function extractBestBeforeDate(text) {
  return extractDateNear(text, "(best\\s*before|use\\s*by|expiry|exp\\.?\\s*date|valid\\s*(upto|until))\\s*[:\\-]?");
}

function extractMRP(text) {
  const regex = /(mrp|m\.r\.p\.?|maximum\s*retail\s*price)\s*[:\-]?\s*(rs\.?|inr|₹)?\s*(\d+([.,]\d{1,2})?)/i;
  const m = text.match(regex);
  if (m) return `₹${m[3]}`;
  // fallback: any rupee-looking value
  const fallback = text.match(/(₹|rs\.?)\s*(\d+([.,]\d{1,2})?)/i);
  return fallback ? `₹${fallback[2]}` : null;
}

function extractTaxInclusiveText(text) {
  const regex = /(inclusive\s*of\s*all\s*taxes|incl\.?\s*of\s*all\s*taxes|all\s*taxes\s*included)/i;
  return findMatch(text, regex);
}

function extractConsumerCare(text) {
  const phone = text.match(/(\+?\d{1,3}[-\s]?)?\d{10}\b/);
  const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const keyword = /(consumer\s*care|customer\s*care|grievance|toll[-\s]?free|helpline)/i.test(text);
  const parts = [];
  if (keyword) parts.push("consumer-care section found");
  if (phone) parts.push(`phone: ${phone[0]}`);
  if (email) parts.push(`email: ${email[0]}`);
  return parts.length ? parts.join(", ") : null;
}

/**
 * Main entry point.
 * @param {string} rawText - raw OCR output
 * @param {string} category - product category selected by the officer (drives applicability, e.g. best-before)
 */
function extractFields(rawText, category = "other") {
  const text = rawText || "";
  return {
    rawText: text,
    category,
    manufacturerAddress: extractManufacturerAddress(text),
    countryOfOrigin: extractCountryOfOrigin(text),
    isDomestic: isDomesticSignal(text),
    genericName: extractGenericName(text),
    netQuantity: extractNetQuantity(text),
    manufactureDate: extractManufactureDate(text),
    bestBeforeDate: extractBestBeforeDate(text),
    mrp: extractMRP(text),
    taxInclusiveText: extractTaxInclusiveText(text),
    consumerCare: extractConsumerCare(text)
  };
}

module.exports = { extractFields };
