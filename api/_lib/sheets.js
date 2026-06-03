import crypto from 'node:crypto';

const base64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

const getAccessToken = async () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const unsignedToken = `${base64url(header)}.${base64url(claim)}`;
  const signature = crypto.createSign('RSA-SHA256').update(unsignedToken).sign(privateKey, 'base64url');
  const assertion = `${unsignedToken}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error('Google service account token request failed');
  }

  const payload = await response.json();
  return payload.access_token;
};

export const appendVisitorLog = async ({ request, user, method, status = 'Verified' }) => {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) return;

  const token = await getAccessToken();
  if (!token) return;

  const userAgent = request.headers['user-agent'] || '';
  const ip =
    request.headers['x-forwarded-for']?.split(',')[0] ||
    request.headers['x-real-ip'] ||
    'unknown';
  const country = request.headers['x-vercel-ip-country'] || 'unknown';
  const device = /mobile|android|iphone|ipad/i.test(userAgent) ? 'Mobile' : 'Desktop';
  const browser = /edg/i.test(userAgent)
    ? 'Edge'
    : /chrome/i.test(userAgent)
      ? 'Chrome'
      : /firefox/i.test(userAgent)
        ? 'Firefox'
        : /safari/i.test(userAgent)
          ? 'Safari'
          : 'Unknown';

  const values = [[
    new Date().toISOString(),
    user.name || '',
    user.email,
    method,
    country,
    device,
    browser,
    ip,
    1,
    status,
  ]];

  const range = encodeURIComponent(process.env.GOOGLE_SHEET_RANGE || 'Visitors!A:J');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    throw new Error('Google Sheets append failed');
  }
};

export const appendAuditLog = async ({ request, event, email = '', status = '', details = '' }) => {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) return;

  const token = await getAccessToken();
  if (!token) return;

  const ip =
    request.headers['x-forwarded-for']?.split(',')[0] ||
    request.headers['x-real-ip'] ||
    'unknown';
  const userAgent = request.headers['user-agent'] || '';
  const values = [[new Date().toISOString(), event, email, status, ip, userAgent, details]];
  const range = encodeURIComponent(process.env.GOOGLE_AUDIT_SHEET_RANGE || 'Audit!A:G');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    throw new Error('Google Sheets audit append failed');
  }
};
