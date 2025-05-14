import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface DepartmentFormData {
  name: string;
}

interface DepartmentFormProps {
  initialValues?: DepartmentFormData;
  onSubmit: (data: DepartmentFormData) => void;
  isLoading: boolean;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<DepartmentFormData>({
    defaultValues: initialValues,
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Department Name
        </label>
        <Input
          id="name"
          placeholder="Enter department name"
          {...register('name', {
            required: 'Department name is required',
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : initialValues?.name ? 'Update Department' : 'Create Department'}
      </Button>
    </form>
  );
};