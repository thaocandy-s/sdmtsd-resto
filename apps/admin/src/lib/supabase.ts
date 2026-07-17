import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const MEDIA_BUCKET = "media";

/** Build a unique, safe storage path for an uploaded file. */
export function buildStoragePath(fileName: string, folder?: string | null): string {
  const ext = fileName.includes(".") ? fileName.slice(fileName.lastIndexOf(".")) : "";
  const base = fileName
    .replace(ext, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const prefix = folder ? `${folder.replace(/^\/+|\/+$/g, "")}/` : "";
  return `${prefix}${base || "file"}-${unique}${ext}`;
}
