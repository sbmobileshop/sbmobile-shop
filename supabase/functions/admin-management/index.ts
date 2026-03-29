import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPER_ADMIN_EMAIL = "shibrul48@gmail.com";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { action, email, password, target_user_id } = await req.json();

    // For setup-super-admin action, create or find the super admin
    if (action === "setup") {
      // Check if user exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      let userId: string | null = null;
      
      const existing = existingUsers?.users?.find(u => u.email === SUPER_ADMIN_EMAIL);
      if (existing) {
        userId = existing.id;
        // Update password
        await supabaseAdmin.auth.admin.updateUserById(userId, { password });
      } else {
        // Create user
        const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
          email: SUPER_ADMIN_EMAIL,
          password,
          email_confirm: true,
        });
        if (error) throw error;
        userId = newUser.user.id;
      }

      // Ensure admin role
      const { data: roleCheck } = await supabaseAdmin
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleCheck) {
        await supabaseAdmin.from('user_roles').insert({ user_id: userId, role: 'admin' });
      }

      // Ensure profile
      const { data: profileCheck } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!profileCheck) {
        await supabaseAdmin.from('profiles').insert({ user_id: userId, full_name: 'Super Admin' });
      }

      return new Response(JSON.stringify({ success: true, user_id: userId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For other actions, verify caller is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claims, error: claimsErr } = await callerClient.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const callerId = claims.claims.sub as string;

    // Check caller is admin
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!callerRole) {
      return new Response(JSON.stringify({ error: 'Not admin' }), { status: 403, headers: corsHeaders });
    }

    if (action === "add-admin") {
      if (!email || !password) throw new Error("Email and password required");
      
      // Create user
      let targetUserId: string;
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUsers?.users?.find(u => u.email === email);
      
      if (existing) {
        targetUserId = existing.id;
      } else {
        const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (error) throw error;
        targetUserId = newUser.user.id;
      }

      // Add admin role
      const { data: roleCheck } = await supabaseAdmin
        .from('user_roles')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleCheck) {
        await supabaseAdmin.from('user_roles').insert({ user_id: targetUserId, role: 'admin' });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === "remove-admin") {
      if (!target_user_id) throw new Error("target_user_id required");
      
      // Check target is not super admin
      const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(target_user_id);
      if (targetUser?.user?.email === SUPER_ADMIN_EMAIL) {
        return new Response(JSON.stringify({ error: 'Cannot remove super admin' }), { status: 403, headers: corsHeaders });
      }

      await supabaseAdmin.from('user_roles').delete().eq('user_id', target_user_id).eq('role', 'admin');

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === "list-admins") {
      const { data: roles } = await supabaseAdmin.from('user_roles').select('user_id, role').eq('role', 'admin');
      const admins = [];
      
      for (const role of roles || []) {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(role.user_id);
        if (userData?.user) {
          admins.push({
            user_id: role.user_id,
            email: userData.user.email,
            is_super: userData.user.email === SUPER_ADMIN_EMAIL,
            created_at: userData.user.created_at,
          });
        }
      }

      return new Response(JSON.stringify({ admins }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === "change-password") {
      if (!target_user_id || !password) throw new Error("target_user_id and password required");
      
      // Only allow changing own password or if super admin
      const { data: callerUser } = await supabaseAdmin.auth.admin.getUserById(callerId);
      const isSuperAdmin = callerUser?.user?.email === SUPER_ADMIN_EMAIL;
      
      if (callerId !== target_user_id && !isSuperAdmin) {
        return new Response(JSON.stringify({ error: 'Can only change own password' }), { status: 403, headers: corsHeaders });
      }

      await supabaseAdmin.auth.admin.updateUserById(target_user_id, { password });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
