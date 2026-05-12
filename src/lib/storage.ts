import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Bucket = "cleaning-photos" | "forgotten-items" | "cleaner-avatars";

/**
 * Extract storage path from either a raw path or a legacy public URL.
 * Buckets are now private; legacy `getPublicUrl` URLs no longer work and
 * must be re-signed.
 */
export function extractPath(bucket: Bucket, value: string): string {
  if (!value) return value;
  const re = new RegExp(`/object/(?:public|sign|authenticated)/${bucket}/([^?]+)`);
  const m = value.match(re);
  return m ? decodeURIComponent(m[1]) : value;
}

/** Generate a signed URL (default 1h). Returns null on error. */
export async function signedUrl(
  bucket: Bucket,
  pathOrUrl: string | null | undefined,
  expiresIn = 3600,
): Promise<string | null> {
  if (!pathOrUrl) return null;
  const path = extractPath(bucket, pathOrUrl);
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) {
    console.warn("[signedUrl]", bucket, path, error.message);
    return null;
  }
  return data.signedUrl;
}

/** Hook: resolve a private storage path to a signed URL. */
export function useSignedUrl(bucket: Bucket, pathOrUrl: string | null | undefined, expiresIn = 3600) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (!pathOrUrl) { setUrl(null); return; }
    signedUrl(bucket, pathOrUrl, expiresIn).then((u) => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [bucket, pathOrUrl, expiresIn]);
  return url;
}
