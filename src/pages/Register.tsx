import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [currentUserSchoolId, setCurrentUserSchoolId] = useState<string>('');
  const [currentUserSchoolName, setCurrentUserSchoolName] = useState<string>('');
  const [roleToRegister, setRoleToRegister] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSchoolName, setIsLoadingSchoolName] = useState(false);

  useEffect(() => {
    // Get current user role
    const role = localStorage.getItem('userRole');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!role) {
      toast({
        title: "Access Denied",
        description: "Please login first",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (role === 'student') {
      toast({
        title: "Access Denied",
        description: "Students cannot register other users",
        variant: "destructive",
      });
      navigate('/student');
      return;
    }

    setCurrentUserRole(role);

    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        
        // For teachers, also check the cookie as a fallback
        if (role === 'teacher') {
          const teacherCookie = Cookies.get('teacher');
          let teacherData = user;
          
          if (teacherCookie) {
            try {
              const cookieData = JSON.parse(teacherCookie);
              teacherData = cookieData.teacher || user;
            } catch (e) {
              console.error('Error parsing teacher cookie', e);
            }
          }
          
          console.log('Teacher data:', teacherData); // Debug log
          
          // Store the actual teacherId or _id for API calls
          const username = teacherData.teacherId || teacherData._id || teacherData.username || '';
          const schoolId = teacherData.schoolId || '';
          
          console.log('Setting teacher username:', username, 'schoolId:', schoolId); // Debug log
          
          setCurrentUsername(username);
          setCurrentUserSchoolId(schoolId);
          setRoleToRegister('student');
          
          if (schoolId) {
            console.log('Fetching school name for:', schoolId); // Debug log
            fetchSchoolName(schoolId);
          } else {
            console.warn('No schoolId found for teacher'); // Debug log
          }
        } else {
          // For non-teachers
          let resolvedUsername = '';
          if (role === 'schooladmin' || role === 'superadmin') {
            resolvedUsername = user.username || user._id || '';
          } else {
            resolvedUsername = user.teacherId || user._id || user.username || '';
          }

          setCurrentUsername(resolvedUsername);
          setCurrentUserSchoolId(user.schoolId || '');
          
          if (role === 'schooladmin') {
            if (user.schoolId) {
              fetchSchoolName(user.schoolId);
            }
          }
        }
      } catch (e) {
        console.error('Error parsing user', e);
      }
    }

    // Fetch schools for superadmin
    if (role === 'superadmin') {
      fetchSchools();
    }
  }, [navigate]);

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${API_URL}/superadmin/schools`);
      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const fetchSchoolName = async (schoolId: string) => {
    try {
      setIsLoadingSchoolName(true);
      console.log('Fetching school for ID:', schoolId); // Debug log
      const response = await axios.get(`${API_URL}/schools/by-school-id/${schoolId}`);
      console.log('School response:', response.data); // Debug log
      const schoolName = response.data.schoolName || schoolId;
      setCurrentUserSchoolName(schoolName);
      console.log('School name set to:', schoolName); // Debug log
    } catch (error) {
      console.error('Error fetching school name:', error);
      setCurrentUserSchoolName(schoolId); // Fallback to ID if fetch fails
    } finally {
      setIsLoadingSchoolName(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let endpoint = '';
      let payload: any = { ...formData };

      // Add creator info and schoolId based on current user role
      if (currentUserRole === 'teacher') {
        payload.teacherId = currentUsername;
        payload.schoolId = currentUserSchoolId; // Auto-assign teacher's school
        endpoint = `${API_URL}/teachers/register/student`;
      } else if (currentUserRole === 'schooladmin') {
        payload.adminUsername = currentUsername;
        payload.schoolId = currentUserSchoolId; // Auto-assign school admin's school
        if (roleToRegister === 'teacher') {
          endpoint = `${API_URL}/schooladmin/register/teacher`;
        } else if (roleToRegister === 'student') {
          endpoint = `${API_URL}/schooladmin/register/student`;
        }
      } else if (currentUserRole === 'superadmin') {
        if (roleToRegister === 'school') {
          endpoint = `${API_URL}/superadmin/register/school`;
        } else if (roleToRegister === 'schooladmin') {
          endpoint = `${API_URL}/superadmin/register/schooladmin`;
        } else if (roleToRegister === 'teacher') {
          endpoint = `${API_URL}/superadmin/register/teacher`;
        } else if (roleToRegister === 'student') {
          endpoint = `${API_URL}/superadmin/register/student`;
        }
      }

      const response = await axios.post(endpoint, payload);

      toast({
        title: "Success",
        description: roleToRegister === 'school'
          ? 'School and its admin registered successfully'
          : `${roleToRegister} registered successfully`,
      });

      // Reset form
      setFormData({});
      setRoleToRegister('');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.error || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFields = () => {
    if (!roleToRegister) return null;

    switch (roleToRegister) {
      case 'school':
        return (
          <>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700 font-medium">Register a new school with its admin. Each school can have only one admin.</p>
            </div>

            <h3 className="font-semibold text-md text-gray-800 border-b pb-1 mb-3">School Details</h3>

            <div className="space-y-2">
              <Label htmlFor="schoolId">School ID</Label>
              <Input
                id="schoolId"
                type="text"
                placeholder="Enter school ID"
                value={formData.schoolId || ''}
                onChange={(e) => handleInputChange('schoolId', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                type="text"
                placeholder="Enter school name"
                value={formData.schoolName || ''}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="Enter location"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </div>

            <div className="my-4 border-t border-gray-200" />

            <h3 className="font-semibold text-md text-gray-800 border-b pb-1 mb-3">School Admin Details</h3>

            <div className="space-y-2">
              <Label htmlFor="adminName">Admin Name</Label>
              <Input
                id="adminName"
                type="text"
                placeholder="Enter admin name"
                value={formData.adminName || ''}
                onChange={(e) => handleInputChange('adminName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminUsername">Admin Username</Label>
              <Input
                id="adminUsername"
                type="text"
                placeholder="Enter admin username"
                value={formData.adminUsername || ''}
                onChange={(e) => handleInputChange('adminUsername', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Admin Password</Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Enter admin password"
                value={formData.adminPassword || ''}
                onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPhone">Admin Phone</Label>
              <Input
                id="adminPhone"
                type="tel"
                placeholder="Enter admin phone number"
                value={formData.adminPhone || ''}
                onChange={(e) => handleInputChange('adminPhone', e.target.value)}
              />
            </div>
          </>
        );

      case 'schooladmin':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={formData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            
            {/* School selection - only for superadmin */}
            {currentUserRole === 'superadmin' && (
              <div className="space-y-2">
                <Label htmlFor="schoolId">School</Label>
                <Select
                  value={formData.schoolId || ''}
                  onValueChange={(value) => handleInputChange('schoolId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.schoolId} value={school.schoolId}>
                        {school.schoolName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        );

      case 'teacher':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacherId">Teacher ID</Label>
              <Input
                id="teacherId"
                type="text"
                placeholder="Enter teacher ID"
                value={formData.teacherId || ''}
                onChange={(e) => handleInputChange('teacherId', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            
            {/* School selection for all users registering teachers */}
            <div className="space-y-2">
              <Label htmlFor="schoolId">School</Label>
              {currentUserRole === 'superadmin' ? (
                <Select
                  value={formData.schoolId || ''}
                  onValueChange={(value) => handleInputChange('schoolId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.schoolId} value={school.schoolId}>
                        {school.schoolName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="schoolId"
                  type="text"
                  value={currentUserSchoolName || currentUserSchoolId}
                  disabled
                  className="bg-gray-100"
                />
              )}
            </div>
          </>
        );

      case 'student':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                type="text"
                placeholder="Enter student ID"
                value={formData.studentId || ''}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select
                value={formData.class || ''}
                onValueChange={(value) => handleInputChange('class', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Class {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* School selection for all users registering students */}
            <div className="space-y-2">
              <Label htmlFor="schoolId">School</Label>
              {currentUserRole === 'superadmin' ? (
                <Select
                  value={formData.schoolId || ''}
                  onValueChange={(value) => handleInputChange('schoolId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.schoolId} value={school.schoolId}>
                        {school.schoolName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="schoolId"
                  type="text"
                  value={isLoadingSchoolName ? 'Loading school...' : (currentUserSchoolName || currentUserSchoolId || 'School not found')}
                  disabled
                  className="bg-gray-100"
                  placeholder={isLoadingSchoolName ? 'Loading...' : 'Your school'}
                />
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getRoleOptions = () => {
    if (currentUserRole === 'superadmin') {
      return ['school', 'schooladmin', 'teacher', 'student'];
    } else if (currentUserRole === 'schooladmin') {
      return ['teacher', 'student'];
    } else if (currentUserRole === 'teacher') {
      return ['student'];
    }
    return [];
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Register New User</CardTitle>
            <CardDescription className="text-center">
              As a {currentUserRole}, you can register: {getRoleOptions().join(', ')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roleToRegister">Role to Register</Label>
                <Select value={roleToRegister} onValueChange={setRoleToRegister}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {getRoleOptions().map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderFields()}

              {roleToRegister && (
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Registering...' : `Register ${roleToRegister}`}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
