import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { RegisterRequest } from '../../types';
import { register as registerUser } from '../../store/slices/authSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import type { RootState, AppDispatch } from '../../store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const RegisterForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterRequest>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const { departments } = useSelector((state: RootState) => state.departments);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  const onSubmit = async (data: RegisterRequest) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      navigate('/login');
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            placeholder="Enter your email"
            {...register('email', {
              required: 'Email is required',
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

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register('password', {
              required: 'Password is required',
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

        <div className="mb-6">
          <label htmlFor="role" className="block text-sm font-medium mb-1">
            Role
          </label>
          <select
            id="role"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...register('role', {
              required: 'Role is required',
            })}
          >
            <option value="">Select a role</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        <div className="mb-6">
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

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </div>
  );
};