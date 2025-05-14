import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { Department, User } from '@/types';
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
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';

interface EditUserFormData {
  email: string;
  role: string;
  password?: string;
}

export const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EditUserFormData>();
  
  const [user, setUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  
  // Check if current user is admin (case-insensitive)
  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';

  // Debug user role
  console.log("Current user role:", currentUser?.role, "IsAdmin:", isAdmin);

  // Watch the role field
  const selectedRole = watch('role');

  // Fetch user and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        
        // Fetch user
        const userResponse = await api.get(`/users/${id}`);
        setUser(userResponse.data);
        
        // Set form values
        setValue('email', userResponse.data.email);
        setValue('role', userResponse.data.role);
        
        // Set selected departments
        if (userResponse.data.departments) {
          const deptIds = userResponse.data.departmentIds || [];
          setSelectedDepartments(deptIds);
        }

        // Fetch departments
        const deptResponse = await api.get('/departments');
        setDepartments(deptResponse.data);
      } catch (error) {
        toast.error('Failed to load user data');
        console.error('Error fetching user data:', error);
        navigate('/users');
      } finally {
        setFetchingData(false);
      }
    };

    if (isAdmin && id) {
      fetchData();
    }
  }, [id, isAdmin, navigate, setValue]);

  // Toggle department selection
  const toggleDepartment = (departmentId: number) => {
    setSelectedDepartments(prev => 
      prev.includes(departmentId)
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  // Handle form submission
  const onSubmit = async (data: EditUserFormData) => {
    if (!isAdmin || !id) return;
    
    try {
      setLoading(true);
      
      // Create payload (omit empty password)
      const payload: any = {
        email: data.email,
        role: data.role, // Keep the role as received from the form (uppercase ADMIN or USER)
        departmentIds: selectedDepartments
      };
      
      if (data.password) {
        payload.password = data.password;
      }

      console.log("Updating user with data:", payload);
      
      await api.put(`/users/${id}`, payload);
      toast.success('User updated successfully');
      navigate('/users');
    } catch (error: any) {
      console.error("Error updating user:", error);
      const message = error.response?.data?.message || 'Failed to update user';
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
          Only administrators can edit users
        </p>
      </div>
    );
  }

  // Show loading state
  if (fetchingData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit User</h2>
          <p className="text-muted-foreground">
            Update user information
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
              Edit details for {user?.email}
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
              <Label htmlFor="password">
                Password <span className="text-muted-foreground text-sm">(Leave empty to keep unchanged)</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password', {
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
                defaultValue={user?.role}
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
              {loading ? 'Updating...' : 'Update User'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};