import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  addDays,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  set,
  startOfWeek,
  differenceInMilliseconds,
  addMilliseconds,
} from "date-fns";
import { createSchedule, getSchedulesByRange, updateSchedule } from "../api/schedules";
import { getFaculty } from "../api/faculty";
import { getStudents } from "../api/students";
import { EmptyState } from "../components/ui/EmptyState";
import type { Schedule } from "../types/db";

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
  return (
    <button
      ref={setNodeRef}
      className={`rounded-lg border px-2 py-2 text-left transition ${
        active ? "border-transparent bg-[var(--brand)] text-[var(--brand-text)]" : "border-[var(--border)]"
      } ${isOver ? "ring-2 ring-blue-400" : ""}`}
      onClick={onSelect}
    >
      <p className="text-xs">{format(day, "EEE")}</p>
      <p className="text-sm font-semibold">{format(day, "dd")}</p>
      <p className="text-xs opacity-80">{count} cls</p>
    </button>
  );
}

function DraggableScheduleCard({ row, colorClass }: { row: Schedule; colorClass: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: row.id,
    data: { row },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded border p-2 ${colorClass} cursor-grab active:cursor-grabbing`}
      {...listeners}
      {...attributes}
    >
      {format(new Date(row.start_time), "dd MMM hh:mm a")} - {row.subject} ({row.mode})
    </div>
  );
}

export function SchedulePage() {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const selectedDate = parseISO(`${date}T00:00:00`);
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");
  const weekDays = Array.from({ length: 7 }).map((_, idx) => addDays(weekStart, idx));
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
  const { data: facultyData } = useQuery({ queryKey: ["faculty", "all"], queryFn: () => getFaculty(1, 100) });
  const { data: studentsData } = useQuery({ queryKey: ["students", "all"], queryFn: () => getStudents({ page: 1, pageSize: 200 }) });

  const save = useMutation({
    mutationFn: () =>
      createSchedule({
        type: form.type as any,
        student_id: form.type === "individual" ? form.student_id : null,
        batch_id: null,
        faculty_id: form.faculty_id,
        subject: form.subject,
        start_time: form.start_time,
        end_time: form.end_time,
        mode: form.mode as any,
        recurrence: form.recurrence as any,
        status: "scheduled",
        notes: null,
      } as Omit<Schedule, "id" | "marked_by" | "marked_at">),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-week"] });
      queryClient.invalidateQueries({ queryKey: ["today-schedules"] });
    },
  });
  const moveSchedule = useMutation({
    mutationFn: async ({ schedule, targetDate }: { schedule: Schedule; targetDate: string }) => {
      const srcStart = new Date(schedule.start_time);
      const srcEnd = new Date(schedule.end_time);
      const duration = Math.max(0, differenceInMilliseconds(srcEnd, srcStart));
      const target = parseISO(`${targetDate}T00:00:00`);
      const newStart = set(target, {
        hours: srcStart.getHours(),
        minutes: srcStart.getMinutes(),
        seconds: srcStart.getSeconds(),
        milliseconds: 0,
      });
      const newEnd = addMilliseconds(newStart, duration);
      return updateSchedule(schedule.id, {
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
        status: "rescheduled",
        marked_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-week"] });
      queryClient.invalidateQueries({ queryKey: ["today-schedules"] });
    },
  });

  const dayRows = data.filter((row) => isSameDay(new Date(row.start_time), selectedDate));
  const slotCount = dayRows.reduce<Record<string, number>>((acc, row) => {
    const key = `${row.faculty_id}-${row.start_time}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const loadColor = (n: number) =>
    n <= 1
      ? "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50"
      : n <= 3
      ? "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/50"
      : "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50";

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const targetDate = String(over.id);
    const dragged = active.data.current?.row as Schedule | undefined;
    if (!dragged) return;
    const currentDate = format(new Date(dragged.start_time), "yyyy-MM-dd");
    if (currentDate === targetDate) return;
    moveSchedule.mutate({ schedule: dragged, targetDate });
  }

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="space-y-4">
      <h1 className="text-2xl font-bold">Schedule</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="app-card p-4">
          <h2 className="mb-2 text-lg font-semibold">Create Schedule</h2>
          <div className="space-y-2">
            <select className="app-input" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              <option value="individual">Individual</option>
              <option value="batch">Batch</option>
            </select>
            {form.type === "individual" ? (
              <select className="app-input" value={form.student_id} onChange={(e) => setForm((p) => ({ ...p, student_id: e.target.value }))}>
                <option value="">Select Student</option>
                {(studentsData?.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : null}
            <select className="app-input" value={form.faculty_id} onChange={(e) => setForm((p) => ({ ...p, faculty_id: e.target.value }))}>
              <option value="">Select Faculty</option>
              {(facultyData?.data ?? []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <input className="app-input" placeholder="Subject" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
            <input className="app-input" type="datetime-local" value={form.start_time} onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} />
            <input className="app-input" type="datetime-local" value={form.end_time} onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <select className="app-input" value={form.mode} onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))}>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
              <select className="app-input" value={form.recurrence} onChange={(e) => setForm((p) => ({ ...p, recurrence: e.target.value }))}>
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <button className="app-button-primary" onClick={() => save.mutate()}>
              Save Schedule
            </button>
          </div>
        </div>
        <div className="app-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Week + Day View</h2>
            <input className="app-input w-auto" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="mb-3 grid grid-cols-7 gap-2">
            {weekDays.map((d) => {
              const count = data.filter((row) => isSameDay(new Date(row.start_time), d)).length;
              const active = isSameDay(d, selectedDate);
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
          {dayRows.length ? (
            <div className="space-y-2">
              {dayRows.map((row) => {
                const c = slotCount[`${row.faculty_id}-${row.start_time}`] ?? 1;
                return (
                  <DraggableScheduleCard key={row.id} row={row} colorClass={loadColor(c)} />
                );
              })}
            </div>
          ) : (
            <EmptyState title="No schedules for this date" />
          )}
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Drag classes onto another day in the week strip to reschedule while keeping time slot and duration.
          </p>
        </div>
      </div>
      </div>
    </DndContext>
  );
}
