import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  addDays,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
  differenceInMilliseconds,
  addMilliseconds,
} from "date-fns";
import { Clock, User, GraduationCap, BookOpen, Trash2, ChevronLeft, ChevronRight, CalendarPlus, History, Search } from "lucide-react";
import { createSchedule, deleteSchedule, getSchedulesByRange, updateSchedule, getPastSchedules } from "../api/schedules";
import { getFaculty } from "../api/faculty";
import { getStudents } from "../api/students";
import { EmptyState } from "../components/ui/EmptyState";
import type { Schedule } from "../types/db";
import { formatInIST, toISTDate, isSameDayInIST } from "../lib/dateUtils";

/* ── Subject colour palette (same as students/faculty) ──────── */
const SUBJECT_COLORS = [
  { bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.4)", text: "#3b82f6", accent: "#3b82f6" },
  { bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.4)", text: "#a855f7", accent: "#a855f7" },
  { bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.4)", text: "#ec4899", accent: "#ec4899" },
  { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", text: "#f59e0b", accent: "#f59e0b" },
  { bg: "rgba(16,185,129,0.15)",  border: "rgba(16,185,129,0.4)", text: "#10b981", accent: "#10b981" },
  { bg: "rgba(6,182,212,0.15)",   border: "rgba(6,182,212,0.4)",  text: "#06b6d4", accent: "#06b6d4" },
  { bg: "rgba(244,63,94,0.15)",   border: "rgba(244,63,94,0.4)",  text: "#f43f5e", accent: "#f43f5e" },
  { bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.4)", text: "#6366f1", accent: "#6366f1" },
];

function subjectColor(subject: string) {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

/* ── Status badge colours ───────────────────────────────────── */
const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  missed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  rescheduled: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

/* ── Week day drop target ───────────────────────────────────── */
function WeekDropDay({
  day,
  count,
  active,
  onSelect,
}: {
  day: Date;
  count: number;
  active: boolean;
  onSelect: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: format(day, "yyyy-MM-dd") });
  const isToday = formatInIST(new Date(), "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
  return (
    <button
      ref={setNodeRef}
      className={`relative rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
        active
          ? "border-transparent bg-[var(--brand)] text-[var(--brand-text)] shadow-lg shadow-blue-500/25"
          : "border-[var(--border)] hover:border-[var(--brand)] hover:shadow-sm"
      } ${isOver ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-[var(--bg)] scale-105" : ""}`}
      onClick={onSelect}
    >
      {isToday && !active && (
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />
      )}
      <p className="text-xs font-medium opacity-70">{format(day, "EEE")}</p>
      <p className="text-lg font-bold">{format(day, "dd")}</p>
      <p className="text-xs opacity-60 mt-0.5">
        {count} {count === 1 ? "class" : "classes"}
      </p>
    </button>
  );
}

/* ── Draggable schedule card ────────────────────────────────── */
function DraggableScheduleCard({
  row,
  facultyMap,
  studentMap,
  onDelete,
}: {
  row: Schedule;
  facultyMap: Map<string, string>;
  studentMap: Map<string, string>;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: row.id,
    data: { row },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };
  const sc = subjectColor(row.subject);
  const facultyName = facultyMap.get(row.faculty_id) ?? "Unknown";
  const studentName = row.student_id ? (studentMap.get(row.student_id) ?? "Unknown") : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-xl border bg-[var(--surface)] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-grab active:cursor-grabbing"
      {...listeners}
      {...attributes}
    >
      {/* Colour accent bar */}
      <div className="h-1" style={{ background: sc.accent }} />

      <div className="p-3 space-y-2">
        {/* Header row: time + status + delete */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--text-muted)]" />
            <span className="text-sm font-semibold text-[var(--text)]">
              {formatInIST(row.start_time, "hh:mm a")} – {formatInIST(row.end_time, "hh:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`app-badge text-[0.65rem] px-2 py-0.5 ${STATUS_STYLES[row.status] ?? ""}`}>
              {row.status}
            </span>
            <button
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Delete this schedule?")) onDelete(row.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              title="Delete schedule"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Subject tag */}
        <div className="flex items-center gap-2">
          <span
            className="subject-tag"
            style={{ background: sc.bg, borderColor: sc.border, color: sc.text }}
          >
            <BookOpen size={12} className="mr-1" />
            {row.subject}
          </span>
          <span className={`app-badge text-[0.65rem] px-2 py-0.5 ${
            row.mode === "online"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}>
            {row.mode}
          </span>
        </div>

        {/* Faculty + student */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1">
            <GraduationCap size={12} /> {facultyName}
          </span>
          {studentName && (
            <span className="inline-flex items-center gap-1">
              <User size={12} /> {studentName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function SchedulePage() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(formatInIST(new Date(), "yyyy-MM-dd"));
  const selectedDate = parseISO(`${date}T00:00:00`);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");
  const weekDays = Array.from({ length: 7 }).map((_, idx) => addDays(weekStart, idx));
  
  const [historySearch, setHistorySearch] = useState("");

  const [form, setForm] = useState({
    type: "individual",
    student_id: "",
    faculty_id: "",
    subject: "",
    start_time: "",
    end_time: "",
    mode: "offline",
    recurrence: "once",
  });
  
  const { data = [] } = useQuery({
    queryKey: ["schedule-week", weekStartStr, weekEndStr],
    queryFn: () => getSchedulesByRange(weekStartStr, weekEndStr),
  });

  const { data: pastSchedules = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["past-schedules", historySearch],
    queryFn: () => getPastSchedules(historySearch),
  });

  const { data: facultyData } = useQuery({ queryKey: ["faculty", "all"], queryFn: () => getFaculty(1, 100) });
  const { data: studentsData } = useQuery({ queryKey: ["students", "all"], queryFn: () => getStudents({ page: 1, pageSize: 200 }) });

  // Build name lookup maps
  const facultyMap = new Map((facultyData?.data ?? []).map((f) => [f.id, f.name]));
  const studentMap = new Map((studentsData?.data ?? []).map((s) => [s.id, s.name]));

  const save = useMutation({
    mutationFn: () =>
      createSchedule({
        type: form.type as any,
        student_id: form.type === "individual" ? form.student_id : null,
        batch_id: null,
        faculty_id: form.faculty_id,
        subject: form.subject,
        start_time: `${form.start_time}+05:30`,
        end_time: `${form.end_time}+05:30`,
        mode: form.mode as any,
        recurrence: form.recurrence as any,
        status: "scheduled",
        notes: null,
      } as Omit<Schedule, "id" | "marked_by" | "marked_at">),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-week"] });
      queryClient.invalidateQueries({ queryKey: ["today-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["past-schedules"] });
      setForm({ type: "individual", student_id: "", faculty_id: "", subject: "", start_time: "", end_time: "", mode: "offline", recurrence: "once" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-week"] });
      queryClient.invalidateQueries({ queryKey: ["today-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["past-schedules"] });
    },
  });

  const moveSchedule = useMutation({
    mutationFn: async ({ schedule, targetDate }: { schedule: Schedule; targetDate: string }) => {
      const istStart = toISTDate(schedule.start_time);
      const istEnd = toISTDate(schedule.end_time);
      const duration = Math.max(0, differenceInMilliseconds(istEnd, istStart));
      
      const hoursStr = String(istStart.getHours()).padStart(2, '0');
      const minutesStr = String(istStart.getMinutes()).padStart(2, '0');
      const secondsStr = String(istStart.getSeconds()).padStart(2, '0');
      
      const newStartStr = `${targetDate}T${hoursStr}:${minutesStr}:${secondsStr}+05:30`;
      const newStart = new Date(newStartStr);
      const newEnd = addMilliseconds(newStart, duration);

      return updateSchedule(schedule.id, {
        start_time: newStartStr,
        end_time: newEnd.toISOString(),
        status: "rescheduled",
        marked_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-week"] });
      queryClient.invalidateQueries({ queryKey: ["today-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["past-schedules"] });
    },
  });

  const dayRows = data.filter((row) => formatInIST(row.start_time, "yyyy-MM-dd") === date);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const targetDate = String(over.id);
    const dragged = active.data.current?.row as Schedule | undefined;
    if (!dragged) return;
    const currentDate = formatInIST(dragged.start_time, "yyyy-MM-dd");
    if (currentDate === targetDate) return;
    moveSchedule.mutate({ schedule: dragged, targetDate });
  }

  /* Week navigation helpers */
  const goWeek = (dir: -1 | 1) => setDate(format(addDays(selectedDate, dir * 7), "yyyy-MM-dd"));
  const goToday = () => setDate(formatInIST(new Date(), "yyyy-MM-dd"));

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="space-y-6 animate-slide-in">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">Schedule</h1>
            <p className="mt-2 text-[var(--text-muted)] text-lg">Plan, view, and manage class schedules.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* ── Create Schedule Form ──────────────────────────── */}
          <div className="app-card p-5 space-y-4 self-start">
            <div className="flex items-center gap-2 mb-1">
              <CalendarPlus size={20} className="text-[var(--brand)]" />
              <h2 className="text-lg font-bold text-[var(--text)]">Create Schedule</h2>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Type</label>
              <select className="app-input" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                <option value="individual">Individual</option>
                <option value="batch">Batch</option>
              </select>
            </div>

            {form.type === "individual" && (
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Student</label>
                <select className="app-input" value={form.student_id} onChange={(e) => setForm((p) => ({ ...p, student_id: e.target.value }))}>
                  <option value="">Select Student</option>
                  {(studentsData?.data ?? []).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Faculty</label>
              <select className="app-input" value={form.faculty_id} onChange={(e) => setForm((p) => ({ ...p, faculty_id: e.target.value }))}>
                <option value="">Select Faculty</option>
                {(facultyData?.data ?? []).map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Subject</label>
              <input className="app-input" placeholder="e.g. Mathematics" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Start (IST)</label>
                <input className="app-input" type="datetime-local" value={form.start_time} onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">End (IST)</label>
                <input className="app-input" type="datetime-local" value={form.end_time} onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Mode</label>
                <select className="app-input" value={form.mode} onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))}>
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Recurrence</label>
                <select className="app-input" value={form.recurrence} onChange={(e) => setForm((p) => ({ ...p, recurrence: e.target.value }))}>
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <button
              className="app-button-primary w-full shadow-lg shadow-blue-500/20 mt-2"
              onClick={() => save.mutate()}
              disabled={!form.faculty_id || !form.subject || !form.start_time || !form.end_time || save.isPending}
            >
              {save.isPending ? "Saving..." : "Save Schedule"}
            </button>
          </div>

          {/* ── Week + Day View & History ─────────────────────── */}
          <div className="space-y-6">
            {/* Week + Day View */}
            <div className="app-card p-5 space-y-4">
              {/* Week navigation */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--text)]">
                  {format(weekStart, "MMM dd")} – {format(weekEnd, "MMM dd, yyyy")}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)] transition-colors"
                    onClick={() => goWeek(-1)}
                    title="Previous week"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-soft)] transition-colors"
                    onClick={goToday}
                  >
                    Today
                  </button>
                  <button
                    className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)] transition-colors"
                    onClick={() => goWeek(1)}
                    title="Next week"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Week strip */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((d) => {
                  const count = data.filter((row) => formatInIST(row.start_time, "yyyy-MM-dd") === format(d, "yyyy-MM-dd")).length;
                  const active = isSameDayInIST(d, selectedDate);
                  return (
                    <WeekDropDay
                      key={d.toISOString()}
                      day={d}
                      count={count}
                      active={active}
                      onSelect={() => setDate(format(d, "yyyy-MM-dd"))}
                    />
                  );
                })}
              </div>

              {/* Day header */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <h3 className="font-semibold text-[var(--text)]">
                  {format(selectedDate, "EEEE, MMMM dd")}
                </h3>
                <span className="text-sm text-[var(--text-muted)]">
                  {dayRows.length} {dayRows.length === 1 ? "class" : "classes"}
                </span>
              </div>

              {/* Schedule cards */}
              {dayRows.length ? (
                <div className="space-y-3">
                  {dayRows.map((row) => (
                    <DraggableScheduleCard
                      key={row.id}
                      row={row}
                      facultyMap={facultyMap}
                      studentMap={studentMap}
                      onDelete={(id) => removeMutation.mutate(id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState title="No schedules for this date" description="Create a new schedule or drag one from another day." />
              )}

              <p className="text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                💡 Drag classes onto another day in the week strip to reschedule while keeping time slot and duration.
              </p>
            </div>

            {/* ── Past Schedules Log ─────────────────────────── */}
            <div className="app-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <History className="text-[var(--brand)]" size={20} />
                  <h2 className="text-lg font-bold text-[var(--text)]">Past Schedules</h2>
                </div>
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    className="app-input pl-9"
                    placeholder="Search by subject..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              {isLoadingHistory ? (
                <div className="py-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : pastSchedules.length === 0 ? (
                <div className="text-center py-6 text-[var(--text-muted)] text-sm">
                  No past schedules found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-[var(--text)] border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3">Faculty</th>
                        <th className="py-2.5 px-3">Student / Batch</th>
                        <th className="py-2.5 px-3">Mode</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {pastSchedules.map((item: any) => {
                        const sc = subjectColor(item.subject);
                        const facName = facultyMap.get(item.faculty_id) || item.faculty?.name || "Unknown";
                        const studName = item.student_id ? (studentMap.get(item.student_id) || item.student?.name || "Unknown") : item.batch?.name || "-";
                        return (
                          <tr key={item.id} className="hover:bg-[var(--bg-muted)]/20 transition-colors">
                            <td className="py-3 px-3 font-medium whitespace-nowrap">
                              {formatInIST(item.start_time, "MMM dd, yyyy")}
                              <div className="text-xs text-[var(--text-muted)]">
                                {formatInIST(item.start_time, "hh:mm a")} - {formatInIST(item.end_time, "hh:mm a")}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className="subject-tag inline-flex"
                                style={{ background: sc.bg, borderColor: sc.border, color: sc.text }}
                              >
                                {item.subject}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[var(--text-muted)] whitespace-nowrap">{facName}</td>
                            <td className="py-3 px-3 text-[var(--text-muted)] whitespace-nowrap">{studName}</td>
                            <td className="py-3 px-3">
                              <span className={`app-badge text-[0.65rem] px-2 py-0.5 ${
                                item.mode === "online"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              }`}>
                                {item.mode}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`app-badge text-[0.65rem] px-2 py-0.5 ${STATUS_STYLES[item.status] ?? ""}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
