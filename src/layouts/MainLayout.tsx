import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../features/dashboard/Sidebar';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};