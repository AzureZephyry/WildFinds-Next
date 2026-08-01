import { getSupabaseClient } from "@/infrastructure/supabase/clients/browserSupabaseClient";

export interface SignInWithPasswordInput {
  email: string;
  password: string;
}

export async function signInWithPassword(
  input: SignInWithPasswordInput,
): Promise<void> {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { error } = await client.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw error;
  }
}
