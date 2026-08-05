import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Daily cap for signed-in users without an active subscription.
export const FREE_DAILY_MESSAGE_LIMIT = 5;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns how many free messages this user has sent today. */
export async function getTodayUsageCount(uid: string): Promise<number> {
  const { data, error } = await getSupabaseAdmin()
    .from("chat_usage")
    .select("count")
    .eq("user_id", uid)
    .eq("day", today())
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read chat usage: ${error.message}`);
  }

  return data?.count ?? 0;
}

/** Records one free message against today's count and returns the new total. */
export async function incrementTodayUsage(uid: string, currentCount: number): Promise<number> {
  const nextCount = currentCount + 1;

  const { error } = await getSupabaseAdmin().from("chat_usage").upsert(
    {
      user_id: uid,
      day: today(),
      count: nextCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,day" }
  );

  if (error) {
    throw new Error(`Failed to record chat usage: ${error.message}`);
  }

  return nextCount;
}
