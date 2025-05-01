import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  try {
    const body = await req.json();
    const { email, password, user_id } = body;

    if (!email || !password || !user_id) {
      console.warn('Eksik alan:', { email, password, user_id });
      return new Response('Eksik alanlar gönderildi.', {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY');
    const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN');
    const MAILGUN_URL = Deno.env.get('MAILGUN_URL');
    const BASE_SITE_URL = Deno.env.get('BASE_SITE_URL');

    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !MAILGUN_URL || !BASE_SITE_URL) {
      console.error('Eksik .env değişkeni:', {
        MAILGUN_API_KEY,
        MAILGUN_DOMAIN,
        MAILGUN_URL,
        BASE_SITE_URL,
      });
      return new Response('Sunucu yapılandırma hatası (env).', {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const subject = "Lexinote Hesabınız Oluşturuldu! Üyeliğinizi Onaylayın";
    const verificationLink = `${BASE_SITE_URL}/verify?user_id=${user_id}`;
    const textContent = `
Merhaba,

Lexinote hesabınız oluşturuldu.

Giriş Bilgileriniz:
Email: ${email}
Şifre: ${password}

Üyeliğinizi tamamlamak için aşağıdaki bağlantıya tıklayın:
${verificationLink}

Bu bağlantıya tıklamadan hesabınız aktif olmayacaktır.

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
      console.error('Mailgun gönderim hatası:', errorText);
      return new Response(`Email gönderilemedi. Detay: ${errorText}`, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response('Email başarıyla gönderildi.', {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });

  } catch (err) {
    console.error('Sunucu hatası:', err);
    return new Response('Sunucu hatası.', {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
});
