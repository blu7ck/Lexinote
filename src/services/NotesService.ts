import { supabase } from "../lib/supabaseClient";

export interface Note {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  folder_type?: string;
  category?: string;
  user_id: string;
  created_at?: string;
  subhead?: string;
}

// Notları getir (sadece kendi notlarını çeker)
export async function fetchNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}


// Yeni not oluştur
export async function createNote(title: string, content: string): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ title, content }])
    .select()
    .single();

  if (error) throw error;
  return data;
}


// Notu güncelle
export async function updateNote(noteId: string, title: string, content: string) {
  const { error } = await supabase
    .from('notes')
    .update({ title, content })
    .eq('id', noteId);

  if (error) throw new Error(error.message);
}

// Notu sil
export async function deleteNote(noteId: string) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) throw new Error(error.message);
}
