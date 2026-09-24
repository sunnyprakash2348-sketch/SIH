import { useEffect, useState } from "react";
import {
  Factory,
  Globe,
  Tag,
  Scale,
  Calendar,
  CalendarClock,
  IndianRupee,
  Receipt,
  Headphones,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MinusCircle,
  ShieldCheck
} from "lucide-react";
import { Auth } from "../api/client";

const ICONS = {
  factory: Factory,
  globe: Globe,
  tag: Tag,
  scale: Scale,
  calendar: Calendar,
  "clock-alert": CalendarClock,
  "indian-rupee": IndianRupee,
  receipt: Receipt,
  headset: Headphones
};

function ConditionRow({ type, text }) {
  if (!text) return null;
  const CONFIG = {
    pass: { icon: CheckCircle2, color: "text-verified", label: "Passes when" },
    fail: { icon: XCircle, color: "text-violation", label: "Fails when" },
    review: { icon: HelpCircle, color: "text-review", label: "Sent for review when" },
    na: { icon: MinusCircle, color: "text-ink/40", label: "Not applicable when" }
  }[type];
  const Icon = CONFIG.icon;
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon size={15} className={`${CONFIG.color} shrink-0 mt-0.5`} />
      <p className="text-xs text-ink/60">
        <span className={`font-medium ${CONFIG.color}`}>{CONFIG.label}:</span> {text}
      </p>
    </div>
  );
}

export default function RuleCatalog() {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    Auth.rules().then(setRules);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-1">Rule Catalog</h1>
      <p className="text-sm text-ink/50 mb-6 max-w-2xl">
        Statutory checks LM-001 through LM-009, evaluated deterministically by the rule engine — never by AI.
        Each card below shows exactly what makes a label pass, fail, get sent for manual review, or get marked
        not applicable.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {rules.map((r) => {
          const Icon = ICONS[r.icon] || Tag;
          return (
            <div key={r.id} className="glass p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brass-dark">{r.id}</p>
                    <p className="text-sm font-medium text-ink">{r.name}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full border ${
                    r.severity === "critical"
                      ? "border-violation/30 text-violation bg-violation/10"
                      : "border-review/30 text-review bg-review/10"
                  }`}
                >
                  {r.severity === "critical" ? "Critical" : "Moderate"}
                </span>
              </div>

              <p className="text-xs text-ink/50 mb-3 pb-3 border-b border-white/10">{r.requirement}</p>

              <div>
                <ConditionRow type="pass" text={r.passCondition} />
                <ConditionRow type="fail" text={r.failCondition} />
                <ConditionRow type="review" text={r.reviewCondition} />
                <ConditionRow type="na" text={r.naCondition} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass p-5 flex gap-3">
        <ShieldCheck size={20} className="text-white shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-semibold text-ink mb-1">Why AI doesn't decide compliance</h2>
          <p className="text-sm text-ink/50">
            The OCR layer only reads what's printed on the label into structured text. The rules above — fixed,
            visible, and editable in <code className="text-ink/70">backend/src/config/rules.json</code> — decide
            PASS, FAIL, REVIEW, or N/A for each requirement. This keeps every verdict traceable to a specific
            rule and a specific piece of evidence, which matters when a verdict may lead to real enforcement
            action.
          </p>
        </div>
      </div>
    </div>
  );
}
