import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState, AppDispatch } from '@/store';
import { fetchDocuments, deleteDocument } from '@/store/slices/documentSlice';
import { toast } from 'sonner';
import type { Document, Department } from '@/types';
import api from '@/services/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Download,
  FileText,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Filter,
} from 'lucide-react';

export const DocumentList: React.FC = () => {
  console.log('[DocumentList] Component mounted');
  
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { documents, isLoading, error } = useSelector((state: RootState) => state.documents);
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  
  // Extract unique categories from documents for filtering
  const categories = React.useMemo(() => {
    const uniqueCategories = new Map();
    documents.forEach(doc => {
      if (doc.category && !uniqueCategories.has(doc.category.id)) {
        uniqueCategories.set(doc.category.id, doc.category);
      }
    });
    return Array.from(uniqueCategories.values());
  }, [documents]);
  
  // Check if user is admin
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  
  console.log('[DocumentList] User role:', user?.role, 'isAdmin:', isAdmin);

  // Fetch documents and departments on component mount
  useEffect(() => {
    console.log('[DocumentList] Fetching initial data');
    dispatch(fetchDocuments());
    fetchDepartments();
  }, [dispatch]);

  // Apply filters when documents, search term, or filters change
  useEffect(() => {
    console.log('[DocumentList] Applying filters', { 
      searchTerm, 
      filterDepartment, 
      filterCategory,
      documentsCount: documents.length
    });
    
    let filtered = [...documents];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply department filter
    if (filterDepartment && filterDepartment !== 'all') {
      filtered = filtered.filter(doc => doc.departmentId === parseInt(filterDepartment));
    }
    
    // Apply category filter
    if (filterCategory && filterCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category.id === parseInt(filterCategory));
    }
    
    setFilteredDocuments(filtered);
  }, [documents, searchTerm, filterDepartment, filterCategory]);

  const fetchDepartments = async () => {
    try {
      console.log('[DocumentList] Fetching departments');
      
      const departmentsResponse = await api.get('/departments');
      
      console.log('[DocumentList] Departments fetched:', departmentsResponse.data);
      setDepartments(departmentsResponse.data);
    } catch (error) {
      console.error('[DocumentList] Error fetching departments:', error);
      // Don't show an error toast here since departments might be optional
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      console.log('[DocumentList] Deleting document:', documentToDelete.id);
      await dispatch(deleteDocument(documentToDelete.id)).unwrap();
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('[DocumentList] Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setDocumentToDelete(null);
    }
  };

  const handleDownload = async (docToDownload: Document) => {
    try {
      console.log('[DocumentList] Downloading document:', docToDownload.id);
      
      // Request the download URL from the backend
      const response = await api.get(`/files/${docToDownload.id}/download`, {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', docToDownload.fileName || 'document');
      
      // Append to the body, click it, and clean up
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 0);
      
      toast.success('Download started');
    } catch (error) {
      console.error('[DocumentList] Error downloading document:', error);
      toast.error('Download failed');
    }
  };

  // Function to format file size
  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get department name by ID
  const getDepartmentName = (id: number): string => {
    const department = departments.find(dept => dept.id === id);
    return department?.name || 'Unknown';
  };

  // Format date without date-fns
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterDepartment(null);
    setFilterCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            Manage and access your organization's documents
          </p>
        </div>
        <Link to="/documents/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {departments.length > 0 && (
              <div className="w-full md:w-[200px]">
                <Select 
                  value={filterDepartment || undefined} 
                  onValueChange={setFilterDepartment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {categories.length > 0 && (
              <div className="w-full md:w-[200px]">
                <Select 
                  value={filterCategory || undefined} 
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Button variant="outline" onClick={resetFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>
            {filteredDocuments.length} documents found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => dispatch(fetchDocuments())}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>File Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No documents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {doc.fileDescription || doc.fileName || 'No description'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{doc.category.name}</TableCell>
                        <TableCell>{getDepartmentName(doc.departmentId)}</TableCell>
                        <TableCell>{doc.fileType || 'N/A'}</TableCell>
                        <TableCell>{formatFileSize(doc.fileSizeBytes)}</TableCell>
                        <TableCell>{formatDate(doc.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <Link to={`/documents/${doc.id}`}>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              {(isAdmin || user?.email === doc.createdBy) && (
                                <>
                                  <Link to={`/documents/${doc.id}/edit`}>
                                    <DropdownMenuItem>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  </Link>
                                  <DropdownMenuItem 
                                    onClick={() => setDocumentToDelete(doc)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Document Confirmation Dialog */}
      <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the document <span className="font-semibold">{documentToDelete?.title}</span> and remove all associated files. This action cannot be undone.
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