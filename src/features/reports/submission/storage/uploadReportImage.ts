import type { SupabaseClient } from "@supabase/supabase-js";

const STORAGE_BUCKET = "item-images";

function getSupabaseErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const maybeError = error as {
    message?: unknown;
    details?: unknown;
    hint?: unknown;
    code?: unknown;
  };

  const parts = [
    typeof maybeError.message === "string" ? maybeError.message : undefined,
    typeof maybeError.details === "string" ? maybeError.details : undefined,
    typeof maybeError.hint === "string" ? maybeError.hint : undefined,
    typeof maybeError.code === "string" ? `code: ${maybeError.code}` : undefined,
  ].filter((value): value is string => Boolean(value && value.trim().length > 0));

  return parts.length > 0 ? parts.join(" · ") : fallback;
}

export async function uploadReportImage(
  supabase: SupabaseClient | null,
  file: File,
): Promise<string> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const safeFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${file.name.replace(/\s+/g, "-").toLowerCase()}`;
  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(safeFileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) {
    const uploadMessage = getSupabaseErrorMessage(uploadError, "Image upload failed.");
    throw new Error(`Image upload failed: ${uploadMessage}`);
  }

  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(safeFileName);
  return publicUrlData.publicUrl || "";
}
