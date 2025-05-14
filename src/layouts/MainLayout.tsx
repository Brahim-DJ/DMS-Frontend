import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { cn } from "@/lib/utils";

export const MainLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user role is admin (case-insensitive)
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  // Debug user info
  console.log("User info:", { user, role: user?.role, isAdmin });

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-muted/40 border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-4 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">DMS System</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
        </div>

        <div className="py-4 flex flex-col flex-1">
          <nav className="flex-1 px-2 space-y-1">
            {/* Dashboard link - visible to everyone */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-secondary text-secondary-foreground" 
                  : "hover:bg-secondary/80 hover:text-secondary-foreground"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </NavLink>

            {/* Users link - only visible to admins */}
            {isAdmin && (
              <NavLink
                to="/users"
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-secondary text-secondary-foreground" 
                    : "hover:bg-secondary/80 hover:text-secondary-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Users className="h-5 w-5" />
                Users
              </NavLink>
            )}
          </nav>

          <div className="px-3 mt-auto">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Header */}
        <header className="border-b bg-background z-30">
          <div className="flex h-16 items-center px-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
            
            <div className="flex items-center ml-auto gap-4">
              {user && (
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </span>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.role}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t py-4">
          <div className="container px-4 text-center text-sm text-muted-foreground">
            Document Management System &copy; {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  );
};