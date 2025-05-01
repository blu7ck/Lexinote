import { supabase } from '../lib/supabaseClient'

export interface Membership {
  id: string;
  
  // Kullanıcı ve grup bilgileri
  user_id: string;
  group_id: string;
  group_name: string;
  full_name: string;
  email: string;

  // Yetkiler (admin tarafından oluşturulurken atanır)
  can_add_note: boolean;
  can_edit_note: boolean;
  can_delete_note: boolean;
  can_manage_members: boolean;

  // Lisans bilgileri (bilgilendirme mailleri için kullanılır)
  license_start: string | null;
  license_end: string | null;
}


export async function getMembershipsByUser(userId: string): Promise<Membership[]> {
  const { data, error } = await supabase
    .from('full_memberships')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Üyelik bilgileri alınamadı:', error.message)
    return []
  }

  return data as Membership[]
}
