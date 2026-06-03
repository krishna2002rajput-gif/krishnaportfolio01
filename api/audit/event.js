import { appendAuditLog } from '../_lib/sheets.js';
import { json, methodGuard, readSession } from '../_lib/security.js';

export default async function handler(request, response) {
  if (methodGuard(request, response, 'POST')) return;

  const session = await readSession(request);
  const { event = 'Client Event', status = '', details = '' } = request.body || {};

  await appendAuditLog({
    request,
    event,
    email: session?.user?.email || '',
    status,
    details,
  }).catch((error) => console.error(error.message));

  json(response, 200, { ok: true });
}
