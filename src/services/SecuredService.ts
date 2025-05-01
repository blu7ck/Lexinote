import { supabase } from "../lib/supabaseClient";

export async function securedRequest<T>(fn: () => Promise<T>): Promise<T> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    throw new Error("Yetkisiz erişim. Lütfen giriş yapın.");
  }
  return await fn();
}
