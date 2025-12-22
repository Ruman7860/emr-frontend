'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserIcon, LogOutIcon, PanelLeftIcon, PanelLeftClose, Bell } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import ThemeToggle from './ThemeToggle';
import { useSidebar } from '../ui/sidebar';
import { useNotifications } from '@/context/notification-context';

export default function Navbar() {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const { unreadCount, markAllRead, notifications } = useNotifications();
  const { data: session } = useSession();
  const router = useRouter();

  const userRole = (session as any)?.user?.role || (session as any)?.role;

  const handleNotificationClick = (visitId: string) => {
    router.push('/queue');
  };

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
        {/* Notification Bell - Only for DOCTOR */}
        {userRole === 'DOCTOR' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center animate-in zoom-in">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h4 className="font-semibold">Notifications</h4>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto px-2 text-muted-foreground hover:text-primary"
                    onClick={markAllRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  <div className="grid divide-y">
                    {notifications.map((notification, index) => (
                      <div
                        key={`${notification.visitId}-${index}`}
                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleNotificationClick(notification.visitId)}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className="text-sm font-medium leading-none">
                            {notification.patientName}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.visitDate), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Added to queue
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

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
