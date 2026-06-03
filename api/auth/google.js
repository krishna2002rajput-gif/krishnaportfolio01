import { appendAuditLog, appendVisitorLog } from '../_lib/sheets.js';
import { cacheIncrement, createSession, json, methodGuard } from '../_lib/security.js';

export default async function handler(request, response) {
  if (methodGuard(request, response, 'POST')) return;

  try {
    const { credential } = request.body || {};
    if (!credential) {
      await appendAuditLog({ request, event: 'Google Login Attempt', status: 'Missing Credential' }).catch((error) => console.error(error.message));
      json(response, 400, { message: 'Missing Google credential' });
      return;
    }

    const verifyResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!verifyResponse.ok) {
      await appendAuditLog({ request, event: 'Google Login Attempt', status: 'Verification Failed' }).catch((error) => console.error(error.message));
      json(response, 401, { message: 'Google credential verification failed' });
      return;
    }

    const profile = await verifyResponse.json();
    if (process.env.GOOGLE_CLIENT_ID && profile.aud !== process.env.GOOGLE_CLIENT_ID) {
      await appendAuditLog({ request, event: 'Google Login Attempt', email: profile.email, status: 'Audience Mismatch' }).catch((error) => console.error(error.message));
      json(response, 401, { message: 'Google credential audience mismatch' });
      return;
    }

    const user = {
      name: profile.name || profile.email,
      email: profile.email,
      picture: profile.picture,
      method: 'google',
    };
    const token = await createSession(user);
    await cacheIncrement('analytics:google_users', 60 * 60 * 24 * 30);
    await cacheIncrement('analytics:total_visitors', 60 * 60 * 24 * 30);
    await appendVisitorLog({ request, user, method: 'Google Login' }).catch((error) => console.error(error.message));
    await appendAuditLog({ request, event: 'Google Login', email: user.email, status: 'Success' }).catch((error) => console.error(error.message));

    json(response, 200, { user: { ...user, token } });
  } catch (error) {
    json(response, 500, { message: error.message || 'Google authentication failed' });
  }
}
