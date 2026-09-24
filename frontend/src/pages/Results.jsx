import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, Eye } from "lucide-react";
import { Inspections } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import ScoreGauge from "../components/ScoreGauge";
import CheckRow from "../components/CheckRow";
import { apiUrl } from '../api';

export default function Results() {
  const { id } = useParams();
  const [inspection, setInspection] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError("");
    Inspections.get(id)
      .then((data) => {
        setInspection(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.error ||
            "Could not reach the backend. Check that the backend server (npm run dev in /backend) is still running."
        );
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p className="text-sm text-ink/50">Loading…</p>;

  if (error) {
    return (
      <div className="max-w-lg glass border-violation/30 p-6">
        <p className="text-sm text-violation font-medium mb-2">Couldn't load this inspection</p>
        <p className="text-sm text-ink/60 mb-4">{error}</p>
        <button onClick={load} className="btn-primary px-4 py-2 text-sm">
          Try again
        </button>
      </div>
    );
  }

  if (!inspection) return null;

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">{inspection.productName}</h1>
          <p className="text-sm text-ink/50 mt-1">
            Inspected {new Date(inspection.createdAt).toLocaleString()} by {inspection.officerName}
          </p>
        </div>
        <Link
          to={`/report/${inspection.id}`}
          className="flex items-center gap-2 border border-white/20 px-4 py-2 text-sm text-ink hover:bg-white/5"
        >
          <Printer size={16} /> View Report
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 glass p-6 flex items-center gap-6">
          <ScoreGauge score={inspection.score} />
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/40 mb-1">Overall determination</p>
            <StatusBadge status={inspection.verdict} size="lg" />
            <p className="text-xs text-ink/40 mt-3">
              Category: {inspection.category.replace("_", " ")} · OCR confidence:{" "}
              {inspection.ocrConfidence ? `${Math.round(inspection.ocrConfidence)}%` : "n/a"}
            </p>
          </div>
        </div>
        <div className="glass p-3 flex items-center justify-center">
          {inspection.imagePath ? (
            <img src={apiUrl(inspection.imagePath)} alt="Label" className="max-h-40 object-contain" />
          ) : (
            <p className="text-xs text-ink/30">No image</p>
          )}
        </div>
      </div>

      {inspection.manualReview?.suggested && (
        <div
          className={`glass p-4 mb-6 flex items-start gap-3 ${
            inspection.manualReview.severity === "high" ? "border-violation/40" : "border-review/40"
          }`}
        >
          <Eye
            size={18}
            className={`shrink-0 mt-0.5 ${
              inspection.manualReview.severity === "high" ? "text-violation" : "text-review"
            }`}
          />
          <div>
            <p
              className={`text-sm font-medium ${
                inspection.manualReview.severity === "high" ? "text-violation" : "text-review"
              }`}
            >
              Manual verification recommended
            </p>
            <p className="text-xs text-ink/60 mt-0.5">{inspection.manualReview.reason}</p>
          </div>
        </div>
      )}

      <div className="glass p-6">
        <h2 className="text-sm font-semibold text-white mb-2">Rule-by-rule assessment</h2>
        <div>
          {inspection.checks.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
        </div>
      </div>

      <p className="text-xs text-ink/40 mt-4">
        Prototype screening result. Final regulatory determination should be verified by an authorized Legal
        Metrology officer against current applicable regulations.
      </p>
    </div>
  );
}
