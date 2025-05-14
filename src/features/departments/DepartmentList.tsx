import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchDepartments, deleteDepartment } from '../../store/slices/departmentSlice';
import { Button } from '../../components/ui/button';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DepartmentList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { departments, isLoading, error } = useSelector((state: RootState) => state.departments);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);
  
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      await dispatch(deleteDepartment(id));
    }
  };
  
  if (!isAdmin) {
    return <div className="p-6">You don't have permission to view this page.</div>;
  }
  
  if (isLoading) {
    return <div className="p-6">Loading departments...</div>;
  }
  
  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Button onClick={() => navigate('/departments/create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Department
        </Button>
      </div>
      
      {departments.length === 0 ? (
        <p>No departments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departments.map((department) => (
                <tr key={department.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm">{department.id}</td>
                  <td className="py-4 px-4 text-sm">{department.name}</td>
                  <td className="py-4 px-4 text-sm">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/departments/${department.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(department.id)}
                      >
                        <Trash className="h-4 w-4 mr-1" /> Delete
                      </Button>
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