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
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [managementKey, setManagementKey] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Initialize API service with localStorage data
    APIService.initializeFromLocalStorage();
    fetchProjects();
  }, []);

  useEffect(() => {
    // Only show key input if no management key is present
    setShowKeyInput(!APIService.hasManagementKey());
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await APIService.listProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      if (error instanceof Error && error.message.includes('Management API key not configured')) {
        setShowKeyInput(true);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch projects. Please check your management API key.',
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
      // Refresh projects after setting the key
      await fetchProjects();
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

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
  };

  const handleOptionSelect = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(prev => prev.filter(id => id !== optionId));
    } else {
      setSelectedOptions(prev => [...prev, optionId]);
    }
  };

  const updateProgress = (projectId: string, optionId: string, step: number, status: string) => {
    const key = `${projectId}-${optionId}`;
    setProgress(prev => ({
      ...prev,
      [key]: { current: step, status }
    }));
  };

  const handleFix = async () => {
    if (selectedProject === '') {
      toast({
        variant: 'destructive',
        title: 'No project selected',
        description: 'Please select a project to apply fixes to',
      });
      return;
    }

    if (selectedOptions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No options selected',
        description: 'Please select at least one compliance option to fix',
      });
      return;
    }

    setLoading(true);
    try {
      for (const optionId of selectedOptions) {
        const option = complianceOptions.find(o => o.id === optionId);
        if (!option) continue;

        // Reset progress for this project-option combination
        const progressKey = `${selectedProject}-${optionId}`;
        setProgress(prev => ({
          ...prev,
          [progressKey]: { current: 0, status: 'Starting...' }
        }));

        try {
          // Execute the appropriate fix based on the option
          switch (optionId) {
            case 'mfa':
              updateProgress(selectedProject, optionId, 25, 'Creating MFA function...');
              await APIService.enableMFA(selectedProject);
              updateProgress(selectedProject, optionId, 100, 'MFA enabled');
              break;

            case 'rls':
              updateProgress(selectedProject, optionId, 25, 'Creating RLS helper functions...');
              await APIService.enableRLS(selectedProject);
              updateProgress(selectedProject, optionId, 100, 'RLS enabled for all tables');
              break;

            case 'pitr':
              updateProgress(selectedProject, optionId, 25, 'Enabling PITR...');
              await APIService.enablePITR(selectedProject);
              updateProgress(selectedProject, optionId, 100, 'PITR enabled');
              break;
          }

          toast({
            title: 'Fix Applied',
            description: `${option.title} has been enabled for ${selectedProject}`,
          });
        } catch (error) {
          updateProgress(selectedProject, optionId, 0, 'Failed');
          toast({
            variant: 'destructive',
            title: 'Error',
            description: `Failed to apply ${option.title} to ${selectedProject}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
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

      {showKeyInput && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Management API Key Required</CardTitle>
            <CardDescription>
              Please provide your Supabase Management API key to fix compliance issues
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
                  checked={selectedProject === project.id}
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
                    checked={selectedOptions.includes(option.id)}
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
                
                {Object.entries(projects)
                  .filter(([_, project]) => project.id === selectedProject)
                  .map(([_, project]) => {
                    const progressKey = `${project.id}-${option.id}`;
                    const progressData = progress[progressKey];
                    
                    if (!progressData) return null;
                    
                    return (
                      <div key={`${option.id}-${project.id}`} className="pl-6 space-y-2">
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
              disabled={loading || !selectedProject || selectedOptions.length === 0}
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