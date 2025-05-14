import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { 
  fetchUserById, 
  updateUser, 
  assignDepartmentsToUser 
} from '../../store/slices/userSlice';
import { UserForm } from './UserForm';

interface UserFormData {
  email?: string;
  password?: string;
  role?: string;
  departmentIds?: number[];
}

export const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser, isLoading, error } = useSelector((state: RootState) => state.users);
  const [formLoading, setFormLoading] = useState(false);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(parseInt(id)));
    }
  }, [dispatch, id]);
  
  const handleSubmit = async (data: UserFormData) => {
    if (!id || !selectedUser) return;
    
    const userId = parseInt(id);
    setFormLoading(true);
    
    try {
      // Update user basic info if changed
      if (data.email || data.role) {
        await dispatch(updateUser({
          id: userId,
          userData: {
            email: data.email,
            role: data.role
          }
        }));
      }
      
      // Handle department assignments if provided
      if (data.departmentIds && data.departmentIds.length > 0) {
        const departmentIds = data.departmentIds.map(id => 
          typeof id === 'string' ? parseInt(id) : id
        );
        
        await dispatch(assignDepartmentsToUser({
          userId,
          departmentIds
        }));
      }
      
      navigate('/users');
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setFormLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <span className="ml-3">Loading user details...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-medium text-red-800">Error</h3>
          <p className="text-red-700 mt-1">{error}</p>
          <button 
            className="mt-3 px-4 py-2 bg-white text-red-600 border border-red-300 rounded-md hover:bg-red-50"
            onClick={() => navigate('/users')}
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }
  
  if (!selectedUser) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-medium text-yellow-800">User Not Found</h3>
          <p className="text-yellow-700 mt-1">The user you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            className="mt-3 px-4 py-2 bg-white text-yellow-600 border border-yellow-300 rounded-md hover:bg-yellow-50"
            onClick={() => navigate('/users')}
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }
  
  // Prepare initial values for the form
  const initialValues: UserFormData = {
    email: selectedUser.email,
    role: selectedUser.role,
    departmentIds: selectedUser.departments.map(dept => {
      // If department is stored as a string containing a number
      const deptIdMatch = dept.match(/^(\d+)$/);
      return deptIdMatch ? parseInt(deptIdMatch[1]) : dept;
    })
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit User: {selectedUser.email}</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <UserForm 
          initialValues={initialValues} 
          onSubmit={handleSubmit} 
          isLoading={formLoading}
          isPasswordRequired={false}
        />
      </div>
    </div>
  );
};