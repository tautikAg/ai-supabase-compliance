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
          <CardDescription>PITR configuration across your Supabase projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Badge variant={status.status === 'pass' ? 'success' : 'destructive'}>
                {status.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {status.details}
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>PITR Status</TableHead>
                  <TableHead>Project ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {status.projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>
                      <Badge variant={project.hasPITR ? 'success' : 'destructive'}>
                        {project.hasPITR ? 'ENABLED' : 'DISABLED'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{project.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="text-sm text-muted-foreground mt-4">
              Last checked: {new Date(status.timestamp).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 