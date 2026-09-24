import { Eye } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function CheckRow({ check }) {
  return (
    <div className="ledger-row py-4 flex items-start gap-4">
      <div className="w-16 shrink-0 pt-0.5 flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${check.severity === "critical" ? "bg-violation" : "bg-review"}`}
          title={check.severity === "critical" ? "Critical requirement" : "Moderate requirement"}
        />
        <span className="text-xs font-semibold text-brass-dark">{check.id}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{check.name}</p>
        <p className="text-xs text-ink/50 mt-0.5">{check.requirement}</p>
        {check.evidence && (
          <p className="text-xs text-white/80 mt-1.5 bg-white/10 inline-block px-2 py-1 rounded-sm">
            Evidence: "{check.evidence}"
          </p>
        )}
        {!check.evidence && check.note && <p className="text-xs text-ink/40 mt-1.5 italic">{check.note}</p>}
        {check.manualCheckSuggested && (
          <p className="text-xs text-review mt-1.5 flex items-center gap-1.5 bg-review/10 border border-review/30 inline-flex px-2 py-1 rounded-sm">
            <Eye size={12} /> Low image confidence — inspector should verify this manually
          </p>
        )}
      </div>
      <div className="shrink-0 pt-0.5">
        <StatusBadge status={check.status} />
      </div>
    </div>
  );
}
