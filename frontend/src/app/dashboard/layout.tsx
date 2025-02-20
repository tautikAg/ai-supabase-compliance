"use client";

import { ReactNode } from 'react';
import { DashboardNav } from '@/components/dashboard/nav';
import { DashboardHeader } from '@/components/dashboard/header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-20 bottom-0 z-40 w-60 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <DashboardNav />
        </aside>
        {/* Main Content */}
        <main className="flex-1 pl-60">
          {children}
        </main>
      </div>
    </div>
  );
} 