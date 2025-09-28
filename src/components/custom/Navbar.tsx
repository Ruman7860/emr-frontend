'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserIcon, LogOutIcon, PanelLeftIcon, PanelLeftClose } from 'lucide-react';
import { signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import { useSidebar } from '../ui/sidebar';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const theme = useTheme()

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 shadow-md border-b-2">
      <div className='flex gap-3 items-center'>
        <Button onClick={toggleSidebar} className='size-9 cursor-pointer '>
          {(isMobile || state === 'collapsed') ?
            <PanelLeftIcon className='size-4 ' />
            :
            <PanelLeftClose className='size-4' />
          }
        </Button>
        <h2 className='text-xl'>Clinic Management System</h2>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="cursor-pointer">
              <AvatarImage src="/user.jpg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOutIcon className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
