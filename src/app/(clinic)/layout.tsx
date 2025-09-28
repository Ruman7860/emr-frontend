'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import Navbar from '@/components/custom/Navbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSideBar from '@/components/custom/sidebar/SideBar';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();


  if (status === 'unauthenticated') {
    router.push('/login');
    return;
  };

  if (status === 'loading') return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <>
      <SidebarProvider>
        <DashboardSideBar />
        <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
          <main className="flex-1 overflow-auto">
            <Navbar />
            {children}
          </main>
        </div>
      </SidebarProvider>
    </>
  );
}