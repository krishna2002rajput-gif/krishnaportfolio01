import { appendAuditLog } from '../_lib/sheets.js';
import {
  cacheGet,
  cacheIncrement,
  cacheSet,
  createOtp,
  json,
  methodGuard,
  normalizeEmail,
  sendOtpEmail,
} from '../_lib/security.js';

export default async function handler(request, response) {
  if (methodGuard(request, response, 'POST')) return;

  try {
    const email = normalizeEmail(request.body?.email);
    if (!email || !email.includes('@')) {
      await appendAuditLog({ request, event: 'OTP Request', status: 'Invalid Email' }).catch((error) => console.error(error.message));
      json(response, 400, { message: 'Valid email is required' });
      return;
    }

    const lockKey = `otp_lock:${email}`;
    const cooldownKey = `cooldown:${email}`;
    const limitKey = `otp_limit:${email}`;

    if (await cacheGet(lockKey)) {
      await appendAuditLog({ request, event: 'OTP Request', email, status: 'Locked' }).catch((error) => console.error(error.message));
      json(response, 429, { message: 'Too many failed attempts. Try again after 15 minutes.' });
      return;
    }

    if (await cacheGet(cooldownKey)) {
      await appendAuditLog({ request, event: 'OTP Request', email, status: 'Cooldown' }).catch((error) => console.error(error.message));
      json(response, 429, { message: 'Please wait 20 seconds before requesting another OTP.' });
      return;
    }

    const requestCount = await cacheIncrement(limitKey, 60);
    if (requestCount > 3) {
      await appendAuditLog({ request, event: 'OTP Request', email, status: 'Rate Limited' }).catch((error) => console.error(error.message));
      json(response, 429, { message: 'OTP request limit reached. Try again in 1 minute.' });
      return;
    }

    const otp = createOtp();
    await cacheSet(`otp:${email}`, otp, 300);
    await cacheSet(cooldownKey, '1', 20);
    await cacheSet(`otp_attempts:${email}`, '0', 300);
    await sendOtpEmail(email, otp);
    await appendAuditLog({ request, event: 'OTP Request', email, status: 'Sent' }).catch((error) => console.error(error.message));

    json(response, 200, { message: 'OTP sent' });
  } catch (error) {
    json(response, 500, { message: error.message || 'Unable to send OTP' });
  }
}
