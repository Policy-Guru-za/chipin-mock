import { requireAdminSession } from '@/lib/auth/session';
import { jsonInternalError } from '@/lib/api/internal-response';
export async function GET() {
  await requireAdminSession();
  return jsonInternalError({ code: 'not_found', status: 404 });
}
