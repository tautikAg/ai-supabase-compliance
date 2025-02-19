'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplianceReport } from '@/types';
import { APIService } from '@/lib/api';
import { Shield, Key, Clock, AlertTriangle } from 'lucide-react';

export function ComplianceStats() {
  const [report, setReport] = useState<ComplianceReport | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await APIService.getComplianceReport();
        setReport(data);
      } catch (error) {
        console.error('Failed to fetch compliance report:', error);
      }
    };

    fetchReport();
  }, []);

  const stats = [
    {
      title: 'MFA Status',
      value: report?.mfa.status === 'pass' ? 'Compliant' : 'Non-Compliant',
      icon: Key,
      description: report?.mfa.details || 'Loading...',
      className: report?.mfa.status === 'pass' ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'RLS Status',
      value: report?.rls.status === 'pass' ? 'Compliant' : 'Non-Compliant',
      icon: Shield,
      description: report?.rls.details || 'Loading...',
      className: report?.rls.status === 'pass' ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'PITR Status',
      value: report?.pitr.status === 'pass' ? 'Compliant' : 'Non-Compliant',
      icon: Clock,
      description: report?.pitr.details || 'Loading...',
      className: report?.pitr.status === 'pass' ? 'text-green-500' : 'text-red-500',
    },
    {
      title: 'Overall Status',
      value: report?.overallStatus === 'pass' ? 'Compliant' : 'Non-Compliant',
      icon: AlertTriangle,
      description: 'Overall compliance status',
      className: report?.overallStatus === 'pass' ? 'text-green-500' : 'text-red-500',
    },
  ];

  return (
    <>
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={stat.className}>{stat.value}</span>
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
} 