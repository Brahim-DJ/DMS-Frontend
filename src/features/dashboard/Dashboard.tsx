import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchDocuments } from '../../store/slices/documentSlice';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchDocuments());
    console.log('Dashboard mounted');
  }, [dispatch]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session Expired</h2>
          <p className="mb-4">Please login again to continue.</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto p-6">
        <header className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
          </div>
        </header>
      </div>
    </div>
  );
};