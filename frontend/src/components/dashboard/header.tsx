import Link from 'next/link';
import { UserNav } from '@/components/dashboard/user-nav';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-20 items-center justify-between px-4 lg:px-6">
        {/* Logo and Title - Left Side */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <h2 className="text-2xl font-bold">Supabase Compliance Checker</h2>
          </Link>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserNav />
        </div>

        {/* Mobile Navigation - Only visible on mobile */}
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
} 