import { supabase } from "./client";

export async function getCurrentSession() {
  if (!supabase) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}
