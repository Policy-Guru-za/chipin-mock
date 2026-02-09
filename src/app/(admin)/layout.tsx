import { AdminSidebar } from '@/components/admin';
import { requireAdminAuth } from '@/lib/auth/clerk-wrappers';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminAuth();

  return (
    <div className="min-h-screen bg-subtle text-text lg:flex">
      <AdminSidebar userEmail={session.email} />
      <main id="main-content" className="flex-1 p-4 lg:ml-60 lg:p-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
