import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchDocumentById, deleteDocument } from '../../store/slices/documentSlice';
import { Button } from '../../components/ui/button';
import { formatDate } from '../../utils/formatDate';
import { 
  Download, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  File, 
  Calendar, 
  User, 
  Tag, 
  Building, 
  Info, 
  AlertCircle,
  FileText,
  Image,
  Archive 
} from 'lucide-react';

export const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedDocument, isLoading, error } = useSelector((state: RootState) => state.documents);
  const { user } = useSelector((state: RootState) => state.auth);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchDocumentById(parseInt(id)));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (!selectedDocument) return;
    
    const result = await dispatch(deleteDocument(selectedDocument.id));
    if (deleteDocument.fulfilled.match(result)) {
      navigate('/documents');
    }
  };

  const getFileIcon = () => {
    if (!selectedDocument?.fileType) return <FileText size={32} />;
    
    if (selectedDocument.fileType.includes('pdf')) {
      return <FileText size={32} className="text-red-500" />;
    } else if (selectedDocument.fileType.includes('image')) {
      return <Image size={32} className="text-green-500" />;
    } else if (selectedDocument.fileType.includes('word') || selectedDocument.fileType.includes('doc')) {
      return <FileText size={32} className="text-blue-500" />;
    } else if (selectedDocument.fileType.includes('excel') || selectedDocument.fileType.includes('sheet')) {
      return <FileText size={32} className="text-emerald-500" />;
    } else if (selectedDocument.fileType.includes('zip') || selectedDocument.fileType.includes('rar')) {
      return <Archive size={32} className="text-amber-500" />;
    } else {
      return <File size={32} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    
    if (bytes < 1024) {
      return `${bytes} bytes`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <span className="ml-3">Loading document details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start">
          <AlertCircle className="text-red-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={() => navigate('/documents')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedDocument) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start">
          <Info className="text-yellow-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800">Document Not Found</h3>
            <p className="text-yellow-700 mt-1">The document you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={() => navigate('/documents')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Documents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = user?.role === 'ADMIN' || selectedDocument.createdBy === user?.email;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/documents')} size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold truncate max-w-[500px]">{selectedDocument.title}</h1>
        </div>
        
        <div className="flex gap-2">
          {selectedDocument.fileUrl && (
            <Button 
              variant="outline" 
              onClick={() => window.open(selectedDocument.fileUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          
          {canEdit && (
            <>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/documents/${selectedDocument.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <Button 
                variant="destructive"
                onClick={() => setShowConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Document Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Info className="mr-2 h-5 w-5 text-blue-500" />
            Document Information
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="mt-1">{selectedDocument.title}</p>
            </div>
            
            {selectedDocument.translatedTitle && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Translated Title</h3>
                <p className="mt-1">{selectedDocument.translatedTitle}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Tag className="mr-1 h-4 w-4 text-indigo-500" />
                  Category
                </h3>
                <p className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedDocument.category.name}
                  </span>
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Building className="mr-1 h-4 w-4 text-indigo-500" />
                  Department ID
                </h3>
                <p className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {selectedDocument.departmentId}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="mr-1 h-4 w-4 text-indigo-500" />
                  Created By
                </h3>
                <p className="mt-1">{selectedDocument.createdBy}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-indigo-500" />
                  Created
                </h3>
                <p className="mt-1">{formatDate(selectedDocument.createdAt)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-indigo-500" />
                  Last Updated
                </h3>
                <p className="mt-1">{formatDate(selectedDocument.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <File className="mr-2 h-5 w-5 text-blue-500" />
            File Details
          </h2>
          
          {selectedDocument.fileName ? (
            <div className="space-y-4">
              <div className="flex justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                {getFileIcon()}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">File Name</h3>
                <p className="mt-1 break-words">{selectedDocument.fileName}</p>
              </div>
              
              {selectedDocument.fileDescription && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1">{selectedDocument.fileDescription}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">File Type</h3>
                  <p className="mt-1">{selectedDocument.fileType || 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Size</h3>
                  <p className="mt-1">{formatFileSize(selectedDocument.fileSizeBytes)}</p>
                </div>
              </div>
              
              {selectedDocument.fileUrl && (
                <Button 
                  className="w-full mt-2"
                  onClick={() => window.open(selectedDocument.fileUrl, '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
              )}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <File className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No file attached</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};