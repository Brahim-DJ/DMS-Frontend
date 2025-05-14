import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface CategoryFormData {
  name: string;
  description?: string;
}

interface CategoryFormProps {
  initialValues?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => void;
  isLoading: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: initialValues,
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Category Name
        </label>
        <Input
          id="name"
          placeholder="Enter category name"
          {...register('name', {
            required: 'Category name is required',
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description (Optional)
        </label>
        <textarea
          id="description"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter category description"
          {...register('description')}
        ></textarea>
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : initialValues?.name ? 'Update Category' : 'Create Category'}
      </Button>
    </form>
  );
};