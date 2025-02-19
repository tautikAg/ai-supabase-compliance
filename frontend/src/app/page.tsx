"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Supabase Compliance Checker',
  description: 'Check and enforce compliance requirements for your Supabase configuration',
};

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null;
} 