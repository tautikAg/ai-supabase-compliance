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
  Bot,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const items: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'MFA Status',
    href: '/dashboard/mfa',
    icon: Key,
  },
  {
    title: 'RLS Status',
    href: '/dashboard/rls',
    icon: Shield,
  },
  {
    title: 'PITR Status',
    href: '/dashboard/pitr',
    icon: Clock,
  },
  {
    title: 'Fix Issues',
    href: '/dashboard/fix',
    icon: AlertTriangle,
  },
  {
    title: 'AI Assistant',
    href: '/dashboard/ai',
    icon: Bot,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2 p-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground",
              "disabled:pointer-events-none disabled:opacity-50",
              pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
} 