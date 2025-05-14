import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import type { AppDispatch, RootState } from '../../store';
import { Button } from '../../components/ui/button';

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">DMS System</h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/documents"
              className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
            >
              Documents
            </Link>
          </li>
          <li>
            <Link
              to="/categories"
              className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
            >
              Categories
            </Link>
          </li>
          {user?.role === 'ADMIN' && (
            <>
              <li>
                <Link
                  to="/departments"
                  className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                >
                  Departments
                </Link>
              </li>
              <li>
                <Link
                  to="/users"
                  className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                >
                  Users
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <p className="text-sm mb-2">{user?.email}</p>
        <p className="text-xs text-gray-400 mb-4">Role: {user?.role}</p>
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};