import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { Document } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { fetchDocuments, searchDocuments, deleteDocument } from '../../store/slices/documentSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';
import type { AppDispatch, RootState } from '../../store';
import { Download, Edit, FileText, Search, Trash2, Filter, X } from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
}

export const DocumentList: React.FC<DocumentListProps> = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { documents, isLoading } = useSelector((state: RootState) => state.documents);
  const { categories } = useSelector((state: RootState) => state.categories);
  const { departments } = useSelector((state: RootState) => state.departments);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState<number | ''>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(documents);

  useEffect(() => {
    dispatch(fetchDocuments());
    dispatch(fetchCategories());
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    let filtered = [...documents];
    
    if (categoryFilter) {
      filtered = filtered.filter(doc => doc.category.id === categoryFilter);
    }
    
    if (departmentFilter) {
      filtered = filtered.filter(doc => doc.departmentId === departmentFilter);
    }
    
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.createdAt);
        return docDate.toDateString() === filterDate.toDateString();
      });
    }
    
    setFilteredDocuments(filtered);
  }, [documents, categoryFilter, departmentFilter, dateFilter]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchDocuments(searchQuery));
    } else {
      dispatch(fetchDocuments());
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await dispatch(deleteDocument(id));
    }
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setDepartmentFilter('');
    setDateFilter('');
    setFilterOpen(false);
  };
  
  const renderDocumentItem = (document: Document) => {
    // Determine file type icon
    const getFileIcon = () => {
      if (!document.fileType) return <FileText className="text-gray-400" />;
      
      if (document.fileType.includes('pdf')) {
        return <FileText className="text-red-500" />;
      } else if (document.fileType.includes('image')) {
        return <FileText className="text-green-500" />;
      } else if (document.fileType.includes('word') || document.fileType.includes('doc')) {
        return <FileText className="text-blue-500" />;
      } else if (document.fileType.includes('excel') || document.fileType.includes('sheet')) {
        return <FileText className="text-emerald-500" />;
      } else {
        return <FileText className="text-gray-500" />;
      }
    };
    
    return (
      <tr key={document.id} className="hover:bg-gray-50 transition-colors">
        <td className="py-3 px-4 text-sm">
          <div className="flex items-center">
            <div className="mr-3">
              {getFileIcon()}
            </div>
            <div>
              <p className="font-medium">{document.title}</p>
              {document.translatedTitle && (
                <p className="text-xs text-gray-500">{document.translatedTitle}</p>
              )}
            </div>
          </div>
        </td>
        <td className="py-3 px-4 text-sm">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {document.category.name}
          </span>
        </td>
        <td className="py-3 px-4 text-sm">{document.createdBy}</td>
        <td className="py-3 px-4 text-sm">{formatDate(document.createdAt)}</td>
        <td className="py-3 px-4 text-sm">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/documents/${document.id}`)}
              title="View document details"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/documents/${document.id}/edit`)}
              title="Edit document"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {document.fileUrl && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(document.fileUrl, '_blank')}
                title="Download file"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            {(user?.role === 'ADMIN' || document.createdBy === user?.email) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(document.id)}
                title="Delete document"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              variant="ghost" 
              className="absolute right-0 top-0 h-full px-3" 
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button
            variant="default"
            onClick={() => navigate('/documents/create')}
          >
            Add Document
          </Button>
        </div>
      </div>
      
      {filterOpen && (
        <div className="bg-white p-4 rounded-md shadow border grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select 
              className="w-full h-9 rounded-md border px-3 py-1"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select 
              className="w-full h-9 rounded-md border px-3 py-1"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">All Departments</option>
              {departments.map(department => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Date Added</label>
            <Input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          
          <div className="flex items-end">
            <Button variant="ghost" onClick={clearFilters} className="ml-auto">
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-500">Loading documents...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-md border">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || categoryFilter || departmentFilter || dateFilter
              ? "No documents match your search filters."
              : "Get started by creating a new document."}
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/documents/create')}>
              <FileText className="h-4 w-4 mr-2" />
              Create New Document
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md shadow">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.map(renderDocumentItem)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};