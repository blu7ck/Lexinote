import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // ✅ CORS preflight desteği
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return new Response('user_id parametresi eksik.', {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const { error } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', userId);

    if (error) {
      console.error('Verify Error:', error);
      return new Response('Kullanıcı doğrulanamadı.', {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response('Üyelik başarıyla onaylandı. Artık giriş yapabilirsiniz.', {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err) {
    console.error('Unexpected Error:', err);
    return new Response('Sunucu hatası.', {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
});
