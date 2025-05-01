import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const { email, group_id } = await req.json();

    if (!email || !group_id) {
      return new Response(JSON.stringify({ error: 'Eksik email veya group_id.' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 1. Kullanıcı ID'sini email ile bul
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Kullanıcı bulunamadı.' }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    const userId = user.id;

    // 2. Membership kaydını sil
    const { error: deleteMembershipError } = await supabase
      .from('memberships')
      .delete()
      .eq('user_id', userId)
      .eq('group_id', group_id);

    if (deleteMembershipError) {
      console.error('Membership silme hatası:', deleteMembershipError.message);
      return new Response(JSON.stringify({ error: deleteMembershipError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // 3. (İstersen permission kaydını da silebilirsin)
    await supabase
      .from('permissions')
      .delete()
      .eq('user_email', email)
      .eq('group_id', group_id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (err) {
    console.error('Sunucu hatası:', err);
    return new Response(JSON.stringify({ error: 'Sunucu hatası.' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
