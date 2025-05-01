import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Random şifre oluşturucu
function generateRandomPassword(length = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

serve(async (req) => {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return new Response('Email parametresi eksik.', { status: 400 });
    }

    const { data: userRecord, error: userFetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userFetchError || !userRecord) {
      console.error('Kullanıcı bulunamadı:', userFetchError?.message);
      return new Response('Kullanıcı bulunamadı.', { status: 404 });
    }

    const userId = userRecord.id;
    const newPassword = generateRandomPassword();

    // Supabase Auth şifresini güncelle
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (updateError) {
      console.error('Şifre güncelleme hatası:', updateError);
      return new Response('Şifre güncellenemedi.', { status: 500 });
    }

    // users tablosundaki şifreyi de güncelle (opsiyonel)
    await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId);

    // Mailgun ile yeni şifreyi gönder
    const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY')!;
    const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN')!;
    const MAILGUN_URL = Deno.env.get('MAILGUN_URL')!;

    const subject = "Lexinote - Şifre Sıfırlama Başarılı!";
    const textContent = `
Merhaba,

Şifreniz başarıyla sıfırlandı.

Giriş Bilgileriniz:
Email: ${email}
Yeni Şifre: ${newPassword}

Giriş yaptıktan sonra şifrenizi değiştirmenizi tavsiye ederiz.

İyi çalışmalar,
Lexinote Ekibi
`;

    const formData = new URLSearchParams();
    formData.append("from", `Lexinote <noreply@${MAILGUN_DOMAIN}>`);
    formData.append("to", email);
    formData.append("subject", subject);
    formData.append("text", textContent);

    const response = await fetch(`${MAILGUN_URL}/messages`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`api:${MAILGUN_API_KEY}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mailgun Error:', errorText);
      return new Response('Email gönderilemedi.', { status: 500 });
    }

    return new Response('Şifre sıfırlandı ve email gönderildi.', { status: 200 });

  } catch (err) {
    console.error('Unexpected Error:', err);
    return new Response('Sunucu hatası.', { status: 500 });
  }
});
