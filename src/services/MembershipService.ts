import { supabase } from "../lib/supabaseClient";
import { securedRequest } from "./SecuredService";

export interface Group {
  id: string;
  name: string;
  language: string;
}


// Kullanıcının tüm üyeliklerini getir
export async function fetchMembershipsForUser(userId: string) {
  return securedRequest(async () => {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
    return data;
  });
}

// Belirli bir grup için kullanıcının üyeliğini getir
export async function fetchMembershipForGroup(userId: string, groupId: string) {
  return securedRequest(async () => {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('group_id', groupId)
      .single();

    if (error) {
      throw error;
    }
    return data;
  });
}

// Kullanıcının bir üyeliğini sil
export async function deleteMembership(userId: string, groupId: string) {
  return securedRequest(async () => {
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('user_id', userId)
      .eq('group_id', groupId);

    if (error) {
      throw error;
    }
  });
}

// Kullanıcının bir üyeliğinin lisans tarihlerini güncelle
export async function updateLicenseDates(userId: string, groupId: string, newStartDate: string, newEndDate: string) {
  return securedRequest(async () => {
    const { error } = await supabase
      .from('memberships')
      .update({
        license_start: newStartDate,
        license_end: newEndDate,
      })
      .eq('user_id', userId)
      .eq('group_id', groupId);

    if (error) {
      throw error;
    }
  });
}

// Kullanıcının bir üyeliğindeki izinleri güncelle
export async function updateMembershipPermissions(
  userId: string,
  groupId: string,
  permissions: {
    can_add_note: boolean;
    can_edit_note: boolean;
    can_delete_note: boolean;
    can_manage_members: boolean;
  }
) {
  return securedRequest(async () => {
    const { error } = await supabase
      .from('memberships')
      .update(permissions)
      .eq('user_id', userId)
      .eq('group_id', groupId);

    if (error) {
      throw error;
    }
  });
}
export async function fetchUserGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from('full_memberships')
    .select('group_id, group_name, language')
    .order('group_name', { ascending: true });

  if (error) throw new Error(error.message);

  const groupsMap = new Map<string, Group>();

  (data || []).forEach((item) => {
    if (item.group_id && item.group_name && item.language) {
      groupsMap.set(item.group_id, {
        id: item.group_id,
        name: item.group_name,
        language: item.language
      });
    }
  });

  return Array.from(groupsMap.values());
}
