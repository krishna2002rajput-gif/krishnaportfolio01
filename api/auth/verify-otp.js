import { appendVisitorLog } from '../_lib/sheets.js';
import {
  cacheDelete,
  cacheGet,
  cacheIncrement,
  cacheSet,
  createSession,
  json,
  methodGuard,
  normalizeEmail,
} from '../_lib/security.js';

export default async function handler(request, response) {
  if (methodGuard(request, response, 'POST')) return;

  try {
    const email = normalizeEmail(request.body?.email);
    const otp = String(request.body?.otp || '').trim().toUpperCase();
    if (!email || otp.length !== 6) {
      json(response, 400, { message: 'Email and 6-character OTP are required' });
      return;
    }

    const lockKey = `otp_lock:${email}`;
    if (await cacheGet(lockKey)) {
      json(response, 429, { message: 'Account locked for 15 minutes due to failed verification attempts.' });
      return;
    }

    const expectedOtp = await cacheGet(`otp:${email}`);
    if (!expectedOtp || expectedOtp !== otp) {
      const attempts = await cacheIncrement(`otp_attempts:${email}`, 300);
      if (attempts >= 5) {
        await cacheSet(lockKey, '1', 60 * 15);
      }
      json(response, 401, { message: attempts >= 5 ? 'Account locked for 15 minutes.' : 'Invalid or expired OTP.' });
      return;
    }

    await cacheDelete(`otp:${email}`);
    await cacheDelete(`otp_attempts:${email}`);

    const user = {
      name: email.split('@')[0],
      email,
      method: 'otp',
    };
    const token = await createSession(user);
    await appendVisitorLog({ request, user, method: 'Email OTP' }).catch((error) => console.error(error.message));

    json(response, 200, { user: { ...user, token } });
  } catch (error) {
    json(response, 500, { message: error.message || 'OTP verification failed' });
  }
}
