import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Building, Camera, Loader2, Save, User } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const getPhotoUrl = (photo: string) => {
  if (!photo) return '';
  if (photo.startsWith('data:') || photo.startsWith('http')) return photo;
  return `${API_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error || data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const SettingsFixed: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole') || '';
    const currentUser = localStorage.getItem('currentUser');
    if (!userRole || !currentUser) {
      navigate('/login');
      return;
    }

    try {
      const parsed = JSON.parse(currentUser);
      setRole(userRole);
      setName(parsed.name || '');
      setSchoolId(parsed.schoolId || parsed.instituteId || '');
      setProfilePhoto(parsed.profilePhoto || '');
      setPhotoPreview(parsed.profilePhoto || '');

      if (userRole === 'student') setUserId(parsed.studentId || parsed._id || '');
      else if (userRole === 'teacher') setUserId(parsed.teacherId || parsed._id || '');
      else if (userRole === 'schooladmin') setUserId(parsed.username || parsed._id || '');
      else setUserId(parsed.id || parsed._id || '');
    } catch {
      navigate('/login');
      return;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum size is 5MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!role || !userId) return;

    const payload: Record<string, string> = {};
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (name.trim() && name.trim() !== currentUser.name) payload.name = name.trim();
    if (photoPreview !== profilePhoto) payload.profilePhoto = photoPreview;

    if (Object.keys(payload).length === 0) {
      toast({ title: 'No changes', description: 'No changes to save' });
      return;
    }

    let endpoint = '';
    if (role === 'student') endpoint = `${API_URL}/students/${userId}/profile`;
    if (role === 'teacher') endpoint = `${API_URL}/teachers/${userId}/profile`;
    if (role === 'schooladmin') endpoint = `${API_URL}/schooladmin/${userId}/profile`;
    if (!endpoint) {
      toast({ title: 'Error', description: 'Settings are not available for this role', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const response = await axios.patch(endpoint, payload);
      const updatedUser = response.data;
      setProfilePhoto(updatedUser.profilePhoto || '');
      setPhotoPreview(updatedUser.profilePhoto || '');

      const merged = {
        ...currentUser,
        name: updatedUser.name || currentUser.name,
        profilePhoto: updatedUser.profilePhoto || currentUser.profilePhoto,
      };
      localStorage.setItem('currentUser', JSON.stringify(merged));

      window.dispatchEvent(new CustomEvent('userDataChanged'));
      toast({ title: 'Profile updated', description: 'Your changes have been saved successfully' });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to save changes'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-edu-blue" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-6 md:py-8">
        <div className="edu-container mx-auto max-w-2xl px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Settings</CardTitle>
              <CardDescription>Update your name and profile photo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 ring-4 ring-edu-blue/20">
                  {photoPreview ? <AvatarImage src={getPhotoUrl(photoPreview)} alt="Profile" /> : null}
                  <AvatarFallback className="bg-edu-blue text-3xl text-white">
                    {name ? name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="mr-2 h-4 w-4" /> Change Photo
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setPhotoPreview('')}>
                    Remove
                  </Button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input id="name" value={name} onChange={(event) => setName(event.target.value)} className="pl-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolId">School ID</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input id="schoolId" value={schoolId} disabled className="bg-gray-50 pl-10" />
                </div>
                <p className="text-xs text-muted-foreground">School ID is assigned by admins and cannot be changed here.</p>
              </div>

              <div className="space-y-2">
                <Label>{role === 'student' ? 'Student ID' : role === 'teacher' ? 'Teacher ID' : 'Username'}</Label>
                <Input value={userId} disabled className="bg-gray-50" />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsFixed;
