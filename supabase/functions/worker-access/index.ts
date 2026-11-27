// Supabase Edge Function: activation of a worker's account in the workers' app.
// The worker has no account yet, so this function is called without one: it checks the number
// (matricule) and the activation code given by the staff, then creates the account with the
// password the worker chose, or sets that password when the account already exists (a new code
// is how a forgotten password is reset). Deploy with JWT verification off (--no-verify-jwt).
//
// POST { matricule, code, password } → { login }  (login: the identifier to sign in with)
import { createClient } from 'npm:@supabase/supabase-js@2';

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

const workerEmail = (login: string) => `${login}@worker.medsuite.local`;

// New projects provide secret keys as a JSON dictionary; older ones the service_role key.
const secretKey = (): string | undefined => {
  const raw = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (raw) {
    try {
      const keys = JSON.parse(raw) as Record<string, string>;
      const key = keys.default ?? Object.values(keys)[0];
      if (key) return key;
    } catch {
      // Fall back to the legacy key below.
    }
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
};

// The same answer for an unknown number, a wrong code and a used or expired code, so the
// function tells nothing about who has a code.
const INVALID = 'Invalid number or activation code';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const key = secretKey();
  if (!url || !key) return json({ error: 'Server keys are missing' }, 500);
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const body = await req.json().catch(() => null);
  const matricule = typeof body?.matricule === 'string' ? body.matricule.trim() : '';
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!matricule || matricule.length > 64 || !code || code.length > 20) return json({ error: INVALID }, 400);
  if (password.length < 8 || password.length > 72) return json({ error: 'The password needs 8 to 72 characters' }, 400);

  const { data: rows, error: redeemError } = await admin.rpc('redeem_worker_invitation', { p_matricule: matricule, p_code: code });
  if (redeemError) return json({ error: redeemError.message }, 500);
  const invitation = (rows ?? [])[0] as { invitation_id: string; beneficiary_id: string; user_id: string | null; login: string } | undefined;
  if (!invitation) return json({ error: INVALID }, 400);

  let userId = invitation.user_id;
  if (userId) {
    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) return json({ error: error.message }, 400);
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: workerEmail(invitation.login),
      password,
      email_confirm: true,
      user_metadata: { kind: 'worker' },
    });
    if (error || !created.user) return json({ error: error?.message ?? 'Create failed' }, 400);
    userId = created.user.id;
  }

  const { error: linkError } = await admin.rpc('complete_worker_invitation', { p_invitation_id: invitation.invitation_id, p_user_id: userId });
  if (linkError) {
    // Do not leave an account behind that is linked to nobody.
    if (!invitation.user_id) await admin.auth.admin.deleteUser(userId);
    return json({ error: linkError.message }, 400);
  }

  return json({ login: invitation.login });
});
