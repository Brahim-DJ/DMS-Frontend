import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { LoginForm } from './features/auth/LoginForm';
import { RegisterForm } from './features/auth/RegisterForm';
import { Dashboard } from './features/dashboard/Dashboard';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DocumentList } from './features/documents/DocumentList';
import { DocumentDetail } from './features/documents/DocumentDetail';
import { CreateDocument } from './features/documents/CreateDocument';
import { EditDocument } from './features/documents/EditDocument';
import { CategoryList } from './features/categories/CategoryList';
import { DepartmentList } from './features/departments/DepartmentList';
import { UserList } from './features/users/UserList';
import { CreateUser } from './features/users/CreateUser';
import { EditUser } from './features/users/EditUser';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
          </Route>
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Document Routes */}
            <Route path="/documents" element={<DocumentList documents={[]} />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/documents/create" element={<CreateDocument />} />
            <Route path="/documents/:id/edit" element={<EditDocument />} />
            
            {/* Category Routes */}
            <Route path="/categories" element={<CategoryList />} />
            
            {/* Department Routes */}
            <Route path="/departments" element={<DepartmentList />} />
            
            {/* User Routes */}
            <Route path="/users" element={<UserList />} />
            <Route path="/users/create" element={<CreateUser />} />
            <Route path="/users/:id/edit" element={<EditUser />} />
          </Route>
          
          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;