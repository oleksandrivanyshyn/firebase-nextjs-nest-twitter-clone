'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="mx-auto min-h-screen max-w-2xl flex-1 border-x border-gray-800">
        {children}
      </main>
      <div className="hidden w-80 p-4 lg:block" />
    </div>
  );
}
