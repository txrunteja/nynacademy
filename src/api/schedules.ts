import { format } from "date-fns";
import { supabase } from "../lib/supabase";
import type { AttendanceLog, Schedule, ScheduleStatus } from "../types/db";

export async function getTodaySchedules() {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data, error } = await supabase
    .from("schedules")
    .select("*, faculty:faculty_id(id,name), student:student_id(id,name), batch:batch_id(id,name)")
    .gte("start_time", `${today}T00:00:00`)
    .lte("start_time", `${today}T23:59:59`)
    .order("start_time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getSchedulesByDay(date: string) {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .gte("start_time", `${date}T00:00:00`)
    .lte("start_time", `${date}T23:59:59`)
    .order("start_time", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Schedule[];
}

export async function getSchedulesByRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .gte("start_time", `${startDate}T00:00:00`)
    .lte("start_time", `${endDate}T23:59:59`)
    .order("start_time", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Schedule[];
}

export async function createSchedule(payload: Omit<Schedule, "id" | "marked_by" | "marked_at">) {
  const { data, error } = await supabase.from("schedules").insert(payload).select().single();
  if (error) throw error;
  return data as Schedule;
}

export async function markSchedule(
  scheduleId: string,
  status: ScheduleStatus,
  note: string | null,
  markedBy: string
) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("schedules")
    .update({ status, notes: note, marked_by: markedBy, marked_at: now })
    .eq("id", scheduleId)
    .select()
    .single();
  if (error) throw error;

  const attendancePayload: Omit<AttendanceLog, "id" | "created_at"> = {
    schedule_id: scheduleId,
    date: format(new Date(), "yyyy-MM-dd"),
    status,
    notes: note,
  };

  const { error: attendanceError } = await supabase.from("attendance_logs").insert(attendancePayload);
  if (attendanceError) throw attendanceError;
  return data as Schedule;
}

export async function updateSchedule(id: string, payload: Partial<Schedule>) {
  const { data, error } = await supabase.from("schedules").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data as Schedule;
}
