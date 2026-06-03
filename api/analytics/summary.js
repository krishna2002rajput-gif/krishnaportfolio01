import { cacheGet, json, methodGuard, readSession } from '../_lib/security.js';

const numberFromCache = async (key) => Number((await cacheGet(key)) || 0);

export default async function handler(request, response) {
  if (methodGuard(request, response, 'GET')) return;

  const session = await readSession(request);
  if (!session) {
    json(response, 401, { message: 'Authentication required' });
    return;
  }

  const [totalVisitors, googleUsers, otpUsers, protectedAssetRequests] = await Promise.all([
    numberFromCache('analytics:total_visitors'),
    numberFromCache('analytics:google_users'),
    numberFromCache('analytics:otp_users'),
    numberFromCache('analytics:protected_asset_requests'),
  ]);

  json(response, 200, {
    totalVisitors,
    googleUsers,
    otpUsers,
    protectedAssetRequests,
    returningVisitors: 0,
    uniqueVisitors: totalVisitors,
    countryDistribution: {},
    deviceBreakdown: {},
  });
}
