import { supabase } from "../lib/supabase";
import type { Lead, LeadSource, LeadStatus } from "../types/db";

export async function getLeads(
  page = 1,
  pageSize = 25,
  source: LeadSource | "all" = "all",
  status: LeadStatus | "all" = "all"
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (source !== "all") query = query.eq("source", source);
  if (status !== "all") query = query.eq("status", status);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as Lead[], count: count ?? 0 };
}

export async function createLead(payload: Omit<Lead, "id" | "created_at">) {
  const { data, error } = await supabase.from("leads").insert(payload).select().single();
  if (error) throw error;
  return data as Lead;
}

export async function updateLead(id: string, payload: Partial<Lead>) {
  const { data, error } = await supabase.from("leads").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data as Lead;
}
