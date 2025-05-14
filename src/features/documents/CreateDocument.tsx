import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../../store';
import type { DocumentRequest } from '../../types';
import { createDocument } from '../../store/slices/documentSlice';
import { DocumentForm } from './DocumentForm';
import api from '../../services/api';

export const CreateDocument: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (data: DocumentRequest, file?: File) => {
    setIsLoading(true);
    try {
      if (file) {
        // If we have a file, we need to use the multipart endpoint
        const formData = new FormData();
        formData.append('document', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        formData.append('file', file);
        if (data.fileDescription) {
          formData.append('fileDescription', data.fileDescription);
        }
        
        const response = await api.post('/documents/with-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data) {
          navigate(`/documents/${response.data.id}`);
        }
      } else {
        // If no file, use the standard document creation
        const result = await dispatch(createDocument(data));
        if (createDocument.fulfilled.match(result)) {
          navigate(`/documents/${result.payload.id}`);
        }
      }
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create Document</h1>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <DocumentForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};