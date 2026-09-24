import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Inspections, Analytics } from "../api/client";
import StatusBadge from "../components/StatusBadge";

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="glass p-5 flex items-center gap-4">
      <div className={`p-2.5 rounded-sm ${tone}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-display font-semibold text-white">{value}</p>
        <p className="text-xs text-ink/50">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Analytics.summary().then(setSummary);
    Inspections.list().then((items) => setRecent(items.slice(0, 6)));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-ink/50 mt-1">Overview of packaged commodity inspections</p>
        </div>
        <Link
          to="/inspect"
          className="flex items-center gap-2 btn-primary px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <PlusCircle size={16} /> New Inspection
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={Clock} label="Total inspections" value={summary?.totalInspections ?? "—"} tone="bg-white/10 text-ink" />
        <StatCard
          icon={CheckCircle2}
          label="Compliant"
          value={summary?.verdictCounts?.COMPLIANT ?? "—"}
          tone="bg-verified/10 text-verified"
        />
        <StatCard
          icon={AlertTriangle}
          label="Non-compliant"
          value={summary?.verdictCounts?.NON_COMPLIANT ?? "—"}
          tone="bg-violation/10 text-violation"
        />
        <StatCard
          icon={AlertTriangle}
          label="Needs review"
          value={summary?.verdictCounts?.NEEDS_REVIEW ?? "—"}
          tone="bg-review/10 text-review"
        />
      </div>

      <div className="glass p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Recent inspections</h2>
        {recent.length === 0 && (
          <p className="text-sm text-ink/40">No inspections yet. Start with "New Inspection" above.</p>
        )}
        <div>
          {recent.map((i) => (
            <Link
              key={i.id}
              to={`/results/${i.id}`}
              className="ledger-row py-3 flex items-center justify-between hover:bg-white/5 -mx-2 px-2"
            >
              <div>
                <p className="text-sm font-medium text-ink">{i.productName}</p>
                <p className="text-xs text-ink/40">{new Date(i.createdAt).toLocaleString()} · {i.officerName}</p>
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
