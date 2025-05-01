import { createClient } from '@supabase/supabase-js';

// .env dosyasından değerleri çekiyoruz
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL veya Anon Key bulunamadı. .env dosyasını kontrol edin.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false, // 🔥 Tarayıcıda oturum saklanmasın
      autoRefreshToken: true, // 🔥 İstersen token süresi bitince yenilesin
      detectSessionInUrl: false, // 🔥 Magic Link kullanmıyorsan kapalı dursun
    },
  }
);
