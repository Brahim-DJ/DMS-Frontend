import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../../store/slices/authSlice';
import type { AppDispatch } from '../../store';
import { UserForm } from './UserForm';

interface UserFormData {
  email: string;
  password: string;
  role: string;
  departmentIds?: number[];
}

export const CreateUser: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (data: UserFormData) => {
    if (!data.email || !data.password) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await dispatch(register({
        email: data.email,
        password: data.password,
        role: data.role || 'USER',
        departmentIds: data.departmentIds?.map(id => 
          typeof id === 'string' ? parseInt(id) : id
        )
      }));
      
      if (register.fulfilled.match(result)) {
        navigate('/users');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create User</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <UserForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
          isPasswordRequired={true}
        />
      </div>
    </div>
  );
};