import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import type { DocumentRequest } from '../../types';
import { fetchDocumentById, updateDocument } from '../../store/slices/documentSlice';
import { DocumentForm } from './DocumentForm';
import api from '../../services/api';

export const EditDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedDocument, isLoading } = useSelector((state: RootState) => state.documents);
  const [formLoading, setFormLoading] = useState(false);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchDocumentById(parseInt(id)));
    }
  }, [dispatch, id]);
  
  const handleSubmit = async (data: DocumentRequest, file?: File) => {
    if (!id) return;
    
    const documentId = parseInt(id);
    setFormLoading(true);
    
    try {
      if (file) {
        // If we have a file, we need to use the multipart endpoint
        const formData = new FormData();
        formData.append('document', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        formData.append('file', file);
        if (data.fileDescription) {
          formData.append('fileDescription', data.fileDescription);
        }
        
        const response = await api.put(`/documents/${documentId}/with-file`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data) {
          navigate(`/documents/${documentId}`);
        }
      } else {
        // If no file, use the standard document update
        const result = await dispatch(updateDocument({ id: documentId, document: data }));
        if (updateDocument.fulfilled.match(result)) {
          navigate(`/documents/${documentId}`);
        }
      }
    } catch (error) {
      console.error('Error updating document:', error);
    } finally {
      setFormLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="p-6">Loading document details...</div>;
  }
  
  if (!selectedDocument) {
    return <div className="p-6">Document not found</div>;
  }
  
  const initialValues: Partial<DocumentRequest> = {
    title: selectedDocument.title,
    departmentId: selectedDocument.departmentId,
    categoryId: selectedDocument.category.id,
    fileDescription: selectedDocument.fileDescription,
    fileName: selectedDocument.fileName,
    fileType: selectedDocument.fileType,
    fileSizeBytes: selectedDocument.fileSizeBytes
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Document</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <DocumentForm 
          initialValues={initialValues} 
          onSubmit={handleSubmit} 
          isLoading={formLoading} 
        />
      </div>
    </div>
  );
};