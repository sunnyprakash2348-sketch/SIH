import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Landmark, ScanLine } from "lucide-react";
import { Auth } from "../api/client";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const officer = await Auth.login({ username, password });
      onLogin(officer);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setLoading(true);
    try {
      const officer = await Auth.login({ demo: true });
      onLogin(officer);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 900px 600px at 50% 0%, rgba(255,255,255,0.08), transparent 60%), #0A0A0C"
        }}
      />
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Landmark size={32} className="text-white mb-3" />
          <h1 className="text-ink font-display text-xl font-semibold">Packaged Commodity</h1>
          <p className="text-ink font-display text-xl font-semibold -mt-1">Compliance System</p>
          <p className="text-ink/40 text-xs mt-2 tracking-wide">Legal Metrology (Packaged Commodities) Rules, 2011</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Officer ID</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full input-glass"
              placeholder="officer1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full input-glass"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-xs text-violation">{error}</p>}
          <button
            disabled={loading}
            className="w-full btn-primary py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full btn-outline py-2.5 text-sm font-medium disabled:opacity-50"
          >
            Demo Login (for judges)
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/scan" className="inline-flex items-center gap-1.5 text-xs text-ink/40 hover:text-ink">
            <ScanLine size={14} /> I'm a consumer — check a product instead
          </Link>
        </div>
      </div>
    </div>
  );
}
