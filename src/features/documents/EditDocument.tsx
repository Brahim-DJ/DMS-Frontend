import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import api from '@/services/api';
import { toast } from 'sonner';
import type { Department, Category } from '@/types';
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

export const EditDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const documentId = Number(id);
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const departmentList = useSelector((state: RootState) => state.departments?.departments) as Department[] || [];
  const categoryList = useSelector((state: RootState) => state.categories?.categories) as Category[] || [];
  const { documents } = useSelector((state: RootState) => state.documents);

  // Only departments the user has access to (by name)
  const allowedDepartments = departmentList.filter(
    dept => user?.departments?.includes(dept.name)
  );

  const [form, setForm] = useState({
    title: '',
    translatedTitle: '',
    departmentId: 0,
    categoryId: 0,
    fileDescription: '',
    fileName: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      setForm({
        title: doc.title,
        translatedTitle: doc.translatedTitle ?? '',
        departmentId: doc.departmentId,
        categoryId: doc.category.id,
        fileDescription: doc.fileDescription ?? '',
        fileName: doc.fileName ?? '',
      });
    }
  }, [documents, documentId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileDescription', form.fileDescription || '');
        formData.append('document', new Blob([
          JSON.stringify({
            title: form.title,
            translatedTitle: form.translatedTitle,
            departmentId: form.departmentId,
            categoryId: form.categoryId,
            fileDescription: form.fileDescription,
          })
        ], { type: 'application/json' }));
        const response = await api.put(`/documents/${documentId}/with-file`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Document updated');
        navigate(`/documents/${response.data.id}`);
      } else {
        await api.put(`/documents/${documentId}`, {
          title: form.title,
          translatedTitle: form.translatedTitle,
          departmentId: form.departmentId,
          categoryId: form.categoryId,
          fileDescription: form.fileDescription,
        });
        toast.success('Document updated');
        navigate(`/documents/${documentId}`);
      }
    } catch (error) {
      toast.error('Failed to update document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => navigate(`/documents/${documentId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Edit Document</h2>
      </div>
      <Card>
        <form onSubmit={onSubmit}>
          <CardHeader>
            <CardTitle>Edit Document</CardTitle>
            <CardDescription>Update details and file for this document</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Document Title</Label>
                <Input id="title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="translatedTitle">Translated Title</Label>
                <Input id="translatedTitle" value={form.translatedTitle} onChange={e => setForm(f => ({ ...f, translatedTitle: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="departmentId">Department</Label>
                <Select value={form.departmentId.toString()} onValueChange={v => setForm(f => ({ ...f, departmentId: Number(v) }))}>
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
              </div>
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <Select value={form.categoryId.toString()} onValueChange={v => setForm(f => ({ ...f, categoryId: Number(v) }))}>
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
              </div>
              <div>
                <Label htmlFor="fileDescription">File Description</Label>
                <Textarea id="fileDescription" rows={2} value={form.fileDescription} onChange={e => setForm(f => ({ ...f, fileDescription: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="file">Replace File (optional)</Label>
                <Input id="file" type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
                {form.fileName && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Current file: {form.fileName}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => navigate(`/documents/${documentId}`)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Updating...' : 'Update Document'}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};