import { getSupabaseClient } from "@/infrastructure/supabase/clients/browserSupabaseClient";

export async function getCurrentSession() {
  const client = getSupabaseClient();

  if (!client) {
    return null;
  }

  const {
    data: { session },
  } = await client.auth.getSession();

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function getCurrentProfileId() {
  const client = getSupabaseClient();

  if (!client) {
    return null;
  }

  const session = await getCurrentSession();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const { data, error } = await client
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw error;
  }

  if (!data?.id) {
    return null;
  }

  return data.id;
}
