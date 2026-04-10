export type ClassMode = "online" | "offline";
export type ScheduleType = "individual" | "batch";
export type ScheduleRecurrence = "once" | "daily" | "weekly";
export type ScheduleStatus =
  | "scheduled"
  | "completed"
  | "missed"
  | "cancelled"
  | "rescheduled";

export type LeadSource = "justdial" | "sulekha" | "other";
export type LeadStatus = "new" | "contacted" | "converted" | "dropped";
export type SocialStatus = "draft" | "scheduled" | "posted";

export interface Student {
  id: string;
  name: string;
  phone: string;
  mode: ClassMode;
  assigned_faculty_id: string | null;
  subjects: string[];
  created_at: string;
}

export interface Faculty {
  id: string;
  name: string;
  phone: string;
  subjects: string[];
  created_at: string;
}

export interface Batch {
  id: string;
  name: string;
  faculty_id: string | null;
  student_ids: string[];
  subject: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  type: ScheduleType;
  student_id: string | null;
  batch_id: string | null;
  faculty_id: string;
  subject: string;
  start_time: string;
  end_time: string;
  mode: ClassMode;
  recurrence: ScheduleRecurrence;
  status: ScheduleStatus;
  notes: string | null;
  marked_by: string | null;
  marked_at: string | null;
}

export interface AttendanceLog {
  id: string;
  schedule_id: string;
  date: string;
  status: ScheduleStatus;
  notes: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
}

export interface SocialPost {
  id: string;
  platform: string;
  content: string;
  scheduled_date: string | null;
  status: SocialStatus;
  created_at: string;
}
