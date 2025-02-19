'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { APIService } from '@/lib/api';
import { Shield, Key, Clock, Loader2 } from 'lucide-react';
import { RiDatabase2Line } from 'react-icons/ri';
import { Progress } from "@/components/ui/progress";

const setupSteps = [
  {
    title: 'Required Database Functions',
    icon: RiDatabase2Line,
    items: [
      {
        name: 'get_all_tables',
        description: 'Returns all tables in the public schema',
        code: `CREATE OR REPLACE FUNCTION get_all_tables()
RETURNS TABLE (
  table_name text,
  schema_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    t.table_schema::text
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE';
END;
$$;`
      },
      {
        name: 'get_rls_status',
        description: 'Returns RLS status for all tables',
        code: `CREATE OR REPLACE FUNCTION get_rls_status()
RETURNS TABLE (
  table_name text,
  rls_enabled boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.relname::text as table_name,
    c.relrowsecurity as rls_enabled
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  AND c.relkind = 'r';
END;
$$;`
      },
      {
        name: 'enable_rls_for_table',
        description: 'Enables RLS for a specific table and creates a default policy',
        code: `CREATE OR REPLACE FUNCTION enable_rls_for_table(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  BEGIN
    EXECUTE format('DROP POLICY IF EXISTS "Enable access for authenticated users" ON %I', table_name);
  EXCEPTION WHEN others THEN
    NULL;
  END;
  EXECUTE format(
    'CREATE POLICY "Enable access for authenticated users" ON %I
     FOR ALL
     TO authenticated
     USING (true)
     WITH CHECK (true)',
    table_name
  );
END;
$$;`
      },
      {
        name: 'enable_mfa_for_user',
        description: 'Enables MFA for a specific user',
        code: `CREATE OR REPLACE FUNCTION enable_mfa_for_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    '{"mfa_enabled": true}'::jsonb
  WHERE id = user_id;
END;
$$;`
      },
      {
        name: 'check_rls_status',
        description: 'Checks RLS status for a specific table',
        code: `CREATE OR REPLACE FUNCTION check_rls_status(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_enabled boolean;
BEGIN
  SELECT c.relrowsecurity
  INTO is_enabled
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  AND c.relname = table_name;
  RETURN COALESCE(is_enabled, false);
END;
$$;`
      },
      {
        name: 'get_pitr_status',
        description: 'Returns PITR status for all projects',
        code: `CREATE OR REPLACE FUNCTION get_pitr_status()
RETURNS TABLE (
  project_id uuid,
  project_name text,
  pitr_enabled boolean,
  retention_period interval
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as project_id,
    p.name as project_name,
    p.pitr_enabled,
    p.retention_period
  FROM projects p
  WHERE p.deleted_at IS NULL;
END;
$$;`
      }
    ]
  }
];

const complianceOptions = [
  {
    id: 'mfa',
    title: 'Enable MFA',
    description: 'Enable Multi-Factor Authentication for all users',
    icon: Shield,
    steps: [
      'Checking MFA status',
      'Creating MFA configuration',
      'Enabling MFA for users',
      'Verifying MFA setup'
    ]
  },
  {
    id: 'rls',
    title: 'Enable RLS',
    description: 'Enable Row Level Security for all tables',
    icon: Key,
    steps: [
      'Fetching table list',
      'Checking RLS status',
      'Enabling RLS for tables',
      'Creating default policies'
    ]
  },
  {
    id: 'pitr',
    title: 'Enable PITR',
    description: 'Enable Point in Time Recovery',
    icon: Clock,
    steps: [
      'Checking PITR status',
      'Configuring backup settings',
      'Enabling PITR',
      'Verifying backup configuration'
    ]
  }
];

export default function FixPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProjects, setSelectedProjects] = useState<Record<string, boolean>>({});
  const [managementApiKey, setManagementApiKey] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Record<string, { current: number; status: string }>>({});

  useEffect(() => {
    fetchProjects();
    // Initialize selected options
    const initialOptions = complianceOptions.reduce((acc, option) => {
      acc[option.id] = false;
      return acc;
    }, {} as Record<string, boolean>);
    setSelectedOptions(initialOptions);
  }, []);

  const fetchProjects = async () => {
    try {
      const projectList = await APIService.listProjects();
      setProjects(projectList);
      const initialSelectedState = projectList.reduce((acc, project) => {
        acc[project.id] = false;
        return acc;
      }, {} as Record<string, boolean>);
      setSelectedProjects(initialSelectedState);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch projects',
      });
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const handleManagementApiKeyChange = async (key: string) => {
    setManagementApiKey(key);
    try {
      await APIService.setManagementApiKey(key);
      toast({
        title: 'Success',
        description: 'Management API key set successfully',
      });
      fetchProjects(); // Refresh projects list after setting the key
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to set Management API key',
      });
    }
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  const updateProgress = (projectId: string, optionId: string, step: number, status: string) => {
    const key = `${projectId}-${optionId}`;
    setProgress(prev => ({
      ...prev,
      [key]: { current: step, status }
    }));
  };

  const handleFix = async () => {
    const selectedProjectIds = Object.entries(selectedProjects)
      .filter(([_, selected]) => selected)
      .map(([id]) => id);

    if (selectedProjectIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No projects selected',
        description: 'Please select at least one project to apply fixes to',
      });
      return;
    }

    const selectedOptionIds = Object.entries(selectedOptions)
      .filter(([_, selected]) => selected)
      .map(([id]) => id);

    if (selectedOptionIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No options selected',
        description: 'Please select at least one compliance option to fix',
      });
      return;
    }

    setLoading(true);
    try {
      for (const projectId of selectedProjectIds) {
        const project = projects.find(p => p.id === projectId);
        if (!project) continue;

        for (const optionId of selectedOptionIds) {
          const option = complianceOptions.find(o => o.id === optionId);
          if (!option) continue;

          // Reset progress for this project-option combination
          const progressKey = `${projectId}-${optionId}`;
          setProgress(prev => ({
            ...prev,
            [progressKey]: { current: 0, status: 'Starting...' }
          }));

          try {
            // Execute the appropriate fix based on the option
            switch (optionId) {
              case 'mfa':
                updateProgress(projectId, optionId, 25, 'Creating MFA function...');
                await APIService.enableMFA(project.id);
                updateProgress(projectId, optionId, 100, 'MFA enabled');
                break;

              case 'rls':
                updateProgress(projectId, optionId, 25, 'Creating RLS helper functions...');
                await APIService.enableRLS(project.id);
                updateProgress(projectId, optionId, 100, 'RLS enabled for all tables');
                break;

              case 'pitr':
                updateProgress(projectId, optionId, 25, 'Enabling PITR...');
                await APIService.enablePITR(project.id);
                updateProgress(projectId, optionId, 100, 'PITR enabled');
                break;
            }

            toast({
              title: 'Fix Applied',
              description: `${option.title} has been enabled for ${project.name}`,
            });
          } catch (error) {
            updateProgress(projectId, optionId, 0, 'Failed');
            toast({
              variant: 'destructive',
              title: 'Error',
              description: `Failed to apply ${option.title} to ${project.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
          }
        }
      }
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
          <CardTitle>Management API Key</CardTitle>
          <CardDescription>Enter your Supabase Management API key to proceed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter Management API Key"
              value={managementApiKey}
              onChange={(e) => handleManagementApiKeyChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Projects</CardTitle>
          <CardDescription>Choose the projects to apply fixes to</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center space-x-2">
                <Checkbox
                  id={project.id}
                  checked={selectedProjects[project.id]}
                  onCheckedChange={() => handleProjectSelect(project.id)}
                />
                <label htmlFor={project.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {project.name}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Options</CardTitle>
          <CardDescription>Select the compliance fixes to apply</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {complianceOptions.map((option) => (
              <div key={option.id} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={selectedOptions[option.id]}
                    onCheckedChange={() => handleOptionSelect(option.id)}
                  />
                  <div className="flex items-center space-x-2">
                    <option.icon className="h-4 w-4" />
                    <label htmlFor={option.id} className="text-sm font-medium leading-none">
                      {option.title}
                    </label>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{option.description}</p>
                
                {Object.entries(selectedProjects)
                  .filter(([_, selected]) => selected)
                  .map(([projectId]) => {
                    const project = projects.find(p => p.id === projectId);
                    if (!project) return null;
                    
                    const progressKey = `${projectId}-${option.id}`;
                    const progressData = progress[progressKey];
                    
                    if (!progressData) return null;
                    
                    return (
                      <div key={`${option.id}-${projectId}`} className="pl-6 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{project.name}</span>
                          <span>{progressData.status}</span>
                        </div>
                        <Progress value={progressData.current} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            ))}
            <Button
              onClick={handleFix}
              disabled={loading || !managementApiKey || 
                Object.values(selectedProjects).every(v => !v) ||
                Object.values(selectedOptions).every(v => !v)}
              className="mt-4"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? 'Applying Fixes...' : 'Apply Selected Fixes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 