import { appendAuditLog } from '../_lib/sheets.js';
import { cacheIncrement, json, methodGuard, readSession, signAssetToken } from '../_lib/security.js';

const allowedAssets = new Set(['resume', 'intro']);

export default async function handler(request, response) {
  if (methodGuard(request, response, 'GET')) return;

  try {
    const session = await readSession(request);
    if (!session) {
      await appendAuditLog({ request, event: 'Protected Asset Request', status: 'Unauthorized' }).catch((error) => console.error(error.message));
      json(response, 401, { message: 'Authentication required for protected assets' });
      return;
    }

    const asset = String(request.query.asset || '');
    if (!allowedAssets.has(asset)) {
      await appendAuditLog({ request, event: 'Protected Asset Request', email: session.user.email, status: 'Unknown Asset', details: asset }).catch((error) => console.error(error.message));
      json(response, 400, { message: 'Unknown protected asset' });
      return;
    }

    const token = signAssetToken(asset);
    await cacheIncrement('analytics:protected_asset_requests', 60 * 60 * 24 * 30);
    await appendAuditLog({ request, event: 'Protected Asset Request', email: session.user.email, status: 'Signed', details: asset }).catch((error) => console.error(error.message));
    json(response, 200, { url: `/api/assets/file?token=${encodeURIComponent(token)}`, expiresIn: 60 });
  } catch (error) {
    json(response, 500, { message: error.message || 'Unable to create signed URL' });
  }
}
