import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    })
  }

  const {
    full_name,
    email,
    group_id,
    license_expires_at,
    permissions
  } = await req.json()

  if (
    !full_name ||
    !email ||
    !group_id ||
    !license_expires_at ||
    typeof permissions !== 'object' ||
    permissions === null
  ) {
    return new Response('Eksik veya hatalı alanlar', {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }

  const password = crypto.randomUUID().slice(0, 10)

  const { data: user, error: userError } = await supabaseClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (userError) {
    console.error('auth hatası:', userError)
    if (userError.message?.toLowerCase().includes('user already registered')) {
      return new Response('Bu e-posta zaten kayıtlı.', {
        status: 409,
        headers: { 'Access-Control-Allow-Origin': '*' },
      })
    }

    return new Response(userError.message || 'Kullanıcı oluşturulurken hata oluştu.', {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }

  const user_id = user.user.id

  const { error: insertError } = await supabaseClient.from('users').insert({
    id: user_id,
    full_name,
    email,
    password,
    is_verified: true,
    license_expires_at,
  })

  if (insertError) {
    return new Response(insertError.message, {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }

  const allowedPermissions = {
    can_add_note: !!permissions.can_add_note,
    can_edit_note: !!permissions.can_edit_note,
    can_delete_note: !!permissions.can_delete_note,
    can_manage_members: !!permissions.can_manage_members,
  }

  const { error: membershipError } = await supabaseClient.from('memberships').insert({
    user_id,
    group_id,
    license_start: new Date().toISOString(), // ✅ eklendi
    ...allowedPermissions,
  })

  if (membershipError) {
    return new Response(membershipError.message, {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }

  const { error: emailError } = await supabaseClient.functions.invoke('send-user-created-email', {
    body: {
      email,
      password,
      user_id: user_id,
      licenseEndDate: license_expires_at,
      groupName: group_id
    }
  });
  
  if (emailError) {
    console.warn('E-posta gönderilemedi ama kullanıcı kaydı başarılı:', emailError.message);
    return new Response(JSON.stringify({
      success: true,
      warning: 'Kayıt başarılı ancak e-posta gönderilemedi.',
      password
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 200
    });
  }
  
  return new Response(JSON.stringify({ success: true, password }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    status: 200
  });  
})
