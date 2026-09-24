import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Inspections } from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function History() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [verdict, setVerdict] = useState("");

  function load() {
    const params = {};
    if (q) params.q = q;
    if (verdict) params.verdict = verdict;
    Inspections.list(params).then(setItems);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-1">Inspection History</h1>
      <p className="text-sm text-ink/50 mb-6">Chronological log of all inspections performed.</p>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search by product or manufacturer…"
            className="w-full input-glass pl-9"
          />
        </div>
        <select
          value={verdict}
          onChange={(e) => {
            setVerdict(e.target.value);
          }}
          className="input-glass bg-white/5"
        >
          <option value="">All verdicts</option>
          <option value="COMPLIANT">Compliant</option>
          <option value="NON_COMPLIANT">Non-compliant</option>
          <option value="NEEDS_REVIEW">Needs review</option>
        </select>
        <button onClick={load} className="btn-primary px-4 py-2 text-sm">
          Filter
        </button>
      </div>

      <div className="glass">
        {items.length === 0 && <p className="text-sm text-ink/40 p-6">No inspections match this filter.</p>}
        <div className="px-6">
          {items.map((i) => (
            <Link
              key={i.id}
              to={`/results/${i.id}`}
              className="ledger-row py-3 flex items-center justify-between hover:bg-white/5 -mx-2 px-2"
            >
              <div>
                <p className="text-sm font-medium text-ink">{i.productName}</p>
                <p className="text-xs text-ink/40">
                  {new Date(i.createdAt).toLocaleString()} · {i.category.replace("_", " ")} · {i.officerName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-display font-semibold text-white">{i.score}%</span>
                <StatusBadge status={i.verdict} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
