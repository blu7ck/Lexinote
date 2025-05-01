import { supabaseAdmin } from '../lib/supabaseAdminClient';
import { supabase } from '../lib/supabaseClient';

// ✅ Kullanıcı var mı kontrolü
async function checkUserExistsByEmail(email: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Kullanıcı kontrolü sırasında hata:', error.message);
    throw new Error('Kullanıcı kontrolü başarısız.');
  }

  return !!data;
}

// ✅ Üye ekleme (EDGE FUNCTION kullanıyoruz)
export async function addUserToGroup(
  full_name: string,
  email: string,
  groupId: string,
  licenseEnd: string,
  permissions: {
    can_add_note: boolean;
    can_edit_note: boolean;
    can_delete_note: boolean;
    can_manage_members: boolean;
  }
) {
  const userExists = await checkUserExistsByEmail(email);

  if (userExists) {
    throw new Error('Bu email adresine sahip bir kullanıcı zaten mevcut.');
  }

  // 🧪 Log ekle: Gönderilecek veriyi yazdıralım
  console.log('GÖNDERİLEN VERİ:', {
    full_name,
    email,
    group_id: groupId,
    license_expires_at: licenseEnd,
    permissions,
  });

  const cleanedPermissions = {
    can_add_note: !!permissions.can_add_note,
    can_edit_note: !!permissions.can_edit_note,
    can_delete_note: !!permissions.can_delete_note,
    can_manage_members: !!permissions.can_manage_members,
  };
  
  console.log('Gönderilecek permissions:', cleanedPermissions);

  const { data, error } = await supabase.functions.invoke('add-user-to-group', {
    body: {
      full_name,
      email,
      group_id: groupId,
      license_expires_at: licenseEnd,
      permissions: cleanedPermissions,
    },
  });

  if (error) {
    console.error('Üye ekleme hatası:', error.message);
    throw new Error('Üye eklenirken hata oluştu.');
  }

  return data;
}




// ✅ Üye silme (AdminClient kullanıyoruz)
export async function removeUserFromGroup(email: string, groupId: string) {
  const { error } = await supabase.functions.invoke('remove-user-from-group', {
    body: {
      email,
      groupId,
    }
  });

  if (error) {
    console.error('Kullanıcı silme hatası:', error.message);
    throw new Error('Kullanıcı silinirken hata oluştu.');
  }
}

// ✅ Grup oluşturma
export async function createGroup(name: string, language: string) {
  const { error } = await supabaseAdmin
    .from('groups')
    .insert({ name, language });

  if (error) {
    console.error('Grup oluşturma hatası:', error.message);
    throw new Error('Grup oluşturulurken hata oluştu.');
  }
}

// ✅ Grup adını güncelleme
export async function updateGroup(groupId: string, name: string) {
  const { error } = await supabaseAdmin
    .from('groups')
    .update({ name })
    .eq('id', groupId);

  if (error) {
    console.error('Grup güncelleme hatası:', error.message);
    throw new Error('Grup güncellenirken hata oluştu.');
  }
}

// ✅ Grup silme
export async function deleteGroup(groupId: string) {
  const { error } = await supabaseAdmin
    .from('groups')
    .delete()
    .eq('id', groupId);

  if (error) {
    console.error('Grup silme hatası:', error.message);
    throw new Error('Grup silinirken hata oluştu.');
  }
}

// ✅ Tüm grupları çekme
export async function fetchGroups() {
  const { data, error } = await supabaseAdmin
    .from('groups')
    .select('*');

  if (error) {
    console.error('Gruplar çekilirken hata oluştu:', error.message);
    throw new Error('Gruplar çekilemedi.');
  }

  return data || [];
}

// ✅ Grup üyelerini çekme
export async function fetchGroupMembers(groupId: string) {
  const { data, error } = await supabaseAdmin
    .from('full_memberships')
    .select('full_name, email')
    .eq('group_id', groupId);

  if (error) {
    console.error('Grup üyeleri çekilirken hata oluştu:', error.message);
    throw new Error('Grup üyeleri çekilemedi.');
  }

  return data || [];
}

// ✅ Permissions tipi (eğer başka dosyada yoksa)
export type Permissions = {
  can_add_note: boolean;
  can_edit_note: boolean;
  can_delete_note: boolean;
  can_manage_members: boolean;
};
