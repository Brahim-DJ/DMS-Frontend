import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchCategories, deleteCategory } from '../../store/slices/categorySlice';
import { Button } from '../../components/ui/button';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CategoryList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { categories, isLoading, error } = useSelector((state: RootState) => state.categories);
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'ADMIN';
  
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await dispatch(deleteCategory(id));
    }
  };
  
  if (isLoading) {
    return <div className="p-6">Loading categories...</div>;
  }
  
  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        {isAdmin && (
          <Button onClick={() => navigate('/categories/create')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        )}
      </div>
      
      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <p className="text-gray-600 mt-1">
                    {category.description || 'No description available'}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/categories/${category.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};