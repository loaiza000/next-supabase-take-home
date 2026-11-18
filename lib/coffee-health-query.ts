import "server-only";

import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE, type CoffeeHealthRow, type Filters } from "@/lib/coffee-health";

export async function getCoffeeHealthPage(filters: Filters) {
  const supabase = await createClient();
  let query = supabase.from("coffee_health").select("*");

  if (filters.country) query = query.eq("country", filters.country);
  if (filters.gender) query = query.eq("gender", filters.gender);
  if (filters.sleepQuality) query = query.eq("sleep_quality", filters.sleepQuality);
  if (filters.stressLevel) query = query.eq("stress_level", filters.stressLevel);
  if (filters.minAge !== null) query = query.gte("age", filters.minAge);
  if (filters.maxAge !== null) query = query.lte("age", filters.maxAge);
  if (filters.after !== null) query = query.gt("id", filters.after);
  if (filters.before !== null) query = query.lt("id", filters.before);

  const backward = filters.before !== null;
  const { data, error } = await query
    .order("id", { ascending: !backward })
    .limit(PAGE_SIZE + 1);

  if (error) throw new Error(`Unable to load records: ${error.message}`);
  const hasMore = (data?.length ?? 0) > PAGE_SIZE;
  const rows = (data ?? []).slice(0, PAGE_SIZE) as CoffeeHealthRow[];
  if (backward) rows.reverse();

  return {
    rows,
    hasPrevious: backward ? hasMore : filters.after !== null,
    hasNext: backward ? filters.before !== null : hasMore,
  };
}
