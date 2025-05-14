// Auth types
export interface User {
  id: number;
  email: string;
  role: string;
  departments: string[];
}

export interface Department {
  id: number;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: string;
  departmentIds?: number[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Document types
export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Document {
  id: number;
  title: string;
  translatedTitle?: string;
  departmentId: number;
  category: {
    id: number;
    name: string;
  };
  fileName?: string;
  fileDescription?: string;
  fileType?: string;
  fileSizeBytes?: number;
  fileUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRequest {
  title: string;
  departmentId: number;
  categoryId: number;
  fileName?: string;
  fileDescription?: string;
  fileType?: string;
  fileSizeBytes?: number;
}

export interface FileUploadRequest {
  documentId: number;
  fileDescription?: string;
}

// State types
export interface DepartmentState {
  departments: Department[];
  isLoading: boolean;
  error: string | null;
}

export interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export interface DocumentState {
  documents: Document[];
  selectedDocument: Document | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
}
