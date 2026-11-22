// Supabase Edge Function: staff account administration.
// The browser never holds the service key. It calls this function, which first
// checks that the caller has the users.manage permission.
//
// POST { action: "create", staff_id, full_name, password, role_code, specialty? }
// POST { action: "reset_password", user_id, password }
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

const staffEmail = (staffId: string) => `${staffId.trim().toLowerCase()}@staff.medsuite.local`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Client acting as the caller: every query goes through Row Level Security
  // and is written to the audit log under the caller's name.
  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    auth: { persistSession: false },
  });

  const { data: allowed, error: permissionError } = await caller.rpc('has_permission', {
    permission_code: 'users.manage',
  });
  if (permissionError || !allowed) return json({ error: 'Forbidden' }, 403);

  // Service client, used only for the Auth admin calls the caller cannot make.
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const body = await req.json().catch(() => null);
  if (!body?.action) return json({ error: 'Missing action' }, 400);

  if (body.action === 'create') {
    const { staff_id, full_name, password, role_code, specialty } = body;
    if (!staff_id || !role_code || typeof password !== 'string' || password.length < 8) {
      return json({ error: 'staff_id, role_code and a password of at least 8 characters are required' }, 400);
    }

    const { data: role } = await caller.from('roles').select('id').eq('code', role_code).maybeSingle();
    if (!role) return json({ error: 'Unknown role' }, 400);

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: staffEmail(staff_id),
      password,
      email_confirm: true,
      user_metadata: { staff_id, full_name: full_name ?? '' },
    });
    if (createError || !created.user) return json({ error: createError?.message ?? 'Create failed' }, 400);

    const { error: profileError } = await caller
      .from('profiles')
      .update({ role_id: role.id, active: true, specialty: specialty ?? null })
      .eq('id', created.user.id);
    if (profileError) return json({ error: profileError.message }, 400);

    return json({ id: created.user.id });
  }

  if (body.action === 'reset_password') {
    const { user_id, password } = body;
    if (!user_id || typeof password !== 'string' || password.length < 8) {
      return json({ error: 'user_id and a password of at least 8 characters are required' }, 400);
    }
    const { error } = await admin.auth.admin.updateUserById(user_id, { password });
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }

  return json({ error: 'Unknown action' }, 400);
});
