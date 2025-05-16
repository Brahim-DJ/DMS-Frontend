import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { useNavigate } from 'react-router-dom';
import { createDepartment } from '@/store/slices/departmentSlice';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';

export const CreateDepartment: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isLoading } = useSelector((state: RootState) => state.departments);

  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  // Only admins may access
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          Only administrators can create departments
        </p>
      </div>
    );
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Department name is required');
      return;
    }
    try {
      await dispatch(createDepartment(name)).unwrap();
      toast.success('Department created successfully');
      setName('');
      navigate('/departments');
    } catch (err: any) {
      setError(err || 'Failed to create department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create Department</h2>
          <p className="text-muted-foreground">
            Add a new department to the system
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/departments')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Departments
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Department Information</CardTitle>
            <CardDescription>
              Enter the name for the new department
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Department name"
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => navigate('/departments')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Department'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};