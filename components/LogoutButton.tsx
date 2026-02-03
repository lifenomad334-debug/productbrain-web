"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabaseBrowser.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-gray-500 hover:text-gray-800 border border-gray-300 px-3 py-1 rounded-lg"
    >
      로그아웃
    </button>
  );
}
