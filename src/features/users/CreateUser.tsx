import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { Department } from '@/types';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Checkbox
} from '@/components/ui/checkbox';
import { Shield, ArrowLeft } from 'lucide-react';

interface CreateUserFormData {
  email: string;
  password: string;
  role: string;
}

export const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateUserFormData>({
    defaultValues: {
      role: 'USER'
    }
  });
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [fetchingDepartments, setFetchingDepartments] = useState(true);
  
  // Check if current user is admin (case-insensitive)
  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';

  // Debug user role
  console.log("Current user role:", currentUser?.role, "IsAdmin:", isAdmin);

  // Watch the role field
  const selectedRole = watch('role');

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setFetchingDepartments(true);
        const response = await api.get('/departments');
        setDepartments(response.data);
      } catch (error) {
        toast.error('Failed to load departments');
        console.error('Error fetching departments:', error);
      } finally {
        setFetchingDepartments(false);
      }
    };

    if (isAdmin) {
      fetchDepartments();
    }
  }, [isAdmin]);

  // Toggle department selection
  const toggleDepartment = (departmentId: number) => {
    setSelectedDepartments(prev => 
      prev.includes(departmentId)
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  // Handle form submission
  const onSubmit = async (data: CreateUserFormData) => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      console.log("Creating user with data:", {
        ...data,
        departmentIds: selectedDepartments 
      });
      
      await api.post('/auth/register', {
        ...data,
        departmentIds: selectedDepartments
      });
      
      toast.success('User created successfully');
      navigate('/users');
    } catch (error: any) {
      console.error("Error creating user:", error);
      const message = error.response?.data?.message || 'Failed to create user';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          Only administrators can create users
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create User</h2>
          <p className="text-muted-foreground">
            Add a new user to the system
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Enter the details for the new user
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                onValueChange={value => setValue('role', value)} 
                defaultValue="USER"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Departments</Label>
              {fetchingDepartments ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">Loading departments...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {departments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No departments available</p>
                  ) : (
                    departments.map((department) => (
                      <div key={department.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`department-${department.id}`}
                          checked={selectedDepartments.includes(department.id)}
                          onCheckedChange={() => toggleDepartment(department.id)}
                        />
                        <Label 
                          htmlFor={`department-${department.id}`}
                          className="text-sm font-normal"
                        >
                          {department.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => navigate('/users')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};