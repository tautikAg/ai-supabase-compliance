import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Shield,
  Key,
  Clock,
  Settings,
  AlertTriangle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  variant: 'default' | 'ghost';
}

const items: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    variant: 'default',
  },
  {
    title: 'MFA Status',
    href: '/dashboard/mfa',
    icon: Key,
    variant: 'ghost',
  },
  {
    title: 'RLS Status',
    href: '/dashboard/rls',
    icon: Shield,
    variant: 'ghost',
  },
  {
    title: 'PITR Status',
    href: '/dashboard/pitr',
    icon: Clock,
    variant: 'ghost',
  },
  {
    title: 'Fix Issues',
    href: '/dashboard/fix',
    icon: AlertTriangle,
    variant: 'ghost',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    variant: 'ghost',
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
      <div className="flex flex-col gap-2 p-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                buttonVariants({
                  variant: pathname === item.href ? 'default' : 'ghost',
                  size: 'sm',
                }),
                'w-full justify-start'
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </ScrollArea>
  );
} 