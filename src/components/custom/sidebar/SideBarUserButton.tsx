import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronDownIcon, CreditCardIcon, LogOutIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

const SideBarUserButton = ({ data }: any) => {
    const isMobile = useIsMobile();
    if (isMobile) {
        return (
            <Drawer>
                <DrawerTrigger className='rounded-lg border border-border/10 p-3 w-full flex gap-3 items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden '>
                    <div className='flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0'>
                        <p className='text-sm w-full truncate'>
                            {data.user.name}
                        </p>
                        <p className='text-xs w-full truncate'>
                            {data.user.email}
                        </p>
                    </div>
                    <ChevronDownIcon className='size-5' />
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{data.user.name}</DrawerTitle>
                        <DrawerDescription>{data.user.email}</DrawerDescription>
                    </DrawerHeader>
                    <div className='flex flex-col gap-2 p-4'>
                        <Button onClick={() => signOut({ callbackUrl: '/login' })} >
                            <LogOutIcon className='size-4 rounded-none' />
                            Logout
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className='rounded-lg border border-border/10 p-3 w-full flex gap-3 items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden '>
                <div className='flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0'>
                    <p className='text-sm w-full truncate'>
                        {data.user.name}
                    </p>
                    <p className='text-xs w-full truncate'>
                        {data.user.email}
                    </p>
                </div>
                <ChevronDownIcon className='size-5' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' side='top' className='w-full'>
                <DropdownMenuLabel className='font-normal flex flex-col gap-1'>
                    <span className='text-sm w-full truncate '>{data.user.name}</span>
                    <span className='text-xs w-full truncate'>{data.user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/login' })}
                >
                    <LogOutIcon className='size-4' />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default SideBarUserButton