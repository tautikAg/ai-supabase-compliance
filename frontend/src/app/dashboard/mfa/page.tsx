'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MFAStatus } from '@/types';
import { APIService } from '@/lib/api';

export default function MFAPage() {
  const [status, setStatus] = useState<MFAStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMFAStatus = async () => {
      try {
        const data = await APIService.checkMFA();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch MFA status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMFAStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">MFA Status</h2>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Fetching MFA status for all users</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">MFA Status</h2>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load MFA status</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">MFA Status</h2>
      <Card>
        <CardHeader>
          <CardTitle>MFA Compliance Status</CardTitle>
          <CardDescription>Current MFA status for all users in your Supabase project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Badge variant={status.status === 'pass' ? 'success' : 'destructive'}>
                {status.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">{status.details}</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>MFA Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {status.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.hasMFA ? 'success' : 'destructive'}>
                        {user.hasMFA ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 