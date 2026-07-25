import { supabase } from "@/lib/supabase";

export type CloudMember = {
  id: string;
  member_code: string;
  name: string;
  mobile: string;
  birthday: string | null;
  stamps: number;
  total_visits: number;
  favorite_drink: string;
  joined_at: string;
};

export async function registerCloudMember(input: { name: string; mobile: string; birthday: string; pin: string }) {
  const { data, error } = await supabase.rpc("register_loyalty_member", {
    p_name: input.name.trim(), p_mobile: input.mobile.replace(/\D/g, ""), p_birthday: input.birthday, p_pin: input.pin,
  });
  if (error) throw error;
  return data as CloudMember;
}

const MEMBER_REQUEST_TIMEOUT_MS = 8000;

async function withTimeout<T>(request: PromiseLike<T>, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out. Check Supabase SQL/RLS and internet connection.`)), MEMBER_REQUEST_TIMEOUT_MS);
  });
  try {
    return await Promise.race([Promise.resolve(request), timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function searchCloudMembers(query: string) {
  if (!query.trim()) return listCloudMembers();

  const rpc = await withTimeout(
    supabase.rpc("search_loyalty_members", { p_query: query.trim() }),
    "Member search",
  );
  if (!rpc.error) return (rpc.data ?? []) as CloudMember[];

  // Fallback to direct table search when the RPC is missing or stale.
  const cleaned = query.trim();
  const digits = cleaned.replace(/\D/g, "");
  const filter = [
    `member_code.ilike.%${cleaned}%`,
    `name.ilike.%${cleaned}%`,
    digits ? `mobile.ilike.%${digits}%` : "",
  ].filter(Boolean).join(",");
  const direct = await withTimeout(
    supabase.from("loyalty_members").select("*").or(filter).order("name", { ascending: true }).limit(8),
    "Member search fallback",
  );
  if (direct.error) throw new Error(`${rpc.error.message}; fallback: ${direct.error.message}`);
  return (direct.data ?? []) as CloudMember[];
}

export async function listCloudMembers(limit = 20) {
  const rpc = await withTimeout(
    supabase.rpc("list_loyalty_members", { p_limit: limit }),
    "Member directory",
  );
  if (!rpc.error) return (rpc.data ?? []) as CloudMember[];

  // Fallback keeps the POS usable even if the RPC was not refreshed yet.
  const direct = await withTimeout(
    supabase.from("loyalty_members").select("*").order("updated_at", { ascending: false }).limit(limit),
    "Member directory fallback",
  );
  if (direct.error) throw new Error(`${rpc.error.message}; fallback: ${direct.error.message}`);
  return (direct.data ?? []) as CloudMember[];
}

export async function loginCloudMember(identity: string, pin: string) {
  const { data, error } = await supabase.rpc("login_loyalty_member", { p_identity: identity.trim(), p_pin: pin });
  if (error) throw error;
  return ((data ?? [])[0] ?? null) as CloudMember | null;
}

export async function addCloudStamp(memberCode: string, count = 1) {
  const { data, error } = await supabase.rpc("add_loyalty_stamp", { p_member_code: memberCode, p_count: count });
  if (error) throw error;
  return data as CloudMember;
}
