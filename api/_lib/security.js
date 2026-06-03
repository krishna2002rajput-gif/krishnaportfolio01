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

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.OTP_FROM_EMAIL || 'Portfolio Access <onboarding@resend.dev>',
      to: email,
      subject: 'Krishna Rajput Portfolio Access Code',
      text: `Your secure portfolio access code is ${otp}. It expires in 5 minutes.`,
    }),
  });

  if (!response.ok) {
    throw new Error('Unable to send OTP email');
  }
};
