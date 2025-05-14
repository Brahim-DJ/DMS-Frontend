import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface UserFormData {
  email?: string;
  password?: string;
  role?: string;
  departmentIds?: number[];
}

interface UserFormProps {
  initialValues?: UserFormData;
  onSubmit: (data: UserFormData) => void;
  isLoading: boolean;
  isPasswordRequired?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  isPasswordRequired = false,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    defaultValues: initialValues,
  });
  
  const dispatch = useDispatch<AppDispatch>();
  const { departments } = useSelector((state: RootState) => state.departments);
  
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          {...register('email', {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password {!isPasswordRequired && '(Leave blank to keep current password)'}
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          {...register('password', {
            required: isPasswordRequired ? 'Password is required' : false,
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-1">
          Role
        </label>
        <select
          id="role"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register('role')}
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Departments
        </label>
        <div className="max-h-40 overflow-y-auto border rounded-md p-2">
          {departments.map((department) => (
            <div key={department.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`department-${department.id}`}
                value={department.id}
                className="mr-2"
                {...register('departmentIds')}
              />
              <label htmlFor={`department-${department.id}`}>
                {department.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
};