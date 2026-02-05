// lib/check-whitelist.ts
// 생성 API(route.ts)에서 호출하여 화이트리스트 체크

import { createClient } from "@supabase/supabase-js";

// service_role 키 사용 (RLS 우회하여 whitelist 테이블 읽기)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function isWhitelisted(email: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("beta_whitelist")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !data) return false;
  return true;
}

export async function getWhitelistCount(): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("beta_whitelist")
    .select("*", { count: "exact", head: true });

  if (error) return 0;
  return count || 0;
}
