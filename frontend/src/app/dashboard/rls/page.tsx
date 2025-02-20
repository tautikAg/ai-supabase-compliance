'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RLSStatus } from '@/types';
import { APIService } from '@/lib/api';
import { LoadingCard } from '@/components/ui/loading-spinner';

export default function RLSPage() {
  const [status, setStatus] = useState<RLSStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRLSStatus = async () => {
      try {
        const data = await APIService.checkRLS();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch RLS status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRLSStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">RLS Status</h2>
        <Card>
          <LoadingCard 
            title="Loading RLS Status" 
            description="Fetching Row Level Security status" 
          />
        </Card>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">RLS Status</h2>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load RLS status</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">RLS Status</h2>
      <Card>
        <CardHeader>
          <CardTitle>Row Level Security Status</CardTitle>
          <CardDescription>Current RLS configuration for your database tables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Badge variant={status.status === 'pass' ? 'success' : 'destructive'}>
                {status.status === 'pass' ? 'PASS' : 'FAIL'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {status.details}
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>RLS Status</TableHead>
                  <TableHead>Policies</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {status.tables.map((table) => (
                  <TableRow key={table.name}>
                    <TableCell>{table.name}</TableCell>
                    <TableCell>
                      <Badge variant={table.hasRLS ? 'success' : 'destructive'}>
                        {table.hasRLS ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {table.policies && table.policies.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {table.policies.map((policy, index) => (
                            <li key={index} className="text-sm">
                              {policy.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No policies defined
                        </span>
                      )}
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