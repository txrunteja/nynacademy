import { supabase } from "../lib/supabase";
import type { Faculty } from "../types/db";

export async function getFaculty(page = 1, pageSize = 25, search = "") {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("faculty")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (search) query = query.ilike("name", `%${search}%`);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as Faculty[], count: count ?? 0 };
}

export async function createFaculty(payload: Omit<Faculty, "id" | "created_at">) {
  const { data, error } = await supabase.from("faculty").insert(payload).select().single();
  if (error) throw error;
  return data as Faculty;
}

export async function updateFaculty(id: string, payload: Partial<Faculty>) {
  const { data, error } = await supabase.from("faculty").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data as Faculty;
}

export async function deleteFaculty(id: string) {
  const { error } = await supabase.from("faculty").delete().eq("id", id);
  if (error) throw error;
}

export async function facultyStats() {
  const { data, error } = await supabase.rpc("faculty_stats");
  if (error) throw error;
  return data as Array<{
    faculty_id: string;
    classes_today: number;
    total_taken: number;
    total_missed: number;
  }>;
}
