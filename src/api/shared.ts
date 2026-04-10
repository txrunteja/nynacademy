import { supabase } from "../lib/supabase";

export interface PaginationInput {
  page: number;
  pageSize?: number;
}

export async function pagedQuery<T>(
  table: string,
  page: number,
  pageSize = 25,
  select = "*",
  orderBy = "created_at",
  ascending = false
): Promise<{ data: T[]; count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from(table)
    .select(select, { count: "exact" })
    .order(orderBy, { ascending })
    .range(from, to);

  if (error) {
    throw error;
  }
  return { data: (data ?? []) as T[], count: count ?? 0 };
}
