import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated or when auth state changes to signed-in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard", { replace: true });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) navigate("/dashboard", { replace: true });
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    // Navigation is handled by the onAuthStateChange listener above
  }

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0a0e17] p-4">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-3xl animate-pulse-subtle" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md z-10 animate-slide-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-6 shadow-xl shadow-blue-500/20">
            <span className="text-3xl font-bold text-white tracking-tight">NYN</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Admin Portal</h1>
          <p className="text-[var(--text-muted)] mt-2 text-lg">Sign in to manage your academy</p>
        </div>

        {/* Form Card */}
        <form onSubmit={onSubmit} className="glass rounded-2xl shadow-xl p-8 space-y-6 relative border border-white/20 dark:border-white/5">
          {/* Error Alert */}
          {error && (
            <div className="flex gap-3 p-4 rounded-xl bg-red-50/80 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2 tracking-wide">Work Email</label>
            <input
              className="app-input hover:border-blue-300 focus:border-blue-500 transition-all font-medium"
              type="email"
              placeholder="admin@nynacademy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2 tracking-wide">Password</label>
            <input
              className="app-input hover:border-blue-300 focus:border-blue-500 transition-all font-medium"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button 
            className="app-button-primary w-full flex items-center justify-center gap-2 py-3 mt-4 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            disabled={loading}
          >
            <LogIn size={20} />
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
          </button>
        </form>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-[var(--text-lighter)]">
             Secure Admin Access Only
          </p>
        </div>
      </div>
    </div>
  );
}
