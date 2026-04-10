import { useQuery } from "@tanstack/react-query";
import { Users, Globe, GraduationCap, AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { TodayScheduleWidget } from "../components/schedule/TodayScheduleWidget";

async function getStats() {
  const [studentsRes, facultyRes, leadsRes] = await Promise.all([
    supabase.from("students").select("mode", { count: "exact" }),
    supabase.from("faculty").select("id", { count: "exact" }),
    supabase.from("leads").select("id", { count: "exact" }).in("status", ["new", "contacted"]),
  ]);
  const online = (studentsRes.data ?? []).filter((x: any) => x.mode === "online").length;
  const offline = (studentsRes.data ?? []).filter((x: any) => x.mode === "offline").length;
  return {
    studentsTotal: studentsRes.count ?? 0,
    online,
    offline,
    facultyTotal: facultyRes.count ?? 0,
    leadsPending: leadsRes.count ?? 0,
  };
}

export function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: getStats });

  const total = data?.studentsTotal ?? 0;
  const online = data?.online ?? 0;
  const offline = data?.offline ?? 0;
  const onlinePct = total > 0 ? Math.round((online / total) * 100) : 0;
  const offlinePct = total > 0 ? 100 - onlinePct : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Dashboard Overview</h1>
        <p className="mt-2 text-[var(--text-muted)] text-lg">Here's what's happening at NYN Academy today.</p>
      </div>

      {/* KPI Row — 3 cards instead of 5 */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">

        {/* Hero Card: Students */}
        <Link
          to="/students"
          className="app-card app-card-interactive relative overflow-hidden p-6 animate-slide-in block no-underline"
          style={{ animationFillMode: "both" }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/5 blur-2xl opacity-70" />

          <div className="flex items-center gap-3 mb-5">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 shadow-sm border border-white/10 dark:border-white/5">
              <Users size={22} className="text-blue-600 dark:text-blue-300" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Students</p>
          </div>

          <span className="text-4xl font-extrabold text-[var(--text)] tracking-tight">
            {isLoading ? "..." : total}
          </span>

          {/* Progress bar */}
          {!isLoading && total > 0 && (
            <div className="mt-5 space-y-2">
              <div className="flex w-full h-2 rounded-full overflow-hidden bg-[var(--bg-muted)]">
                <div
                  className="h-full rounded-l-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                  style={{ width: `${onlinePct}%` }}
                />
                <div
                  className="h-full rounded-r-full bg-gradient-to-r from-purple-400 to-purple-500 transition-all duration-700"
                  style={{ width: `${offlinePct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-medium text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Online · {online}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                  Offline · {offline}
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Faculty Card */}
        <Link
          to="/faculty"
          className="app-card app-card-interactive relative overflow-hidden p-6 animate-slide-in block no-underline"
          style={{ animationDelay: "100ms", animationFillMode: "both" }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/5 blur-2xl opacity-70" />

          <div className="flex items-center gap-3 mb-5">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 shadow-sm border border-white/10 dark:border-white/5">
              <GraduationCap size={22} className="text-amber-600 dark:text-amber-300" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Active Faculty</p>
          </div>

          <span className="text-4xl font-extrabold text-[var(--text)] tracking-tight">
            {isLoading ? "..." : data?.facultyTotal ?? 0}
          </span>

          {!isLoading && total > 0 && (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              ~<span className="font-semibold text-[var(--text)]">{Math.round(total / (data?.facultyTotal || 1))}</span> students per faculty
            </p>
          )}
        </Link>

        {/* Leads Card */}
        <Link
          to="/leads"
          className="app-card app-card-interactive relative overflow-hidden p-6 animate-slide-in block no-underline"
          style={{ animationDelay: "200ms", animationFillMode: "both" }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-rose-500/20 to-rose-600/5 blur-2xl opacity-70" />

          <div className="flex items-center gap-3 mb-5">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-600/5 shadow-sm border border-white/10 dark:border-white/5">
              <AlertCircle size={22} className="text-rose-600 dark:text-rose-300" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Pending Leads</p>
          </div>

          <span className="text-4xl font-extrabold text-[var(--text)] tracking-tight">
            {isLoading ? "..." : data?.leadsPending ?? 0}
          </span>

        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 animate-slide-in" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
          <TodayScheduleWidget />
        </div>
        <div className="space-y-6 animate-slide-in" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
          <div className="app-card p-6">
            <h3 className="font-semibold text-lg mb-4 text-[var(--text)] tracking-tight">Quick Actions</h3>
            <div className="space-y-3">
              <a href="/students" className="app-button-secondary w-full flex items-center justify-start !px-4 !py-3">
                <Users size={18} className="mr-3 text-blue-500" />
                <span className="font-medium">Manage Students</span>
              </a>
              <a href="/schedule" className="app-button-secondary w-full flex items-center justify-start !px-4 !py-3">
                <Calendar size={18} className="mr-3 text-purple-500" />
                <span className="font-medium">Schedule a Class</span>
              </a>
              <a href="/leads" className="app-button-secondary w-full flex items-center justify-start !px-4 !py-3">
                <AlertCircle size={18} className="mr-3 text-amber-500" />
                <span className="font-medium">Review Active Leads</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

