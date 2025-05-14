import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { DocumentRequest } from '../../types';
import type { RootState, AppDispatch } from '../../store';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface DocumentFormProps {
  initialValues?: Partial<DocumentRequest>;
  onSubmit: (data: DocumentRequest, file?: File) => void;
  isLoading: boolean;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<DocumentRequest>({
    defaultValues: initialValues,
  });
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.categories);
  const { departments } = useSelector((state: RootState) => state.departments);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = (data: DocumentRequest) => {
    onSubmit(data, file || undefined);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <Input
          id="title"
          placeholder="Document title"
          {...register('title', {
            required: 'Title is required',
          })}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
          Category
        </label>
        <select
          id="categoryId"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register('categoryId', {
            required: 'Category is required',
            valueAsNumber: true,
          })}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="departmentId" className="block text-sm font-medium mb-1">
          Department
        </label>
        <select
          id="departmentId"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register('departmentId', {
            required: 'Department is required',
            valueAsNumber: true,
          })}
        >
          <option value="">Select a department</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        {errors.departmentId && (
          <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="fileDescription" className="block text-sm font-medium mb-1">
          File Description
        </label>
        <Input
          id="fileDescription"
          placeholder="File description"
          {...register('fileDescription')}
        />
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium mb-1">
          Attach File
        </label>
        <Input
          id="file"
          type="file"
          className="cursor-pointer"
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-500 mt-1">
          {file ? `Selected file: ${file.name}` : 'No file selected'}
        </p>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : initialValues?.title ? 'Update Document' : 'Create Document'}
      </Button>
    </form>
  );
};