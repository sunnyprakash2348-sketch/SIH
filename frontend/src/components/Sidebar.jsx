import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ScanLine, History, BarChart3, ScrollText, LogOut, Landmark } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inspect", label: "New Inspection", icon: ScanLine },
  { to: "/history", label: "History", icon: History },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/rules", label: "Rule Catalog", icon: ScrollText }
];

export default function Sidebar({ officer }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("pccs_officer");
    navigate("/login");
  }

  return (
    <aside className="w-60 shrink-0 bg-black/50 backdrop-blur-2xl text-ink border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-white/10 flex items-center gap-2">
        <Landmark size={22} className="text-white" />
        <div>
          <p className="font-display text-sm font-semibold leading-tight text-ink">PCCS</p>
          <p className="text-[10px] text-ink/40 leading-tight">Legal Metrology Wing</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                isActive
                  ? "bg-white/10 text-white border-l-2 border-white"
                  : "text-ink/50 hover:bg-white/5 hover:text-ink"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <p className="px-3 text-xs text-ink/40 mb-2">Signed in as</p>
        <p className="px-3 text-sm font-medium mb-3 text-ink">{officer?.name || "Officer"}</p>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink/50 hover:text-ink hover:bg-white/5 rounded-lg"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
