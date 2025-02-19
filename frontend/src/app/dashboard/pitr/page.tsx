'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { PITRStatus } from '@/types';
import { APIService } from '@/lib/api';

export default function PITRPage() {
  const [status, setStatus] = useState<PITRStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showManagementKeyInput, setShowManagementKeyInput] = useState(false);
  const [managementApiKey, setManagementApiKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchPITRStatus = async () => {
    try {
      setLoading(true);
      const data = await APIService.checkPITR();
      setStatus(data);
      setShowManagementKeyInput(false);
    } catch (error) {
      console.error('Failed to fetch PITR status:', error);
      if (error instanceof Error && error.message === 'MANAGEMENT_API_KEY_REQUIRED') {
        setShowManagementKeyInput(true);
        toast({
          title: "Management API Key Required",
          description: "Please provide your Supabase Management API key to check PITR status.",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch PITR status. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitManagementKey = async () => {
    try {
      setSubmitting(true);
      await APIService.setManagementApiKey(managementApiKey);
      toast({
        title: "Success",
        description: "Management API key has been set successfully.",
      });
      // Retry fetching PITR status
      await fetchPITRStatus();
    } catch (error) {
      console.error('Failed to set management API key:', error);
      toast({
        title: "Error",
        description: "Failed to set management API key. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
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

  if (showManagementKeyInput) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">PITR Status</h2>
        <Card>
          <CardHeader>
            <CardTitle>Management API Key Required</CardTitle>
            <CardDescription>
              Please provide your Supabase Management API key to check PITR status.
              You can find this in your Supabase dashboard under Project Settings {`>`} API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="managementApiKey">Management API Key</Label>
                <Input
                  id="managementApiKey"
                  type="password"
                  placeholder="Enter your Management API key"
                  value={managementApiKey}
                  onChange={(e) => setManagementApiKey(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSubmitManagementKey} 
                disabled={submitting || !managementApiKey}
              >
                {submitting ? 'Setting key...' : 'Submit'}
              </Button>
            </div>
          </CardContent>
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