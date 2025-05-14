import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchUsers, deleteUser } from '../../store/slices/userSlice';
import { Button } from '../../components/ui/button';
import { Edit, Trash, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { users, isLoading, error } = useSelector((state: RootState) => state.users);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const isAdmin = currentUser?.role === 'ADMIN';
  
  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchUsers());
    }
  }, [dispatch, isAdmin]);
  
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await dispatch(deleteUser(id));
    }
  };
  
  if (!isAdmin) {
    return <div className="p-6">You don't have permission to view this page.</div>;
  }
  
  if (isLoading) {
    return <div className="p-6">Loading users...</div>;
  }
  
  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => navigate('/users/create')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>
      
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departments
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm">{user.id}</td>
                  <td className="py-4 px-4 text-sm">{user.email}</td>
                  <td className="py-4 px-4 text-sm">{user.role}</td>
                  <td className="py-4 px-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {user.departments.map((dept, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {dept}
                        </span>
                      ))}
                      {user.departments.length === 0 && <span className="text-gray-500">None</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/users/${user.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      {currentUser?.id !== user.id && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};