'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplianceReport } from '@/types';
import { APIService } from '@/lib/api';
import { Shield, Key, Clock, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function ComplianceStats() {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await APIService.getComplianceReport();
        setReport(data);
      } catch (error) {
        console.error('Failed to fetch compliance report:', error);
        // Create a partial report with available data
        if (error instanceof Error && error.message.includes('Management API key')) {
          const partialReport = {
            mfa: await APIService.checkMFA().catch(() => ({ 
              status: 'fail' as const, 
              details: 'Unable to check MFA status',
              timestamp: new Date().toISOString(),
              users: []
            })),
            rls: await APIService.checkRLS().catch(() => ({ 
              compliant: false,
              timestamp: new Date().toISOString(),
              tables: []
            })),
            pitr: {
              status: 'fail' as const,
              details: 'Management API key required for PITR check',
              timestamp: new Date().toISOString(),
              projects: []
            },
            overallStatus: 'fail' as const,
            generatedAt: new Date().toISOString()
          };
          setReport(partialReport as ComplianceReport);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const getStatusColor = (status: string | boolean | undefined) => {
    if (status === 'pass' || status === true) return 'text-green-500';
    return 'text-red-500';
  };

  const getStatusText = (status: string | boolean | undefined) => {
    if (status === 'pass' || status === true) return 'Compliant';
    return 'Non-Compliant';
  };

  const stats = [
    {
      title: 'MFA Status',
      value: getStatusText(report?.mfa.status),
      icon: Key,
      description: report?.mfa.details || 'NA',
      className: getStatusColor(report?.mfa.status),
    },
    {
      title: 'RLS Status',
      value: getStatusText(report?.rls.status),
      icon: Shield,
      description: report?.rls.details || 'Some tables are missing RLS',
      className: getStatusColor(report?.rls.status),
    },
    {
      title: 'PITR Status',
      value: getStatusText(report?.pitr.status),
      icon: Clock,
      description: report?.pitr.details || 'NA',
      className: getStatusColor(report?.pitr.status),
    },
    {
      title: 'Overall Status',
      value: getStatusText(report?.overallStatus),
      icon: AlertTriangle,
      description: 'Overall compliance status',
      className: getStatusColor(report?.overallStatus),
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
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <LoadingSpinner size={20} />
                <p className="text-xs text-muted-foreground">NA</p>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  <span className={stat.className}>{stat.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
} 