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

export async function searchCloudMembers(query: string) {
  if (!query.trim()) return [] as CloudMember[];
  const { data, error } = await supabase.rpc("search_loyalty_members", { p_query: query.trim() });
  if (error) throw error;
  return (data ?? []) as CloudMember[];
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
