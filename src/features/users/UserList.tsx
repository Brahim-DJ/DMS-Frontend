import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '@/store';
import { toast } from 'sonner';
import type { User } from '@/types';
import api from '@/services/api';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Plus, 
  Pencil, 
  Trash2,
  Shield
} from 'lucide-react';
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

export const UserList: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState(0);

  // Check if current user is admin (case-insensitive)
  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';

  // Debug user role
  console.log(`[UserList] Current user role: ${currentUser?.role}, IsAdmin: ${isAdmin}`);

  // Fetch users with manual authentication header
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Increment request counter
      const currentCount = requestCount + 1;
      setRequestCount(currentCount);
      
      // Get token directly from localStorage for each request
      const token = localStorage.getItem('token');
      console.log(`[UserList] Fetching users (attempt ${currentCount}) with token: ${token ? `${token.substring(0, 15)}...` : 'none'}`);
      
      // Manual headers to ensure token is included
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log(`[UserList] Request headers:`, headers);
      
      const response = await api.get('/users', { headers });
      console.log(`[UserList] Users fetched successfully (attempt ${currentCount}):`, response.data);
      setUsers(response.data);
    } catch (error: any) {
      console.error(`[UserList] Error fetching users (attempt ${requestCount}):`, error);
      
      if (error.response?.status === 403) {
        setError("You don't have permission to view users. Please try again.");
        toast.error("Permission Denied", {
          description: "Authentication issue - please try again"
        });
      } else {
        setError("Failed to load users. Please try again later.");
        toast.error("Error", {
          description: "Failed to load users"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Use an effect with a timeout to ensure token is available
  useEffect(() => {
    if (isAdmin) {
      console.log("[UserList] Admin user detected, preparing to fetch users");
      
      // Add a short delay to ensure token is properly set in localStorage
      const timer = setTimeout(() => {
        console.log("[UserList] Executing delayed initial fetch");
        fetchUsers();
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isAdmin]);

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Get token directly from localStorage for this request
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await api.delete(`/users/${userToDelete.id}`, { headers });
      setUsers(users.filter(user => user.id !== userToDelete.id));
      toast.success('User deleted successfully');
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error("Permission Denied", {
          description: "You don't have permission to delete users"
        });
      } else {
        toast.error('Failed to delete user');
      }
      console.error('Error deleting user:', error);
    } finally {
      setUserToDelete(null);
    }
  };

  // Render role badge
  const RoleBadge = ({ role }: { role: string }) => {
    const badgeClass = role?.toUpperCase() === 'ADMIN' 
      ? 'bg-destructive/20 text-destructive' 
      : 'bg-secondary/50 text-secondary-foreground';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {role}
      </span>
    );
  };

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          Only administrators can access user management
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage system users and their permissions
          </p>
        </div>
        <Link to="/users/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            A list of all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={fetchUsers}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Departments</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.departments && user.departments.length > 0 ? (
                            user.departments.map((dept, idx) => (
                              <span 
                                key={idx} 
                                className="bg-muted px-2 py-0.5 text-xs rounded-full"
                              >
                                {dept}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">No departments</span>
                          )}
                        </div>
                      </TableCell>
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
                            <Link to={`/users/${user.id}/edit`}>
                              <DropdownMenuItem>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem 
                              onClick={() => setUserToDelete(user)}
                              disabled={user.id === currentUser?.id}
                              className={user.id === currentUser?.id ? "text-muted-foreground" : "text-destructive"}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user <span className="font-semibold">{userToDelete?.email}</span> and remove all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};