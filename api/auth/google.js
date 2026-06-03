import { appendVisitorLog } from '../_lib/sheets.js';
import { createSession, json, methodGuard } from '../_lib/security.js';

export default async function handler(request, response) {
  if (methodGuard(request, response, 'POST')) return;

  try {
    const { credential } = request.body || {};
    if (!credential) {
      json(response, 400, { message: 'Missing Google credential' });
      return;
    }

    const verifyResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!verifyResponse.ok) {
      json(response, 401, { message: 'Google credential verification failed' });
      return;
    }

    const profile = await verifyResponse.json();
    if (process.env.GOOGLE_CLIENT_ID && profile.aud !== process.env.GOOGLE_CLIENT_ID) {
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
    await appendVisitorLog({ request, user, method: 'Google Login' }).catch((error) => console.error(error.message));

    json(response, 200, { user: { ...user, token } });
  } catch (error) {
    json(response, 500, { message: error.message || 'Google authentication failed' });
  }
}
