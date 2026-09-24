const express = require("express");
const store = require("../services/store");

const router = express.Router();

router.get("/summary", (req, res) => {
  const inspections = store.readAll("inspections");
  const complaints = store.readAll("complaints");

  const total = inspections.length;
  const verdictCounts = { COMPLIANT: 0, NON_COMPLIANT: 0, NEEDS_REVIEW: 0 };
  const categoryCounts = {};
  const ruleFailCounts = {};
  const trendByDate = {};
  let manualReviewCount = 0;

  for (const insp of inspections) {
    verdictCounts[insp.verdict] = (verdictCounts[insp.verdict] || 0) + 1;
    categoryCounts[insp.category] = (categoryCounts[insp.category] || 0) + 1;
    if (insp.manualReview?.suggested) manualReviewCount += 1;

    const day = insp.createdAt.slice(0, 10);
    trendByDate[day] = trendByDate[day] || { date: day, compliant: 0, nonCompliant: 0, review: 0 };
    if (insp.verdict === "COMPLIANT") trendByDate[day].compliant += 1;
    if (insp.verdict === "NON_COMPLIANT") trendByDate[day].nonCompliant += 1;
    if (insp.verdict === "NEEDS_REVIEW") trendByDate[day].review += 1;

    for (const check of insp.checks) {
      if (check.status === "FAIL") {
        ruleFailCounts[check.id] = (ruleFailCounts[check.id] || 0) + 1;
      }
    }
  }

  const topFailedRules = Object.entries(ruleFailCounts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);

  const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));
  const trend = Object.values(trendByDate).sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    totalInspections: total,
    totalComplaints: complaints.length,
    manualReviewCount,
    verdictCounts,
    categoryBreakdown,
    topFailedRules,
    trend
  });
});

module.exports = router;
