import { Metadata } from 'next';
import { ComplianceOverview } from '@/components/dashboard/compliance-overview';
import { ComplianceStats } from '@/components/dashboard/compliance-stats';
import { ComplianceChart } from '@/components/dashboard/compliance-chart';

export const metadata: Metadata = {
  title: 'Dashboard | Supabase Compliance Checker',
  description: 'Overview of your Supabase configuration compliance status',
};

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ComplianceStats />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ComplianceOverview className="col-span-4" />
        <ComplianceChart className="col-span-3" />
      </div>
    </div>
  );
} 