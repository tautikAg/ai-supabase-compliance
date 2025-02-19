'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PITRStatus } from '@/types';
import { APIService } from '@/lib/api';

export default function PITRPage() {
  const [status, setStatus] = useState<PITRStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPITRStatus = async () => {
      try {
        const data = await APIService.checkPITR();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch PITR status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPITRStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">PITR Status</h2>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Fetching Point in Time Recovery status</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">PITR Status</h2>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load PITR status</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">PITR Status</h2>
      <Card>
        <CardHeader>
          <CardTitle>Point in Time Recovery Status</CardTitle>
          <CardDescription>Current PITR configuration for your Supabase project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Badge variant={status.enabled ? 'success' : 'destructive'}>
                {status.enabled ? 'ENABLED' : 'DISABLED'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {status.enabled 
                  ? `PITR is enabled with ${status.retentionPeriod} retention period` 
                  : 'PITR is not enabled for this project'}
              </span>
            </div>
            {status.enabled && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Setting</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Retention Period</TableCell>
                    <TableCell>{status.retentionPeriod}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Last Backup</TableCell>
                    <TableCell>{status.lastBackup}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Storage Used</TableCell>
                    <TableCell>{status.storageUsed}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 