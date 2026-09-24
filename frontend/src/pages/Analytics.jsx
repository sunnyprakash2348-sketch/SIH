import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Eye } from "lucide-react";
import { Analytics } from "../api/client";

const PIE_COLORS = ["#33D17A", "#FF5C4D", "#FFC24B"];
const GRID_STROKE = "rgba(255,255,255,0.08)";
const TICK_STYLE = { fontSize: 11, fill: "rgba(242,242,244,0.5)" };
const TOOLTIP_STYLE = {
  background: "#141416",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  fontSize: 12,
  color: "#F2F2F4"
};

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    Analytics.summary().then(setSummary);
  }, []);

  if (!summary) return <p className="text-sm text-ink/50">Loading…</p>;

  const verdictData = [
    { name: "Compliant", value: summary.verdictCounts.COMPLIANT },
    { name: "Non-compliant", value: summary.verdictCounts.NON_COMPLIANT },
    { name: "Needs review", value: summary.verdictCounts.NEEDS_REVIEW }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-1">Analytics</h1>
      <p className="text-sm text-ink/50 mb-6">
        Enforcement intelligence derived from {summary.totalInspections} inspections and{" "}
        {summary.totalComplaints} consumer complaints.
      </p>

      {summary.manualReviewCount > 0 && (
        <div className="glass p-4 mb-6 flex items-center gap-3 border-review/30">
          <Eye size={18} className="text-review shrink-0" />
          <p className="text-sm text-ink/70">
            <span className="font-medium text-review">{summary.manualReviewCount}</span> inspection
            {summary.manualReviewCount === 1 ? "" : "s"} flagged for manual verification due to low OCR
            confidence.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="glass p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Verdict breakdown</h2>
          {summary.totalInspections === 0 ? (
            <p className="text-sm text-ink/40">No data yet — run some inspections first.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={verdictData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {verdictData.map((entry, idx) => (
                    <Cell key={entry.name} fill={PIE_COLORS[idx]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12, color: "#F2F2F4" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Most commonly failed rules</h2>
          {summary.topFailedRules.length === 0 ? (
            <p className="text-sm text-ink/40">No violations recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={summary.topFailedRules}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="id" tick={TICK_STYLE} />
                <YAxis tick={TICK_STYLE} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#FF5C4D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Inspections by category</h2>
          {summary.categoryBreakdown.length === 0 ? (
            <p className="text-sm text-ink/40">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={summary.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="category" tick={TICK_STYLE} />
                <YAxis tick={TICK_STYLE} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#FFFFFF" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Verdict trend over time</h2>
          {summary.trend.length === 0 ? (
            <p className="text-sm text-ink/40">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={summary.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="date" tick={TICK_STYLE} />
                <YAxis tick={TICK_STYLE} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="compliant" stroke="#33D17A" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="nonCompliant" stroke="#FF5C4D" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="review" stroke="#FFC24B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
