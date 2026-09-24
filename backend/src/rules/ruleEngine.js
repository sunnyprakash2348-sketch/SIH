const rules = require("../config/rules.json");

const PERISHABLE_CATEGORIES = new Set(["food_perishable", "food_packaged", "beverage", "dairy", "bakery"]);

// Below this OCR confidence, we no longer trust a FAIL/REVIEW verdict as "the
// text genuinely isn't there" — it might just be unreadable in the photo. In
// that case we tell the officer to physically check the field instead of
// silently trusting (or silently dismissing) the OCR result.
const LOW_CONFIDENCE_THRESHOLD = 65;
const VERY_LOW_CONFIDENCE_THRESHOLD = 40;

function isPerishable(category) {
  return PERISHABLE_CATEGORIES.has(category);
}

/**
 * Evaluates a single rule against extracted fields.
 * Returns { status: 'PASS'|'FAIL'|'REVIEW'|'NA', evidence, note }
 */
function evaluateRule(rule, fields) {
  const value = fields[rule.field];

  if (rule.appliesTo === "perishable" && !isPerishable(fields.category)) {
    return { status: "NA", evidence: null, note: rule.naCondition || "Not applicable for this product category." };
  }

  switch (rule.id) {
    case "LM-001":
      if (!value) return { status: "FAIL", evidence: null, note: rule.failCondition };
      if (value.length < 20) return { status: "REVIEW", evidence: value, note: rule.reviewCondition };
      return { status: "PASS", evidence: value, note: "Manufacturer/packer details found." };

    case "LM-002":
      if (fields.isDomestic) return { status: "NA", evidence: value, note: rule.naCondition };
      if (!value) return { status: "REVIEW", evidence: null, note: rule.reviewCondition };
      return { status: "PASS", evidence: value, note: "Country of origin declared." };

    case "LM-003":
      if (!value) return { status: "REVIEW", evidence: null, note: rule.reviewCondition };
      return { status: "PASS", evidence: value, note: "Generic name declared." };

    case "LM-004":
      if (!value) return { status: "FAIL", evidence: null, note: rule.failCondition };
      return { status: "PASS", evidence: value, note: "Net quantity declared in SI units." };

    case "LM-005":
      if (!value) return { status: "FAIL", evidence: null, note: rule.failCondition };
      return { status: "PASS", evidence: value, note: "Manufacture/packing date declared." };

    case "LM-006":
      if (!value) return { status: "FAIL", evidence: null, note: rule.failCondition };
      return { status: "PASS", evidence: value, note: "Best-before/expiry date declared." };

    case "LM-007":
      if (!value) return { status: "FAIL", evidence: null, note: rule.failCondition };
      return { status: "PASS", evidence: value, note: "MRP declared." };

    case "LM-008":
      if (!fields.mrp) return { status: "NA", evidence: null, note: rule.naCondition };
      if (!value) return { status: "REVIEW", evidence: null, note: rule.reviewCondition };
      return { status: "PASS", evidence: value, note: "Tax-inclusive wording found near MRP." };

    case "LM-009":
      if (!value) return { status: "FAIL", evidence: null, note: rule.failCondition };
      return { status: "PASS", evidence: value, note: "Consumer care contact found." };

    default:
      return { status: "REVIEW", evidence: null, note: "Unknown rule — manual check required." };
  }
}

/**
 * Runs all rules against extracted fields and computes an overall verdict + score.
 * @param {object} fields - structured fields from the extractor
 * @param {number|null} ocrConfidence - overall OCR confidence (0-100) for this image
 */
function runCompliance(fields, ocrConfidence = null) {
  const lowConfidence = ocrConfidence !== null && ocrConfidence < LOW_CONFIDENCE_THRESHOLD;
  const veryLowConfidence = ocrConfidence !== null && ocrConfidence < VERY_LOW_CONFIDENCE_THRESHOLD;

  const results = rules.map((rule) => {
    const outcome = evaluateRule(rule, fields);
    // Only FAIL/REVIEW outcomes are candidates for "maybe it's just unreadable" —
    // a PASS or NA doesn't need a human to double check it.
    const manualCheckSuggested = lowConfidence && (outcome.status === "FAIL" || outcome.status === "REVIEW");
    return {
      id: rule.id,
      name: rule.name,
      requirement: rule.requirement,
      severity: rule.severity,
      icon: rule.icon,
      passCondition: rule.passCondition,
      reviewCondition: rule.reviewCondition,
      failCondition: rule.failCondition,
      naCondition: rule.naCondition,
      ...outcome,
      manualCheckSuggested
    };
  });

  const hasFail = results.some((r) => r.status === "FAIL");
  const hasReview = results.some((r) => r.status === "REVIEW");

  let verdict = "COMPLIANT";
  if (hasFail) verdict = "NON_COMPLIANT";
  else if (hasReview) verdict = "NEEDS_REVIEW";

  const applicable = results.filter((r) => r.status !== "NA");
  const points = applicable.reduce((sum, r) => {
    if (r.status === "PASS") return sum + 1;
    if (r.status === "REVIEW") return sum + 0.5;
    return sum;
  }, 0);
  const score = applicable.length ? Math.round((points / applicable.length) * 100) : 100;

  const flaggedRuleIds = results.filter((r) => r.manualCheckSuggested).map((r) => r.id);
  const manualReview = {
    suggested: lowConfidence,
    severity: veryLowConfidence ? "high" : lowConfidence ? "moderate" : "none",
    reason: veryLowConfidence
      ? `OCR confidence was very low (${Math.round(ocrConfidence)}%). The photo may be blurry, poorly lit, or at an angle — a full manual inspection of the physical package is recommended.`
      : lowConfidence
      ? `OCR confidence was low (${Math.round(ocrConfidence)}%) for this image. The flagged fields below should be manually verified against the physical package rather than trusted as-is.`
      : null,
    flaggedRuleIds
  };

  return { verdict, score, results, manualReview };
}

module.exports = { runCompliance, rules, isPerishable, LOW_CONFIDENCE_THRESHOLD };
