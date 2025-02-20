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
import { LoadingCard, LoadingSpinner } from '@/components/ui/loading-spinner';

export default function PITRPage() {
  const [status, setStatus] = useState<PITRStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [managementKey, setManagementKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize API service with localStorage data
    APIService.initializeFromLocalStorage();
    fetchPITRStatus();
  }, []);

  const fetchPITRStatus = async () => {
    try {
      const data = await APIService.checkPITR();
      setStatus(data);
      setShowKeyInput(false);
    } catch (error) {
      console.error('Failed to fetch PITR status:', error);
      if (error instanceof Error && 
          (error.message === 'MANAGEMENT_API_KEY_REQUIRED' || 
           error.message.includes('Management API key not configured'))) {
        setShowKeyInput(true);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch PITR status. Please check your management API key.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitManagementKey = async () => {
    try {
      await APIService.setManagementApiKey(managementKey);
      setShowKeyInput(false);
      setManagementKey('');
      // Refresh PITR status after setting the key
      await fetchPITRStatus();
      toast({
        title: 'Success',
        description: 'Management API key has been set successfully',
      });
    } catch (error) {
      console.error('Error setting management API key:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to set management API key',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">PITR Status</h2>
        <Card>
          <LoadingCard 
            title="Loading PITR Status" 
            description="Fetching Point in Time Recovery status" 
          />
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
        {showKeyInput && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Management API Key Required</CardTitle>
              <CardDescription>
                Please provide your Supabase Management API key to check PITR status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  type="password"
                  placeholder="Enter Management API Key"
                  value={managementKey}
                  onChange={(e) => setManagementKey(e.target.value)}
                />
                <Button onClick={handleSubmitManagementKey}>Save Key</Button>
              </div>
            </CardContent>
          </Card>
        )}
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

      {showKeyInput && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Management API Key Required</CardTitle>
            <CardDescription>
              Please provide your Supabase Management API key to check PITR status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="password"
                placeholder="Enter Management API Key"
                value={managementKey}
                onChange={(e) => setManagementKey(e.target.value)}
              />
              <Button onClick={handleSubmitManagementKey}>Save Key</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 