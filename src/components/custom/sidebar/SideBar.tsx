'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import SideBarUserButton from './SideBarUserButton';

export default function DashboardSideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/doctors', label: 'Doctors', roles: ['ADMIN'] },
    { href: '/staffs', label: 'Staffs', roles: ['ADMIN'] },
    { href: '/patients', label: 'Patients', roles: ['ADMIN', 'DOCTOR'] },
    { href: '/inventory', label: 'Inventory', roles: ['ADMIN'] },
  ];

  return (
    <Sidebar className="h-full bg-blue-500 dark:bg-gray-900 shadow-lg">
      <SidebarHeader>
        <div className="flex flex-col items-start gap-2 px-2 py-2">
          <Avatar className="h-10 w-10 ">
            <AvatarImage src="/logo.png" alt="Clinic Logo" />
            <AvatarFallback className='text-xs'>CMS</AvatarFallback>
          </Avatar>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => {
              if (item.roles && !item.roles.includes(session?.user?.role)) return null;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    className={cn(
                      'rounded-md p-2 gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800',
                      pathname === item.href
                        ? 'bg-green-600 text-white dark:bg-green-900'
                        : 'text-gray-700 dark:text-gray-200'
                    )}
                    isActive={pathname === item.href}
                    onClick={() => router.push(item.href)}
                  >
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {session && (
          <SideBarUserButton data={session} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
