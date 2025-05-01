import { supabase } from "../lib/supabaseClient";
import { securedRequest } from "./SecuredService";

export interface Word {
  id: string;
  title: string;
  image_url: string;
  folder_letter_id: string;
  group_id: string;
  user_id: string;
  created_at: string;
  author_name: string;
}

export interface FolderLetter {
  id: string;
  letter: string;
  label: string;
}
export async function updateWord(params: {
  wordId: string;
  title: string;
  imageUrl?: string;
  folderLetterId: string;
  formattedNotes?: string;
}): Promise<void> {
  const { wordId, title, imageUrl, folderLetterId, formattedNotes } = params;

  return securedRequest(async () => {
    const { error } = await supabase
      .from("words")
      .update({
        title,
        image_url: imageUrl,
        folder_letter_id: folderLetterId,
        formatted_notes: formattedNotes ?? '', // boş string fallback
      })
      .eq("id", wordId);

    if (error) {
      throw error;
    }
  });
}

export async function deleteWord(wordId: string): Promise<void> {
  return securedRequest(async () => {
    const { error } = await supabase
      .from("words")
      .delete()
      .eq("id", wordId);

    if (error) {
      throw error;
    }
  });
}

// ✅ Kelime oluşturma
export async function createWord(params: {
  groupId: string;
  userId: string;
  title: string;
  imageUrl?: string;
  folderLetterId: string;
  formattedNotes?: string;
}): Promise<void> {
  const { groupId, userId, title, imageUrl, folderLetterId, formattedNotes } = params;

  return securedRequest(async () => {
    const { error } = await supabase
      .from("words")
      .insert({
        group_id: groupId,
        user_id: userId,
        title,
        image_url: imageUrl,
        folder_letter_id: folderLetterId,
        formatted_notes: formattedNotes ?? '', // yeni alan
      });

    if (error) {
      throw error;
    }
  });
}


// ✅ Gruba göre kelimeleri getir
export async function fetchWordsByGroup(groupId: string): Promise<Word[]> {
  return securedRequest(async () => {
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  });
}

// ✅ Bir dili seçince, o dile ait klasör harflerini getir
export async function getFolderLettersByLanguage(language: string): Promise<FolderLetter[]> {
  return securedRequest(async () => {
    const { data, error } = await supabase
      .from("folder_letters")
      .select("*")
      .eq("language", language)
      .order("letter", { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  });
}
