"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Edit, Power, Users, Settings, AlertCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { apiClient, User } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "staff" as "admin" | "manager" | "staff"
  });
  const [editUser, setEditUser] = useState({
    username: "",
    email: "",
    role: "staff" as "admin" | "manager" | "staff"
  });
  const [resetPassword, setResetPassword] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      setUsers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await apiClient.register(newUser);
      toast.success('User created successfully');
      setShowAddUser(false);
      setNewUser({ username: "", email: "", password: "", role: "staff" });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user. Please check the details and try again.');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setError("");

    try {
      await apiClient.updateUser(selectedUser.id, editUser);
      toast.success('User updated successfully');
      setShowEditUser(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user. Please check the details and try again.');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await apiClient.toggleUserStatus(user.id);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      username: user.username,
      email: user.email,
      role: user.role
    });
    setShowEditUser(true);
  };

  const openResetPasswordModal = (user: User) => {
    setSelectedUser(user);
    setResetPassword({
      newPassword: "",
      confirmPassword: ""
    });
    setShowResetPassword(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setError("");

    if (resetPassword.newPassword !== resetPassword.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (resetPassword.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await apiClient.resetUserPassword(selectedUser.id, resetPassword.newPassword);
      toast.success('Password reset successfully');
      setShowResetPassword(false);
      setSelectedUser(null);
      setResetPassword({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Failed to reset password. Please try again.');
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800 border-red-200",
      manager: "bg-blue-100 text-blue-800 border-blue-200",
      staff: "bg-green-100 text-green-800 border-green-200"
    };
    return colors[role as keyof typeof colors] || colors.staff;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (currentUser?.role !== 'admin') {
    return (
      <ProtectedRoute requiredRoles={['admin']}>
        <MainLayout>
          <div className="container mx-auto py-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don&apos;t have permission to access this page. Admin access required.
              </AlertDescription>
            </Alert>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <MainLayout>
        <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-600">Manage system users and permissions</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* User Management Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Add and manage staff users with restricted access. Edit details, reset passwords, and control access.</CardDescription>
              </div>
            </div>
            
            <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Staff User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Staff User</DialogTitle>
                  <DialogDescription>
                    Create a new staff user account with access to orders and food categories only.
                  </DialogDescription>
                </DialogHeader>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Enter password"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create User</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.lastLogin && (
                          <div className="text-xs text-gray-400">
                            Last login: {format(new Date(user.lastLogin), 'PPp')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getStatusBadge(user.isActive)}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResetPasswordModal(user)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user)}
                            className={user.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found. Add your first staff user above.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Permissions Info */}
        <Card>
          <CardHeader>
            <CardTitle>Staff User Permissions</CardTitle>
            <CardDescription>What staff users can access in the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">View and manage lunch orders</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">View and manage dinner orders</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">View and manage food categories</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">Cannot access: Dashboard, Analytics, Companies, Customers, Drivers, Bills, Payments</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Modal */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editUser.username}
                onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                placeholder="Enter username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                placeholder="Enter email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editUser.role} onValueChange={(value: any) => setEditUser({...editUser, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditUser(false)}>
                Cancel
              </Button>
              <Button type="submit">Update User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.username}.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={resetPassword.newPassword}
                onChange={(e) => setResetPassword({...resetPassword, newPassword: e.target.value})}
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={resetPassword.confirmPassword}
                onChange={(e) => setResetPassword({...resetPassword, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowResetPassword(false)}>
                Cancel
              </Button>
              <Button type="submit">Reset Password</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}