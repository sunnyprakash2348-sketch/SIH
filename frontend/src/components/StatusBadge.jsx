const STYLES = {
  PASS: "bg-verified/10 text-verified border-verified/30",
  FAIL: "bg-violation/10 text-violation border-violation/30",
  REVIEW: "bg-review/10 text-review border-review/30",
  NA: "bg-ink/5 text-ink/50 border-ink/10",
  COMPLIANT: "bg-verified/10 text-verified border-verified/30",
  NON_COMPLIANT: "bg-violation/10 text-violation border-violation/30",
  NEEDS_REVIEW: "bg-review/10 text-review border-review/30"
};

const LABELS = {
  PASS: "Pass",
  FAIL: "Fail",
  REVIEW: "Review",
  NA: "N/A",
  COMPLIANT: "Compliant",
  NON_COMPLIANT: "Non-compliant",
  NEEDS_REVIEW: "Needs review"
};

export default function StatusBadge({ status, size = "md" }) {
  const pad = size === "lg" ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border font-semibold tracking-wide ${pad} ${
        STYLES[status] || STYLES.NA
      }`}
    >
      {LABELS[status] || status}
    </span>
  );
}
