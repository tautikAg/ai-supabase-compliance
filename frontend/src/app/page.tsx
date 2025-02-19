import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Supabase Compliance Checker',
  description: 'Check and enforce compliance requirements for your Supabase configuration',
};

export default function HomePage() {
  redirect('/dashboard');
} 