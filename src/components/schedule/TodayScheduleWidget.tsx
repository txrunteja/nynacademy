import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, differenceInMinutes } from "date-fns";
import { CheckCircle2, XCircle, Clock, GraduationCap, MapPin } from "lucide-react";
import { getTodaySchedules, markSchedule, updateSchedule } from "../../api/schedules";

const statusBadge: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  scheduled: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: <Clock size={14} /> },
  completed: { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: <CheckCircle2 size={14} /> },
  missed: { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: <XCircle size={14} /> },
  cancelled: { bg: "bg-gray-50 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-400", icon: null },
  rescheduled: { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: <Clock size={14} /> },
};

export function TodayScheduleWidget() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["today-schedules"],
    queryFn: getTodaySchedules,
  });

  const mutation = useMutation({
    mutationFn: ({
      scheduleId,
      status,
      note,
    }: {
      scheduleId: string;
      status: "completed" | "missed";
      note: string | null;
    }) => markSchedule(scheduleId, status, note, "admin"),
    onMutate: async ({ scheduleId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["today-schedules"] });
      const prev = queryClient.getQueryData<Array<Record<string, unknown>>>(["today-schedules"]);
      queryClient.setQueryData<Array<Record<string, unknown>>>(["today-schedules"], (old = []) =>
        old.map((item) => (item.id === scheduleId ? { ...item, status } : item))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["today-schedules"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["today-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const quickUpdate = useMutation({
    mutationFn: ({ scheduleId, payload }: { scheduleId: string; payload: Record<string, unknown> }) =>
      updateSchedule(scheduleId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-schedules"] });
    },
  });

  if (isLoading) {
    return <div className="app-card p-6 min-h-[300px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  // Sort by start time
  const sorted = [...data].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="app-card overflow-hidden">
      <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-[var(--surface)] to-[var(--bg-muted)]/30">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-[var(--text)]">
            <Clock className="text-blue-500" size={24} />
            Today's Schedule
          </h2>
          <span className="app-badge bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
            {format(new Date(), "MMM d, yyyy")}
          </span>
        </div>
      </div>
      
      <div className="p-0">
        {sorted.length === 0 ? (
          <div className="p-8 text-center bg-[var(--surface-soft)]">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Clock className="text-gray-400" size={32} />
            </div>
            <p className="text-[var(--text-muted)] text-lg">No classes scheduled for today.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {sorted.map((item: any) => {
              const start = new Date(item.start_time);
              const end = new Date(item.end_time);
              const badge = statusBadge[item.status] || statusBadge.scheduled;
              
              return (
                <div key={item.id} className="p-6 hover:bg-[var(--bg-muted)]/30 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Timeline indicator node */}
                      <div className="hidden md:flex flex-col items-center mt-1">
                        <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-white dark:bg-[#0f172a] z-10 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        <div className="w-0.5 h-full bg-[var(--border-light)] -my-1 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg text-[var(--text)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.subject}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text} whitespace-nowrap border border-current/10`}>
                            {badge.icon}
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                          <Clock size={16} />
                          {format(start, "h:mm a")} - {format(end, "h:mm a")}
                          <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 ml-2">
                            {differenceInMinutes(end, start)} min
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-3">
                          <div className="flex items-center gap-1.5">
                            <GraduationCap size={16} className="text-gray-400" />
                            {item.faculty?.name || "Unknown Faculty"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-gray-400" />
                            {item.type === "individual" ? item.student?.name : item.batch?.name} • {item.mode}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="app-button-success !px-3 py-1.5 text-xs inline-flex items-center gap-1 disabled:opacity-50"
                            onClick={() => mutation.mutate({ scheduleId: item.id, status: "completed", note: null })}
                            disabled={item.status === "completed" || mutation.isPending}
                          >
                            <CheckCircle2 size={14} />
                            Mark Done
                          </button>
                          <button
                            className="app-button-danger !px-3 py-1.5 text-xs inline-flex items-center gap-1 disabled:opacity-50"
                            onClick={() => mutation.mutate({ scheduleId: item.id, status: "missed", note: null })}
                            disabled={item.status === "missed" || mutation.isPending}
                          >
                            <XCircle size={14} />
                            Mark Missed
                          </button>
                          <button
                            className="app-button-secondary !px-3 py-1.5 text-xs inline-flex items-center gap-1 disabled:opacity-50"
                            onClick={() => {
                              const value = window.prompt("New start datetime (YYYY-MM-DDTHH:mm)", item.start_time?.slice(0, 16));
                              if (!value) return;
                              quickUpdate.mutate({
                                scheduleId: item.id,
                                payload: { start_time: value, status: "rescheduled", marked_at: new Date().toISOString() },
                              });
                            }}
                            disabled={quickUpdate.isPending}
                          >
                            <Clock size={14} />
                            Reschedule
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
