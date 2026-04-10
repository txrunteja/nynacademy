import { supabase } from "../lib/supabase";
import type { SocialPost } from "../types/db";

export async function getSocialPosts(page = 1, pageSize = 25) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabase
    .from("social_posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { data: (data ?? []) as SocialPost[], count: count ?? 0 };
}

export async function createSocialPost(payload: Omit<SocialPost, "id" | "created_at">) {
  const { data, error } = await supabase.from("social_posts").insert(payload).select().single();
  if (error) throw error;
  return data as SocialPost;
}

export async function updateSocialPost(id: string, payload: Partial<SocialPost>) {
  const { data, error } = await supabase
    .from("social_posts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as SocialPost;
}
