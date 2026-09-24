import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { UploadCloud, Landmark, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Inspections, Complaints } from "../api/client";

const CATEGORIES = [
  { value: "food_perishable", label: "Food — Perishable" },
  { value: "food_packaged", label: "Food — Packaged" },
  { value: "beverage", label: "Beverage" },
  { value: "cosmetics", label: "Cosmetics / Personal Care" },
  { value: "electronics", label: "Electronics" },
  { value: "other", label: "Other" }
];

const VERDICT_COPY = {
  COMPLIANT: {
    icon: ShieldCheck,
    tone: "text-verified",
    title: "This label looks compliant",
    body: "All statutory declarations we checked were found on the label."
  },
  NEEDS_REVIEW: {
    icon: ShieldQuestion,
    tone: "text-review",
    title: "Some declarations need a closer look",
    body: "A few required details weren't clearly readable. This isn't necessarily a violation — a Legal Metrology officer can verify it."
  },
  NON_COMPLIANT: {
    icon: ShieldAlert,
    tone: "text-violation",
    title: "This label is missing required information",
    body: "One or more mandatory declarations under the Legal Metrology Rules appear to be missing."
  }
};

export default function ConsumerScan() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [category, setCategory] = useState("food_packaged");
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [complaintSent, setComplaintSent] = useState(false);
  const [contact, setContact] = useState("");
  const fileInput = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);
    formData.append("productName", productName || "Consumer-submitted product");
    formData.append("officerName", "Consumer Self-Check");
    try {
      const inspection = await Inspections.create(formData);
      setResult(inspection);
    } finally {
      setLoading(false);
    }
  }

  async function fileComplaint() {
    await Complaints.create({
      productName: result.productName,
      issue: `Auto-flagged as ${result.verdict} (score ${result.score}%). Failed checks: ${result.checks
        .filter((c) => c.status === "FAIL")
        .map((c) => c.id)
        .join(", ")}`,
      contact,
      inspectionId: result.id
    });
    setComplaintSent(true);
  }

  const copy = result ? VERDICT_COPY[result.verdict] : null;
  const Icon = copy?.icon;
  const failedChecks = result?.checks.filter((c) => c.status === "FAIL") || [];

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-black/50 backdrop-blur-xl border-b border-white/10 text-ink px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark size={20} className="text-brass" />
          <span className="font-display font-semibold text-sm">Consumer Product Check</span>
        </div>
        <Link to="/login" className="text-xs text-ink/50 hover:text-ink">
          Legal Metrology Officer? Sign in
        </Link>
      </header>

      <div className="max-w-lg mx-auto px-4 py-10">
        {!result && (
          <>
            <h1 className="text-xl font-semibold text-white mb-1">Check a product label</h1>
            <p className="text-sm text-ink/50 mb-6">
              Upload a photo of a product you bought to see if its label meets Indian legal disclosure
              requirements.
            </p>
            <form onSubmit={handleSubmit} className="glass p-6 space-y-4">
              <div
                onClick={() => fileInput.current.click()}
                className="border-2 border-dashed border-white/20 hover:border-white/50 cursor-pointer flex flex-col items-center justify-center py-8"
              >
                {preview ? (
                  <img src={preview} className="max-h-48 object-contain" alt="preview" />
                ) : (
                  <>
                    <UploadCloud size={26} className="text-ink/40 mb-2" />
                    <p className="text-sm text-ink/60">Tap to upload a photo of the label</p>
                  </>
                )}
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setFile(f);
                    setPreview(URL.createObjectURL(f));
                  }
                }}
              />
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Product name (optional)"
                className="w-full input-glass"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full input-glass bg-white/5"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                disabled={loading || !file}
                className="w-full btn-primary py-3 text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Checking…" : "Check this label"}
              </button>
            </form>
          </>
        )}

        {result && (
          <div className="glass p-6">
            <div className="flex items-center gap-3 mb-3">
              <Icon size={28} className={copy.tone} />
              <div>
                <h2 className={`font-semibold ${copy.tone}`}>{copy.title}</h2>
                <p className="text-xs text-ink/50">{copy.body}</p>
              </div>
            </div>

            {failedChecks.length > 0 && (
              <ul className="text-sm text-ink/70 list-disc pl-5 space-y-1 mb-4">
                {failedChecks.map((c) => (
                  <li key={c.id}>{c.requirement}</li>
                ))}
              </ul>
            )}

            {result.verdict !== "COMPLIANT" && !complaintSent && (
              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-sm text-ink/60 mb-2">Want to report this to Legal Metrology?</p>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Your phone or email (optional)"
                  className="w-full input-glass mb-2"
                />
                <button
                  onClick={fileComplaint}
                  className="w-full border border-violation text-violation py-2.5 text-sm font-medium hover:bg-violation/10"
                >
                  Submit Complaint
                </button>
              </div>
            )}
            {complaintSent && <p className="text-sm text-verified mt-4">Complaint submitted. Thank you.</p>}

            <button
              onClick={() => {
                setResult(null);
                setFile(null);
                setPreview(null);
                setComplaintSent(false);
              }}
              className="w-full mt-4 text-sm text-ink/50 hover:text-ink"
            >
              Check another product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
