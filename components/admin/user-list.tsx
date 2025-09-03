
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Mail, Shield, User as UserIcon, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/lib/api';
import type { User } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface UserListProps {
  currentUser: User;
}

// Extended user interface for display purposes
interface UserWithEmail extends User {
  email?: string;
}

export function UserList({ currentUser }: UserListProps) {
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithEmail | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<UserWithEmail | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileFormData, setProfileFormData] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAllUsers();
      const backendUsers = response.users || [];
      
      // Convert backend user format to frontend format
      const convertedUsers: UserWithEmail[] = backendUsers.map((user: any) => ({
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      }));
      
      setUsers(convertedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPassword = (user: UserWithEmail) => {
    setEditingUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setIsDialogOpen(true);
  };

  const handleSavePassword = async () => {
    if (!editingUser || !newPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.updateUserPassword(editingUser.id, newPassword);
      
      toast({
        title: "Success",
        description: `Password updated for ${editingUser.username}`,
      });
      
      setIsDialogOpen(false);
      setEditingUser(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to update password:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const handleSendPasswordResetEmail = async (user: UserWithEmail) => {
    if (!user.email) {
      toast({
        title: "Error",
        description: "No email address available for this user",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.sendPasswordResetEmail(user.email);
      
      toast({
        title: "Email Sent",
        description: `Password reset email sent to ${user.email}`,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
    }
  };

  const handleViewProfile = async (user: UserWithEmail) => {
    try {
      setViewingProfile(user);
      const response = await apiService.getAdminUserProfile(user.id);
      setUserProfile(response.profile);
      setProfileFormData({
        first_name: response.profile.first_name,
        last_name: response.profile.last_name,
        age: response.profile.age,
        date_of_birth: response.profile.date_of_birth,
        jlpt_level: response.profile.jlpt_level,
        why_study_japanese: response.profile.why_study_japanese,
      });
      setIsProfileDialogOpen(true);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!viewingProfile) return;

    try {
      const response = await apiService.updateAdminUserProfile(viewingProfile.id, profileFormData);
      setUserProfile(response.profile);
      setIsProfileEditing(false);
      toast({
        title: "Success",
        description: "User profile updated successfully",
      });
    } catch (error) {
      console.error('Failed to update user profile:', error);
      toast({
        title: "Error",
        description: "Failed to update user profile",
        variant: "destructive",
      });
    }
  };

  const handleCancelProfileEdit = () => {
    setProfileFormData({
      first_name: userProfile?.first_name || '',
      last_name: userProfile?.last_name || '',
      age: userProfile?.age || 0,
      date_of_birth: userProfile?.date_of_birth || '',
      jlpt_level: userProfile?.jlpt_level || 'None',
      why_study_japanese: userProfile?.why_study_japanese || '',
    });
    setIsProfileEditing(false);
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Shield className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />;
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button onClick={loadUsers} variant="outline">
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleViewProfile(user)}
                >
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <Mail className="h-4 w-4 text-muted-foreground inline mr-2" />
                    {user.email || 'No email'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {user.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendPasswordResetEmail(user)}
                        >
                          Send Reset Email
                        </Button>
                      )}
                      <Dialog open={isDialogOpen && editingUser?.id === user.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPassword(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Password for {user.username}</DialogTitle>
                            <DialogDescription>
                              Enter a new password for this user. The user will be able to change it after logging in.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                className={confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''}
                              />
                              {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-sm text-red-500">Passwords do not match</p>
                              )}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleSavePassword}
                              disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                            >
                              Save Password
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile - {viewingProfile?.username}</DialogTitle>
            <DialogDescription>
              View and edit user profile information
            </DialogDescription>
          </DialogHeader>
          {userProfile && (
            <div className="space-y-4">
              {/* Profile Picture Section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{userProfile.first_name} {userProfile.last_name}</h3>
                  <p className="text-muted-foreground">{userProfile.email}</p>
                </div>
              </div>

              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile_first_name">First Name</Label>
                  {isProfileEditing ? (
                    <Input
                      id="profile_first_name"
                      value={profileFormData.first_name || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, first_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm py-2">{userProfile.first_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="profile_last_name">Last Name</Label>
                  {isProfileEditing ? (
                    <Input
                      id="profile_last_name"
                      value={profileFormData.last_name || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, last_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm py-2">{userProfile.last_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="profile_age">Age</Label>
                  {isProfileEditing ? (
                    <Input
                      id="profile_age"
                      type="number"
                      value={profileFormData.age || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, age: parseInt(e.target.value) || 0 })}
                      min="13"
                      max="120"
                    />
                  ) : (
                    <p className="text-sm py-2">{userProfile.age}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="profile_date_of_birth">Date of Birth</Label>
                  {isProfileEditing ? (
                    <Input
                      id="profile_date_of_birth"
                      type="date"
                      value={profileFormData.date_of_birth || ''}
                      onChange={(e) => setProfileFormData({ ...profileFormData, date_of_birth: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm py-2">{new Date(userProfile.date_of_birth).toLocaleDateString()}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="profile_jlpt_level">JLPT Level</Label>
                  {isProfileEditing ? (
                    <Select
                      value={profileFormData.jlpt_level || 'None'}
                      onValueChange={(value) => setProfileFormData({ ...profileFormData, jlpt_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="N5">N5</SelectItem>
                        <SelectItem value="N4">N4</SelectItem>
                        <SelectItem value="N3">N3</SelectItem>
                        <SelectItem value="N2">N2</SelectItem>
                        <SelectItem value="N1">N1</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm py-2">{userProfile.jlpt_level}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="profile_why_study_japanese">Why do they want to study Japanese?</Label>
                {isProfileEditing ? (
                  <Textarea
                    id="profile_why_study_japanese"
                    value={profileFormData.why_study_japanese || ''}
                    onChange={(e) => setProfileFormData({ ...profileFormData, why_study_japanese: e.target.value })}
                    rows={3}
                    placeholder="Tell us why they want to study Japanese..."
                  />
                ) : (
                  <p className="text-sm py-2">{userProfile.why_study_japanese}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                {isProfileEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancelProfileEdit}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                      Close
                    </Button>
                    <Button onClick={() => setIsProfileEditing(true)}>
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
