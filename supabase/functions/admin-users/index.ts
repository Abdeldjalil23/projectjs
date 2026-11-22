// Supabase Edge Function: staff account administration.
// The browser never holds the secret key. It calls this function, which first
// checks who the caller is and that they have the users.manage permission.
// Deploy with --no-verify-jwt: the function checks the caller itself (see below).
//
// POST { action: "create", staff_id, full_name, password, role_code, specialty? }
// POST { action: "reset_password", user_id, password }
import { createClient } from 'npm:@supabase/supabase-js@2';

// Every header the Supabase library may send, so the browser's preflight check passes.
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

const staffEmail = (staffId: string) => `${staffId.trim().toLowerCase()}@staff.medsuite.local`;

// Letters, digits, dot, dash and underscore: the identifier becomes part of an e-mail address.
const STAFF_ID_PATTERN = /^[A-Za-z0-9._-]{2,32}$/;

// New projects provide publishable and secret keys as JSON dictionaries; older
// projects provide the legacy anon and service_role keys. Accept both.
const projectKey = (dictionaryName: string, legacyName: string): string | undefined => {
  const raw = Deno.env.get(dictionaryName);
  if (raw) {
    try {
      const keys = JSON.parse(raw) as Record<string, string>;
      const key = keys.default ?? Object.values(keys)[0];
      if (key) return key;
    } catch {
      // Fall back to the legacy key below.
    }
  }
  return Deno.env.get(legacyName);
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const publicKey = projectKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY');
  const secretKey = projectKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !publicKey || !secretKey) return json({ error: 'Server keys are missing' }, 500);

  // The caller must be a signed-in user: their access token is checked with Supabase Auth.
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Not signed in' }, 401);

  // Client acting as the caller: every query goes through Row Level Security
  // and is written to the audit log under the caller's name.
  const caller = createClient(url, publicKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerUser, error: userError } = await caller.auth.getUser(token);
  if (userError || !callerUser.user) return json({ error: 'Not signed in' }, 401);

  const { data: allowed, error: permissionError } = await caller.rpc('has_permission', {
    permission_code: 'users.manage',
  });
  if (permissionError || allowed !== true) return json({ error: 'Forbidden' }, 403);

  // Secret-key client, used only for the Auth admin calls the caller cannot make.
  const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const body = await req.json().catch(() => null);
  if (!body?.action) return json({ error: 'Missing action' }, 400);

  if (body.action === 'create') {
    const { staff_id, full_name, password, role_code, specialty } = body;
    if (typeof staff_id !== 'string' || !STAFF_ID_PATTERN.test(staff_id.trim())) {
      return json({ error: 'The ID may only contain letters, digits, dots, dashes and underscores (2 to 32)' }, 400);
    }
    if (!role_code || typeof password !== 'string' || password.length < 8) {
      return json({ error: 'role_code and a password of at least 8 characters are required' }, 400);
    }

    const { data: role } = await caller.from('roles').select('id').eq('code', role_code).maybeSingle();
    if (!role) return json({ error: 'Unknown role' }, 400);

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: staffEmail(staff_id),
      password,
      email_confirm: true,
      user_metadata: { staff_id: staff_id.trim(), full_name: full_name ?? '' },
    });
    if (createError || !created.user) return json({ error: createError?.message ?? 'Create failed' }, 400);

    const { error: profileError } = await caller
      .from('profiles')
      .update({ role_id: role.id, active: true, specialty: specialty ?? null })
      .eq('id', created.user.id);
    if (profileError) {
      // Do not leave a half-created account behind.
      await admin.auth.admin.deleteUser(created.user.id);
      return json({ error: profileError.message }, 400);
    }

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
