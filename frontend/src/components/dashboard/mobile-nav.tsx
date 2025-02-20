import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link href="/" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <span className="font-bold">Supabase Compliance</span>
          </Link>
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center text-sm font-medium text-muted-foreground',
                pathname === '/dashboard' && 'text-foreground'
              )}
            >
              Overview
            </Link>
            <Link
              href="/dashboard/mfa"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center text-sm font-medium text-muted-foreground',
                pathname === '/dashboard/mfa' && 'text-foreground'
              )}
            >
              MFA Status
            </Link>
            <Link
              href="/dashboard/rls"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center text-sm font-medium text-muted-foreground',
                pathname === '/dashboard/rls' && 'text-foreground'
              )}
            >
              RLS Status
            </Link>
            <Link
              href="/dashboard/pitr"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center text-sm font-medium text-muted-foreground',
                pathname === '/dashboard/pitr' && 'text-foreground'
              )}
            >
              PITR Status
            </Link>
            <Link
              href="/dashboard/fix"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center text-sm font-medium text-muted-foreground',
                pathname === '/dashboard/fix' && 'text-foreground'
              )}
            >
              Fix Issues
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center text-sm font-medium text-muted-foreground',
                pathname === '/dashboard/settings' && 'text-foreground'
              )}
            >
              Settings
            </Link>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
} 