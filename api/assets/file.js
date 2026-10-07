import { getLatestFileInFolder } from '../_lib/drive.js';
import { json, methodGuard, verifyAssetToken } from '../_lib/security.js';

/**
 * For the resume asset: prefer Drive folder lookup (always returns the
 * newest PDF in the folder via Drive API). Falls back to
 * PROTECTED_RESUME_URL if service-account credentials are absent.
 *
 * For all other assets (intro video, etc.) the env-var URL is used
 * directly, as before.
 */
const assetTargets = {
  resume: async () => {
    const folderId = process.env.PROTECTED_RESUME_FOLDER_ID;
    if (folderId) {
      try {
        const url = await getLatestFileInFolder(folderId);
        if (url) return url;
      } catch (err) {
        console.error('[resume] Drive lookup failed, falling back:', err.message);
      }
    }
    return process.env.PROTECTED_RESUME_URL || null;
  },
  intro: async () => process.env.PROTECTED_INTRO_VIDEO_URL || null,
};

export default async function handler(request, response) {
  if (methodGuard(request, response, 'GET')) return;

  const payload = verifyAssetToken(request.query.token);
  if (!payload || !assetTargets[payload.asset]) {
    json(response, 401, { message: 'Signed asset URL is invalid or expired' });
    return;
  }

  const target = await assetTargets[payload.asset]();
  if (!target) {
    json(response, 503, { message: 'Protected asset target is not configured' });
    return;
  }

  response.setHeader('Cache-Control', 'no-store');
  response.redirect(302, target);
}
