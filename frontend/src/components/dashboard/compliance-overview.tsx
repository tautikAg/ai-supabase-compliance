'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ComplianceReport } from '@/types';
import { APIService } from '@/lib/api';

interface ComplianceOverviewProps {
  className?: string;
}

export function ComplianceOverview({ className }: ComplianceOverviewProps) {
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
          const partialReport: ComplianceReport = {
            mfa: await APIService.checkMFA().catch(() => ({ 
              status: 'fail' as const, 
              details: 'Unable to check MFA status',
              users: [],
              timestamp: new Date().toISOString()
            })),
            rls: await APIService.checkRLS().catch(() => ({ 
              status: 'fail' as const,
              details: 'Unable to check RLS status',
              tables: [],
              timestamp: new Date().toISOString()
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
          setReport(partialReport);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
          <CardDescription>Loading compliance status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
          <CardDescription>Failed to load compliance status</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Compliance Overview</CardTitle>
        <CardDescription>
          Current status of your Supabase configuration compliance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Check</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">MFA</TableCell>
              <TableCell>
                <Badge variant={report.mfa.status === 'pass' ? 'success' : 'destructive'}>
                  {report.mfa.status === 'pass' ? 'PASS' : 'FAIL'}
                </Badge>
              </TableCell>
              <TableCell>{report.mfa.details}</TableCell>
              <TableCell>{new Date(report.mfa.timestamp).toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">RLS</TableCell>
              <TableCell>
                <Badge variant={report.rls.status === 'pass' ? 'success' : 'destructive'}>
                  {report.rls.status === 'pass' ? 'PASS' : 'FAIL'}
                </Badge>
              </TableCell>
              <TableCell>{report.rls.details}</TableCell>
              <TableCell>{new Date(report.rls.timestamp).toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">PITR</TableCell>
              <TableCell>
                <Badge variant={report.pitr.status === 'pass' ? 'success' : 'destructive'}>
                  {report.pitr.status === 'pass' ? 'PASS' : 'FAIL'}
                </Badge>
              </TableCell>
              <TableCell>{report.pitr.details}</TableCell>
              <TableCell>{new Date(report.pitr.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 