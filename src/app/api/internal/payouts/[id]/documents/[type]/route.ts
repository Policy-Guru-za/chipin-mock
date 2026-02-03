import { requireAdminAuth } from '@/lib/auth/clerk-wrappers';
import { jsonInternalError } from '@/lib/api/internal-response';
export async function GET() {
  await requireAdminAuth();
  return jsonInternalError({ code: 'not_found', status: 404 });
}
