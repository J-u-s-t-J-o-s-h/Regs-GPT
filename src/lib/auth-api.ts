import type { NextApiRequest } from "next";
import { adminAuth } from "@/lib/firebase-admin";

export async function requireUser(req: NextApiRequest) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  return adminAuth.verifyIdToken(token);
}
