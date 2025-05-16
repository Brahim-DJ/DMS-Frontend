import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { fetchDocumentById, deleteDocument } from '@/store/slices/documentSlice';
import { toast } from 'sonner';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Download, Pencil, Trash2, FileText } from 'lucide-react';

export const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const documentId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedDocument, isLoading, error } = useSelector((state: RootState) => state.documents);
  const [department, setDepartment] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Only admin or creator can edit/delete
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const canEdit = isAdmin || (selectedDocument && user?.email === selectedDocument.createdBy);

  useEffect(() => {
    if (!selectedDocument || selectedDocument.id !== documentId) {
      dispatch(fetchDocumentById(documentId));
    }
  }, [dispatch, documentId, selectedDocument]);

  useEffect(() => {
    if (selectedDocument) {
      const fetchDept = async () => {
        try {
          const response = await api.get(`/departments/${selectedDocument.departmentId}`);
          setDepartment(response.data.name);
        } catch {
          setDepartment('Unknown');
        }
      };
      fetchDept();
    }
  }, [selectedDocument]);

  const handleDeleteDocument = async () => {
    try {
      await dispatch(deleteDocument(documentId)).unwrap();
      toast.success('Document deleted');
      navigate('/documents');
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDownload = async () => {
    try {
      const { data: url } = await api.get(`/files/${documentId}/download`, { responseType: 'text' });
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: "numeric", month: "short", day: "numeric" });
  };

  if (isLoading) return <div className="flex justify-center py-8">Loading...</div>;
  if (error) return <div className="text-destructive text-center py-8">{error}</div>;
  if (!selectedDocument) return <div className="py-8 text-center">Document not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/documents')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{selectedDocument.title}</h2>
            {selectedDocument.translatedTitle && (
              <p className="font-semibold text-primary">{selectedDocument.translatedTitle}</p>
            )}
            <p className="text-muted-foreground">Document Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="default" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {canEdit && (
            <>
              <Link to={`/documents/${selectedDocument.id}/edit`}>
                <Button variant="outline">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button 
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDocument.fileDescription && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p>{selectedDocument.fileDescription}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Department</h3>
                <p>{department}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Category</h3>
                <p>{selectedDocument.category.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created By</h3>
                <p>{selectedDocument.createdBy}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                <p>{formatDate(selectedDocument.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                <p>{formatDate(selectedDocument.updatedAt || '')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>File Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-4 bg-muted rounded-md">
              <FileText className="h-16 w-16 text-muted-foreground" />
            </div>
            {selectedDocument.fileName && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">File Name</h3>
                <p className="truncate">{selectedDocument.fileName}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">File Type</h3>
                <p>{selectedDocument.fileType || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Size</h3>
                <p>{formatFileSize(selectedDocument.fileSizeBytes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the document <span className="font-semibold">{selectedDocument.title}</span> and remove all associated files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};