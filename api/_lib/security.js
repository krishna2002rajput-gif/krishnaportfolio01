import crypto from 'node:crypto';

const memoryStore = globalThis.__portfolioMemoryStore || new Map();
globalThis.__portfolioMemoryStore = memoryStore;

const redisCommand = async (command) => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error('Redis command failed');
  }

  const payload = await response.json();
  return payload.result;
};

const memoryGet = (key) => {
  const value = memoryStore.get(key);
  if (!value) return null;
  if (value.expiresAt && value.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return value.data;
};

export const cacheGet = async (key) => {
  const value = await redisCommand(['GET', key]);
  return value ?? memoryGet(key);
};

export const cacheSet = async (key, value, ttlSeconds) => {
  await redisCommand(['SET', key, value, 'EX', ttlSeconds]);
  memoryStore.set(key, {
    data: value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

export const cacheDelete = async (key) => {
  await redisCommand(['DEL', key]);
  memoryStore.delete(key);
};

export const cacheIncrement = async (key, ttlSeconds) => {
  const redisValue = await redisCommand(['INCR', key]);
  if (redisValue === 1) {
    await redisCommand(['EXPIRE', key, ttlSeconds]);
  }

  if (redisValue !== null) return Number(redisValue);

  const nextValue = Number(memoryGet(key) || 0) + 1;
  memoryStore.set(key, {
    data: String(nextValue),
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  return nextValue;
};

export const json = (response, statusCode, body) => {
  response.status(statusCode).json(body);
};

export const methodGuard = (request, response, method) => {
  if (request.method === method) return false;
  json(response, 405, { message: 'Method not allowed' });
  return true;
};

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const createOtp = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => alphabet[crypto.randomInt(0, alphabet.length)]).join('');
};

export const createSession = async (user) => {
  const token = crypto.randomBytes(32).toString('base64url');
  await cacheSet(`session:${token}`, JSON.stringify(user), 60 * 60 * 8);
  return token;
};

export const readSession = async (request) => {
  const authHeader = request.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const session = await cacheGet(`session:${token}`);
  return session ? { token, user: JSON.parse(session) } : null;
};

export const signAssetToken = (asset) => {
  const exp = Math.floor(Date.now() / 1000) + 60;
  const body = Buffer.from(JSON.stringify({ asset, exp })).toString('base64url');
  const secret = process.env.ASSET_SIGNING_SECRET || process.env.SESSION_SECRET || 'dev-only-secret';
  const signature = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
};

export const verifyAssetToken = (token) => {
  const [body, signature] = String(token || '').split('.');
  if (!body || !signature) return null;

  const secret = process.env.ASSET_SIGNING_SECRET || process.env.SESSION_SECRET || 'dev-only-secret';
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
};

export const sendOtpEmail = async (email, otp) => {
  if (!process.env.RESEND_API_KEY) {
    console.log(`Development OTP for ${email}: ${otp}`);
    return;
  }

  const from = process.env.OTP_FROM_EMAIL || 'Krishna Portfolio <onboarding@resend.dev>';
  const subject = 'Your Krishna Rajput Portfolio access code';
  const text = [
    'Krishna Rajput Portfolio',
    '',
    `Your secure access code is: ${otp}`,
    '',
    'This code expires in 5 minutes. If you did not request access, you can safely ignore this email.',
  ].join('\n');
  const html = `
    <div style="margin:0;padding:24px;background:#f6f8fb;font-family:Arial,sans-serif;color:#0f172a">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:28px">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#2563eb">Secure portfolio access</p>
        <h1 style="margin:0 0 18px;font-size:24px;line-height:1.2;color:#0f172a">Krishna Rajput Portfolio</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155">Use the verification code below to continue to the executive portfolio portal.</p>
        <div style="margin:0 0 18px;padding:18px 20px;border-radius:12px;background:#0f172a;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:.18em;text-align:center">${otp}</div>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b">This code expires in 5 minutes. If you did not request access, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject,
      text,
      html,
      headers: {
        'X-Entity-Ref-ID': crypto.randomUUID(),
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Unable to send OTP email');
  }
};
