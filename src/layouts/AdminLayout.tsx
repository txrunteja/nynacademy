import { Home, Users, GraduationCap, Calendar, Target, Share2, Menu, Moon, Sun, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTheme } from "../hooks/useTheme";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/students", label: "Students", icon: Users },
  { to: "/faculty", label: "Faculty", icon: GraduationCap },
  { to: "/schedule", label: "Schedule", icon: Calendar },
  { to: "/leads", label: "Leads", icon: Target },
  { to: "/social", label: "Social", icon: Share2 },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  // Sidebar always stays dark for a premium look, independent of main theme
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] font-sans">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#1f2937] bg-[#111827] shadow-2xl transition-transform md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full text-white">
          <div className="p-6 border-b border-[#1f2937]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-xl tracking-tight">NYN</span>
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight tracking-wide text-white">NYN Academy</h1>
                <p className="text-xs text-blue-200 mt-0.5">Admin Portal</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-blue-600/15 text-blue-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 w-1 h-1/2 bg-blue-500 rounded-r-md -ml-4 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  )}
                  <Icon size={18} className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'group-hover:scale-110'}`} />
                  <span className="tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#1f2937] flex items-center justify-around bg-[#0f172a]/40">
            <button 
              className={`Btn ${theme === "dark" ? "Btn-gray" : "Btn-dark"}`}
              onClick={toggleTheme}
            >
              <div className="sign">
                {theme === "dark" ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
              </div>
              <div className="text" style={{ paddingLeft: '10px' }}>
                {theme === "dark" ? "Light" : "Dark"}
              </div>
            </button>
            <button className="Btn Btn-danger" onClick={logout}>
              <div className="sign">
                <LogOut size={18} strokeWidth={2.5} />
              </div>
              <div className="text" style={{ paddingLeft: '10px' }}>Sign Out</div>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden animate-slide-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md px-4 md:px-8 py-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                className="app-button-secondary md:hidden flex items-center justify-center p-2 rounded-lg"
                onClick={() => setMobileOpen((s) => !s)}
              >
                <Menu size={20} />
              </button>
              <h2 className="text-xl font-semibold capitalize tracking-tight hidden sm:block text-[var(--text)]">
                {location.pathname.split('/')[1] || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[var(--text)]">Admin User</p>
                <p className="text-xs text-[var(--text-muted)]">admin@nynacademy.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 border border-[var(--border)] flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                <Users size={18} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-[var(--bg)] transition-colors">
          <div className="p-4 md:p-8 max-w-7xl mx-auto animate-slide-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
