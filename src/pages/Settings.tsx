import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { User, Building, Camera, Save, ArrowLeft, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const getPhotoUrl = (photo: string) => {
  if (!photo) return '';
  if (photo.startsWith('data:') || photo.startsWith('http')) return photo;
  return `${API_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
};

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [name, setName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const currentUser = localStorage.getItem('currentUser');

    if (!userRole || !currentUser) {
      navigate('/login');
      return;
    }

    setRole(userRole);

    try {
      const parsed = JSON.parse(currentUser);
      setName(parsed.name || '');
      setSchoolId(parsed.schoolId || parsed.instituteId || '');
      let identifier = '';
      if (userRole === 'student') identifier = parsed.studentId || parsed._id || '';
      else if (userRole === 'teacher') identifier = parsed.teacherId || parsed._id || '';
      else if (userRole === 'schooladmin') identifier = parsed.username || parsed._id || '';
      else identifier = parsed.id || parsed._id || '';
      setUserId(identifier);
      setProfilePhoto(parsed.profilePhoto || '');
      setPhotoPreview(parsed.profilePhoto || '');
      setLoading(false);
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!role || !userId) return;

    setSaving(true);
    try {
      let endpoint = '';
      const payload: Record<string, string> = {};

      if (name.trim() && name.trim() !== JSON.parse(localStorage.getItem('currentUser') || '{}').name) payload.name = name.trim();
      if (schoolId.trim() && schoolId.trim() !== JSON.parse(localStorage.getItem('currentUser') || '{}').schoolId) payload.schoolId = schoolId.trim();
      if (photoPreview && photoPreview !== profilePhoto) {
        payload.profilePhoto = photoPreview;
      }

      if (Object.keys(payload).length === 0) {
        toast({ title: 'No changes', description: 'No changes to save' });
        setSaving(false);
        return;
      }

      if (role === 'student') {
        endpoint = `${API_URL}/students/${userId}/profile`;
      } else if (role === 'teacher') {
        endpoint = `${API_URL}/teachers/${userId}/profile`;
      } else if (role === 'schooladmin') {
        endpoint = `${API_URL}/schooladmin/${userId}/profile`;
      } else {
        toast({ title: 'Error', description: 'Settings not available for this role', variant: 'destructive' });
        setSaving(false);
        return;
      }

      const response = await axios.patch(endpoint, payload);

      const updatedUser = response.data;

      setProfilePhoto(updatedUser.profilePhoto || '');
      setPhotoPreview(updatedUser.profilePhoto || '');

      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        parsed.name = updatedUser.name || parsed.name;
        parsed.schoolId = updatedUser.schoolId || parsed.schoolId;
        if (updatedUser.profilePhoto) parsed.profilePhoto = updatedUser.profilePhoto;
        localStorage.setItem('currentUser', JSON.stringify(parsed));
      }

      if (role === 'student') {
        const studentData = localStorage.getItem('student');
        if (studentData) {
          const parsed = JSON.parse(studentData);
          if (parsed.student) {
            parsed.student.name = updatedUser.name || parsed.student.name;
            parsed.student.schoolId = updatedUser.schoolId || parsed.student.schoolId;
            if (updatedUser.profilePhoto) parsed.student.profilePhoto = updatedUser.profilePhoto;
          }
          localStorage.setItem('student', JSON.stringify(parsed));
        }
      }

      window.dispatchEvent(new CustomEvent('userDataChanged'));
      toast({ title: 'Profile updated', description: 'Your changes have been saved successfully' });
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save changes';
      console.error('Settings save error:', err);
      toast({
        title: 'Error',
        description: serverMsg,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-edu-blue" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="flex-1 py-6 md:py-8">
        <div className="edu-container max-w-2xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Settings</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 ring-4 ring-edu-blue/20">
                  {photoPreview ? (
                    <AvatarImage src={getPhotoUrl(photoPreview)} alt="Profile" />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-edu-blue to-edu-purple text-white text-3xl">
                    {name ? name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="h-4 w-4 mr-2" /> Change Photo
                  </Button>
                  {photoPreview && (
                    <Button variant="ghost" size="sm" onClick={() => { setPhotoPreview(''); setProfilePhoto(''); }}>
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              {/* School ID */}
              <div className="space-y-2">
                <Label htmlFor="schoolId">School ID</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="schoolId"
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your school ID"
                  />
                </div>
              </div>

              {/* User ID (read-only) */}
              <div className="space-y-2">
                <Label>{role === 'student' ? 'Student ID' : role === 'teacher' ? 'Teacher ID' : 'Username'}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input value={userId} disabled className="pl-10 bg-gray-50" />
                </div>
                <p className="text-xs text-muted-foreground">This field cannot be changed</p>
              </div>

              {/* Role (read-only) */}
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={role || ''} disabled className="bg-gray-50 capitalize" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
