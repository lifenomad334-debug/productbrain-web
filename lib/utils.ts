export function assertEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function safeBase64ToBuffer(b64: string): Buffer {
  const cleaned = b64.includes("base64,") ? b64.split("base64,")[1] : b64;
  return Buffer.from(cleaned, "base64");
}

export function publicStorageUrl(path: string) {
  const url = assertEnv("SUPABASE_URL");
  const bucket = assertEnv("SUPABASE_BUCKET");
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}
