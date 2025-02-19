'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { APIService } from '@/lib/api';
import { Shield, Key, Clock } from 'lucide-react';

export default function FixPage() {
  const [loading, setLoading] = useState(false);
  const [selectedFixes, setSelectedFixes] = useState({
    enableMFA: false,
    enableRLS: false,
    enablePITR: false,
  });
  const { toast } = useToast();

  const fixes = [
    {
      id: 'enableMFA',
      title: 'Enable MFA',
      description: 'Enable Multi-Factor Authentication for all users',
      icon: Key,
    },
    {
      id: 'enableRLS',
      title: 'Enable RLS',
      description: 'Enable Row Level Security for all tables',
      icon: Shield,
    },
    {
      id: 'enablePITR',
      title: 'Enable PITR',
      description: 'Enable Point-in-Time Recovery for all projects',
      icon: Clock,
    },
  ];

  const handleFix = async () => {
    if (!Object.values(selectedFixes).some(Boolean)) {
      toast({
        variant: 'destructive',
        title: 'No fixes selected',
        description: 'Please select at least one fix to apply',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await APIService.fixIssues(selectedFixes);
      toast({
        title: 'Success',
        description: result.message,
      });

      // Show results for each fix
      Object.entries(result.results).forEach(([fix, success]) => {
        toast({
          title: fix,
          description: success ? 'Fixed successfully' : 'Failed to fix',
          variant: success ? 'default' : 'destructive',
        });
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to apply fixes',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Fix Compliance Issues</h2>
      <Card>
        <CardHeader>
          <CardTitle>Available Fixes</CardTitle>
          <CardDescription>Select the compliance issues you want to fix</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fixes.map(({ id, title, description, icon: Icon }) => (
              <div key={id} className="flex items-center space-x-4">
                <Checkbox
                  id={id}
                  checked={selectedFixes[id as keyof typeof selectedFixes]}
                  onCheckedChange={(checked) =>
                    setSelectedFixes((prev) => ({ ...prev, [id]: checked }))
                  }
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <label
                      htmlFor={id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {title}
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
            <Button onClick={handleFix} disabled={loading} className="w-full mt-4">
              {loading ? 'Applying fixes...' : 'Apply Selected Fixes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 