import crypto from 'node:crypto';

/**
 * Mint a short-lived OAuth2 access token for the Google Drive API
 * using the same service account credentials already configured
 * for Google Sheets (GOOGLE_SERVICE_ACCOUNT_EMAIL / PRIVATE_KEY).
 */
const getDriveAccessToken = async () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) return null;

  const now = Math.floor(Date.now() / 1000);
  const base64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const unsignedToken = `${base64url(header)}.${base64url(claim)}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsignedToken)
    .sign(privateKey, 'base64url');
  const assertion = `${unsignedToken}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) throw new Error('Drive service account token request failed');

  const payload = await response.json();
  return payload.access_token;
};

/**
 * List files in a Drive folder and return the webViewLink of the
 * most recently modified PDF (fallback: newest file of any type).
 *
 * @param {string} folderId  Drive folder ID (not the full URL)
 * @returns {Promise<string|null>} Direct Drive view URL, or null
 */
export const getLatestFileInFolder = async (folderId) => {
  const token = await getDriveAccessToken();
  if (!token) return null;

  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime)');
  const url =
    `https://www.googleapis.com/drive/v3/files` +
    `?q=${query}&orderBy=modifiedTime+desc&pageSize=10&fields=${fields}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error(`Drive API listing failed: ${response.status}`);

  const data = await response.json();
  const files = data.files ?? [];
  if (files.length === 0) return null;

  // Prefer PDF; fall back to whatever the newest file is
  const chosen = files.find((f) => f.mimeType === 'application/pdf') ?? files[0];
  return `https://drive.google.com/file/d/${chosen.id}/view?usp=sharing`;
};
