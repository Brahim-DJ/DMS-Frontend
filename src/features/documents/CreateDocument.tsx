import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { createDocument } from '@/store/slices/documentSlice';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { Department, Category } from '@/types';
import api from '@/services/api';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

interface FormData {
  title: string;
  departmentId: number;
  categoryId: number;
  fileDescription?: string;
  file?: FileList;
}

export const CreateDocument: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const departmentList = useSelector((state: RootState) => state.departments?.departments) as Department[] || [];
  const categoryList = useSelector((state: RootState) => state.categories?.categories) as Category[] || [];

  // Only departments the user has access to (by name)
  const allowedDepartments = departmentList.filter(
    dept => user?.departments?.includes(dept.name)
  );

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (data.file && data.file.length > 0) {
        const formData = new FormData();
        formData.append('file', data.file[0]);
        formData.append('fileDescription', data.fileDescription || '');
        formData.append('document', new Blob([
          JSON.stringify({
            title: data.title,
            departmentId: data.departmentId,
            categoryId: data.categoryId,
            fileDescription: data.fileDescription,
          })
        ], { type: 'application/json' }));
        const response = await api.post('/documents/with-file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Document created');
        navigate(`/documents/${response.data.id}`);
      } else {
        const response = await dispatch(createDocument({
          title: data.title,
          departmentId: data.departmentId,
          categoryId: data.categoryId,
          fileDescription: data.fileDescription,
        })).unwrap();
        toast.success('Document created');
        navigate(`/documents/${response.id}`);
      }
    } catch (error) {
      toast.error('Failed to create document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => navigate('/documents')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Create Document</h2>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
            <CardDescription>Fill in the details for the new document</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Document Title</Label>
                <Input id="title" {...register('title', { required: 'Title is required' })} />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="departmentId">Department</Label>
                <Select onValueChange={v => setValue('departmentId', Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedDepartments.length === 0 ? (
                      <SelectItem value="">No departments available</SelectItem>
                    ) : (
                      allowedDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.departmentId && <p className="text-sm text-destructive mt-1">{errors.departmentId.message}</p>}
              </div>
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <Select onValueChange={v => setValue('categoryId', Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryList.length === 0 ? (
                      <SelectItem value="">No categories available</SelectItem>
                    ) : (
                      categoryList.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>}
              </div>
              <div>
                <Label htmlFor="fileDescription">File Description</Label>
                <Textarea id="fileDescription" rows={2} {...register('fileDescription')} />
              </div>
              <div>
                <Label htmlFor="file">Upload File (optional)</Label>
                <Input id="file" type="file" {...register('file')} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => navigate('/documents')}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Document'}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};