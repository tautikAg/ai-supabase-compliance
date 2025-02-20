'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { APIService } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export default function SettingsPage() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [managementApiKey, setManagementApiKey] = useState('');
  const credentials = typeof window !== 'undefined' ? 
    JSON.parse(localStorage.getItem('credentials') || '{}') : {};

  useEffect(() => {
    // Load saved management API key
    const savedKey = localStorage.getItem('managementApiKey');
    if (savedKey) {
      setManagementApiKey(savedKey);
      APIService.setManagementConfig({ managementApiKey: savedKey, projectRef: '' });
    }
  }, []);

  const handleManagementApiKeyChange = async () => {
    try {
      setLoading(true);
      await APIService.setManagementApiKey(managementApiKey);
      localStorage.setItem('managementApiKey', managementApiKey);
      toast({
        title: 'Success',
        description: 'Management API key updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update management API key',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear the cache? This will remove all stored data.')) {
      try {
        localStorage.clear();
        toast({
          title: 'Success',
          description: 'Cache cleared successfully',
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to clear cache',
        });
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Supabase Credentials</CardTitle>
          <CardDescription>Your current Supabase project credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Project URL</Label>
            <Input
              id="url"
              value={credentials.url || ''}
              disabled
              type="text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">Service Key</Label>
            <Input
              id="key"
              value="••••••••••••••••"
              disabled
              type="password"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Management API Settings</CardTitle>
          <CardDescription>Configure your Supabase Management API access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="managementApiKey">Management API Key</Label>
            <div className="flex space-x-2">
              <Input
                id="managementApiKey"
                value={managementApiKey}
                onChange={(e) => setManagementApiKey(e.target.value)}
                type="password"
                placeholder="Enter your Management API key"
              />
              <Button 
                onClick={handleManagementApiKeyChange}
                disabled={loading}
              >
                Save
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Required for PITR checks and certain fix operations. Get this from your Supabase dashboard.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>Careful with these actions - they can't be undone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Clear Cache</h3>
            <p className="text-sm text-muted-foreground">
              Remove all locally stored data and preferences
            </p>
            <Button
              variant="destructive"
              onClick={handleClearCache}
              disabled={loading}
            >
              Clear Cache
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Logout</h3>
            <p className="text-sm text-muted-foreground">
              Sign out and clear all session data
            </p>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={loading}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 