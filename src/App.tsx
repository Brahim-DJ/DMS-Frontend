import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from './store';
import { LoginForm } from './features/auth/LoginForm';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './features/dashboard/Dashboard';
import { UserList } from './features/users/UserList';
import { CreateUser } from './features/users/CreateUser';
import { EditUser } from './features/users/EditUser';
import { DocumentList } from './features/documents/DocumentList';
import { DocumentDetail } from './features/documents/DocumentDetail';
import { CreateDocument } from './features/documents/CreateDocument';
import { EditDocument } from './features/documents/EditDocument';
import { DepartmentList } from './features/departments/DepartmentList';
import { CreateDepartment } from './features/departments/CreateDepartment';
import { CategoryList } from './features/categories/CategoryList';
import { CreateCategory } from './features/categories/CreateCategory';
import { EditCategory } from './features/categories/EditCategory';
import { fetchCategories } from '@/store/slices/categorySlice';

import { useDispatch } from 'react-redux';
import { fetchDepartments } from '@/store/slices/departmentSlice';

const AppContent: React.FC = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    console.log('[App] Initializing app with auth state:', {
      tokenExists: !!token,
      userExists: !!userStr
    });
  }, []);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginForm />} />
          </Route>
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* User Management Routes */}
            <Route path="/users" element={<UserList />} />
            <Route path="/users/create" element={<CreateUser />} />
            <Route path="/users/:id/edit" element={<EditUser />} />
            
            {/* Document Management Routes */}
            <Route path="/documents" element={<DocumentList />} />
            <Route path="/documents/create" element={<CreateDocument />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/documents/:id/edit" element={<EditDocument />} />

            {/* Department Management Routes */}
            <Route path="/departments" element={<DepartmentList />} />
            <Route path="/departments/create" element={<CreateDepartment />} />

            <Route path="/categories" element={<CategoryList />} />
            <Route path="/categories/create" element={<CreateCategory />} />
            <Route path="/categories/:id/edit" element={<EditCategory />} />
          </Route>
          
          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <Toaster richColors position="top-right" />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;