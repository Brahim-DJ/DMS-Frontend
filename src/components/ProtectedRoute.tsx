import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { validateToken } from '../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  
  useEffect(() => {
    if (token) {
      dispatch(validateToken());
    }
  }, [dispatch, token]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};