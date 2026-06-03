import { json, methodGuard, verifyAssetToken } from '../_lib/security.js';

const assetTargets = {
  resume: () => process.env.PROTECTED_RESUME_URL,
  intro: () => process.env.PROTECTED_INTRO_VIDEO_URL,
};

export default async function handler(request, response) {
  if (methodGuard(request, response, 'GET')) return;

  const payload = verifyAssetToken(request.query.token);
  if (!payload || !assetTargets[payload.asset]) {
    json(response, 401, { message: 'Signed asset URL is invalid or expired' });
    return;
  }

  const target = assetTargets[payload.asset]();
  if (!target) {
    json(response, 503, { message: 'Protected asset target is not configured' });
    return;
  }

  response.setHeader('Cache-Control', 'no-store');
  response.redirect(302, target);
}
