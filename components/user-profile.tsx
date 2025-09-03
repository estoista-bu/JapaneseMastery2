'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X, User } from 'lucide-react';
import { apiService, UserProfile, UpdateProfileRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UserProfileProps {
  currentUser: any;
}

export function UserProfileComponent({ currentUser }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileRequest>({});
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfile();
      setProfile(response.profile);
      setFormData({
        first_name: response.profile.first_name,
        last_name: response.profile.last_name,
        age: response.profile.age,
        date_of_birth: response.profile.date_of_birth,
        jlpt_level: response.profile.jlpt_level,
        why_study_japanese: response.profile.why_study_japanese,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await apiService.updateProfile(formData);
      setProfile(response.profile);
      setEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      age: profile?.age || 0,
      date_of_birth: profile?.date_of_birth || '',
      jlpt_level: profile?.jlpt_level || 'None',
      why_study_japanese: profile?.why_study_japanese || '',
    });
    setEditing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await apiService.uploadProfilePicture(file);
      setProfile(response.profile);
      toast({
        title: 'Success',
        description: 'Profile picture uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload profile picture',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    try {
      const response = await apiService.deleteProfilePicture();
      setProfile(response.profile);
      toast({
        title: 'Success',
        description: 'Profile picture deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete profile picture',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading profile...</div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Profile not found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.profile_picture || undefined} alt={`${profile.first_name} ${profile.last_name}`} />
              <AvatarFallback className="text-lg">
                {profile.first_name?.[0]?.toUpperCase()}{profile.last_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!editing && (
              <div className="absolute -bottom-2 -right-2">
                <label htmlFor="profile-picture" className="cursor-pointer">
                  <div className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                  </div>
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{profile.first_name} {profile.last_name}</h3>
            <p className="text-muted-foreground">{profile.email}</p>
            {profile.profile_picture && !editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeletePicture}
                className="mt-2"
              >
                <X className="h-4 w-4 mr-1" />
                Remove Picture
              </Button>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            {editing ? (
              <Input
                id="first_name"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            ) : (
              <p className="text-sm py-2">{profile.first_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="last_name">Last Name</Label>
            {editing ? (
              <Input
                id="last_name"
                value={formData.last_name || ''}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            ) : (
              <p className="text-sm py-2">{profile.last_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="age">Age</Label>
            {editing ? (
              <Input
                id="age"
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                min="13"
                max="120"
              />
            ) : (
              <p className="text-sm py-2">{profile.age}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            {editing ? (
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            ) : (
              <p className="text-sm py-2">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
            )}
          </div>

          <div>
            <Label htmlFor="jlpt_level">JLPT Level</Label>
            {editing ? (
              <Select
                value={formData.jlpt_level || 'None'}
                onValueChange={(value) => setFormData({ ...formData, jlpt_level: value as any })}
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
              <p className="text-sm py-2">{profile.jlpt_level}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="why_study_japanese">Why do you want to study Japanese?</Label>
          {editing ? (
            <Textarea
              id="why_study_japanese"
              value={formData.why_study_japanese || ''}
              onChange={(e) => setFormData({ ...formData, why_study_japanese: e.target.value })}
              rows={3}
              placeholder="Tell us why you want to study Japanese..."
            />
          ) : (
            <p className="text-sm py-2">{profile.why_study_japanese}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
