import { Inter } from 'next/font/google';
import { Metadata } from 'next';

import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Supabase Compliance Checker',
    template: '%s | Supabase Compliance Checker'
  },
  description: 'Check and enforce compliance requirements for your Supabase configuration',
  keywords: ['Supabase', 'Compliance', 'Security', 'MFA', 'RLS', 'PITR'],
  authors: [{ name: 'Supabase Compliance Team' }],
  creator: 'Supabase Compliance Team'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
