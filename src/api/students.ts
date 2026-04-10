import { supabase } from "../lib/supabase";
import type { ClassMode, Student } from "../types/db";
import { pagedQuery } from "./shared";

export interface StudentFilters {
  search?: string;
  mode?: ClassMode | "all";
  facultyId?: string | "all";
  page: number;
  pageSize?: number;
}

export async function getStudents(filters: StudentFilters) {
  const pageSize = filters.pageSize ?? 25;
  const from = (filters.page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("students")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);
  if (filters.mode && filters.mode !== "all") query = query.eq("mode", filters.mode);
  if (filters.facultyId && filters.facultyId !== "all")
    query = query.eq("assigned_faculty_id", filters.facultyId);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as Student[], count: count ?? 0 };
}

export async function createStudent(payload: Omit<Student, "id" | "created_at">) {
  const { data, error } = await supabase.from("students").insert(payload).select().single();
  if (error) throw error;
  return data as Student;
}

export async function updateStudent(id: string, payload: Partial<Student>) {
  const { data, error } = await supabase.from("students").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data as Student;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}

export const listStudentsSimple = (page: number) => pagedQuery<Student>("students", page);
