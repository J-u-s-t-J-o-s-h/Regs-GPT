import type { NextApiRequest } from "next";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface AuthedUser {
  uid: string;
  /** Optional (not null) to match what Stripe's SDK accepts. */
  email?: string;
}

/**
 * Verifies the caller's Supabase access token.
 *
 * Returns `{ uid, email }` — the same shape the previous Firebase
 * implementation returned, so API routes consuming it need no changes.
 */
export async function requireUser(req: NextApiRequest): Promise<AuthedUser> {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);

  if (error || !data.user) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  return { uid: data.user.id, email: data.user.email ?? undefined };
}
