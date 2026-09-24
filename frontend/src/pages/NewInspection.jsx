import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { Inspections } from "../api/client";

const CATEGORIES = [
  { value: "food_perishable", label: "Food — Perishable" },
  { value: "food_packaged", label: "Food — Packaged/Ambient" },
  { value: "beverage", label: "Beverage" },
  { value: "cosmetics", label: "Cosmetics / Personal Care" },
  { value: "electronics", label: "Electronics" },
  { value: "hardware", label: "Hardware / Non-perishable goods" },
  { value: "other", label: "Other" }
];

const STAGES = [
  "Uploading label image",
  "Running OCR text extraction",
  "Parsing statutory fields",
  "Evaluating LM-001 to LM-009",
  "Compiling compliance report"
];

export default function NewInspection({ officer }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("food_packaged");
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  const fileInput = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!submitting) return;
    if (stage >= STAGES.length - 1) return;
    const t = setTimeout(() => setStage((s) => s + 1), 500);
    return () => clearTimeout(t);
  }, [submitting, stage]);

  function handleFile(f) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Please attach a photo of the package label.");
      return;
    }
    setError("");
    setSubmitting(true);
    setStage(0);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);
    formData.append("productName", productName || "Unlabeled product");
    formData.append("officerName", officer?.name || "Officer");

    try {
      const inspection = await Inspections.create(formData);
      setStage(STAGES.length - 1);
      setTimeout(() => navigate(`/results/${inspection.id}`), 400);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to process the inspection.");
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <div className="max-w-lg mx-auto mt-16 glass p-8">
        <h2 className="text-sm font-semibold text-white mb-6">Running compliance pipeline…</h2>
        <div className="space-y-4">
          {STAGES.map((label, idx) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  idx < stage ? "bg-verified border-verified" : idx === stage ? "border-brass animate-pulse" : "border-ink/15"
                }`}
              >
                {idx < stage && <span className="text-white text-[10px]">✓</span>}
              </div>
              <span className={`text-sm ${idx <= stage ? "text-ink" : "text-ink/30"}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-white mb-1">New Inspection</h1>
      <p className="text-sm text-ink/50 mb-6">Upload a photo of the product label to run a compliance check.</p>

      <form onSubmit={handleSubmit} className="glass p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-2">Label photo</label>
          <div
            onClick={() => fileInput.current.click()}
            className="border-2 border-dashed border-white/20 hover:border-white/50 transition-colors cursor-pointer flex flex-col items-center justify-center py-10 text-center"
          >
            {preview ? (
              <img src={preview} alt="Label preview" className="max-h-56 object-contain" />
            ) : (
              <>
                <UploadCloud size={28} className="text-ink/40 mb-2" />
                <p className="text-sm text-ink/60">Click to upload or drag a photo here</p>
                <p className="text-xs text-ink/30 mt-1">JPG or PNG, up to 8MB</p>
              </>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Product name</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Golden Wheat Biscuits 200g"
            className="w-full input-glass"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Product category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full input-glass bg-white/5" 
            >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} style={{ backgroundColor: 'black' }}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-ink/40 mt-1">Category determines whether best-before (LM-006) applies.</p>
        </div>

        {error && <p className="text-xs text-violation">{error}</p>}

        <button className="w-full btn-primary py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <ImageIcon size={16} /> Run Compliance Check
        </button>
      </form>
    </div>
  );
}
