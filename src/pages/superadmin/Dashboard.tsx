import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { School, Users, GraduationCap, UserCog, PlusCircle, User, Phone, IdCard, Building, BookOpen, Key, Copy, Check, ArrowLeft, Mail, Shield, UserCheck } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    schools: 0,
    teachers: 0,
    students: 0,
    schoolAdmins: 0
  });
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [schoolAdmin, setSchoolAdmin] = useState<any>(null);
  const [schoolTeachers, setSchoolTeachers] = useState<any[]>([]);
  const [schoolStudents, setSchoolStudents] = useState<any[]>([]);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [resetTarget, setResetTarget] = useState<{ type: string; data: any } | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchSchools();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/superadmin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${API_URL}/superadmin/schools`);
      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const handleSchoolClick = async (school: any) => {
    setSelectedSchool(school);
    setExpandedSection(null);
    setSchoolAdmin(null);
    setSchoolTeachers([]);
    setSchoolStudents([]);

    try {
      const [adminsRes, teachersRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/superadmin/schools/${school.schoolId}/admins`),
        axios.get(`${API_URL}/superadmin/schools/${school.schoolId}/teachers`),
        axios.get(`${API_URL}/superadmin/schools/${school.schoolId}/students`)
      ]);
      setSchoolAdmin(adminsRes.data[0] || null);
      setSchoolTeachers(teachersRes.data);
      setSchoolStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching school data:', error);
    }
  };

  const handleBack = () => {
    setSelectedSchool(null);
    setSchoolAdmin(null);
    setSchoolTeachers([]);
    setSchoolStudents([]);
    setExpandedSection(null);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleResetPassword = async () => {
    if (!resetTarget || !newPassword) return;

    try {
      setIsResetting(true);
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const adminId = currentUser._id || currentUser.username;

      let endpoint = '';
      let payload: any = { adminId, adminRole: 'SuperAdmin', newPassword };

      if (resetTarget.type === 'admin') {
        endpoint = `${API_URL}/api/auth/admin/reset-schooladmin-password`;
        payload.username = resetTarget.data.username;
      } else if (resetTarget.type === 'teacher') {
        endpoint = `${API_URL}/api/auth/admin/reset-teacher-password`;
        payload.teacherId = resetTarget.data.teacherId;
      } else if (resetTarget.type === 'student') {
        endpoint = `${API_URL}/api/auth/admin/reset-student-password`;
        payload.studentId = resetTarget.data.studentId;
      }

      const response = await axios.post(endpoint, payload);
      setTempPassword(response.data.tempPassword);
      toast({
        title: "Success",
        description: `Password for ${resetTarget.data.name} has been set to "${newPassword}".`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to set password",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const openResetDialog = (type: string, data: any) => {
    setResetTarget({ type, data });
    setNewPassword('');
    setTempPassword('');
    setResetDialogOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const statsData = [
    {
      title: "Total Schools",
      value: stats.schools,
      icon: <School className="h-8 w-8 text-edu-blue" />,
      description: "Registered schools",
      color: "border-l-4 border-edu-blue",
    },
    {
      title: "School Admins",
      value: stats.schoolAdmins,
      icon: <UserCog className="h-8 w-8 text-edu-purple" />,
      description: "School administrators",
      color: "border-l-4 border-edu-purple",
    },
    {
      title: "Total Teachers",
      value: stats.teachers,
      icon: <GraduationCap className="h-8 w-8 text-edu-green" />,
      description: "Across all schools",
      color: "border-l-4 border-edu-green",
    },
    {
      title: "Total Students",
      value: stats.students,
      icon: <Users className="h-8 w-8 text-edu-yellow" />,
      description: "Enrolled students",
      color: "border-l-4 border-edu-yellow",
    },
  ];

  const renderSchoolGrid = () => (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">All Schools</CardTitle>
          <CardDescription>Click on a school to view its admin, teachers, and students</CardDescription>
        </CardHeader>
        <CardContent>
          {schools.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <School className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No schools registered yet</p>
              <p className="text-sm mt-1">Go to Register page to add a new school</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {schools.map((school) => (
                <div
                  key={school.schoolId}
                  className="p-5 border rounded-xl hover:shadow-lg transition-all cursor-pointer bg-white hover:border-edu-blue/40 hover:-translate-y-0.5 group"
                  onClick={() => handleSchoolClick(school)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-edu-blue/10 p-2.5 rounded-lg group-hover:bg-edu-blue/20 transition-colors">
                      <Building className="h-6 w-6 text-edu-blue" />
                    </div>
                    <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      {school.schoolId}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">{school.schoolName}</h3>
                  <p className="text-sm text-gray-500 mb-4">{school.location}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 border-t pt-3">
                    <span className="flex items-center gap-1"><UserCog className="h-3.5 w-3.5 text-purple-500" /> 1 admin</span>
                    <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5 text-green-500" /> {stats.teachers > 0 ? '...' : '0'} teachers</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-yellow-500" /> {stats.students > 0 ? '...' : '0'} students</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  const renderSchoolDetail = () => {
    if (!selectedSchool) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="sm" onClick={handleBack} className="hover:bg-gray-200">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to All Schools
          </Button>
        </div>

        {/* School Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="bg-edu-blue p-3 rounded-xl">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{selectedSchool.schoolName}</h2>
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><IdCard className="h-3.5 w-3.5" /> {selectedSchool.schoolId}</span>
                  <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" /> {selectedSchool.location}</span>
                </div>
              </div>
              <div className="flex gap-3 text-center">
                <div className="bg-white/80 px-4 py-2 rounded-lg">
                  <p className="text-lg font-bold text-purple-600">{schoolAdmin ? 1 : 0}</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
                <div className="bg-white/80 px-4 py-2 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{schoolTeachers.length}</p>
                  <p className="text-xs text-gray-500">Teachers</p>
                </div>
                <div className="bg-white/80 px-4 py-2 rounded-lg">
                  <p className="text-lg font-bold text-yellow-600">{schoolStudents.length}</p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* School Admin Section */}
        <Card className="border-purple-200">
          <CardHeader
            className="cursor-pointer hover:bg-purple-50/50 transition-colors"
            onClick={() => toggleSection('admin')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">School Admin</CardTitle>
                {schoolAdmin && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    {schoolAdmin.username}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                {expandedSection === 'admin' ? '▲' : '▼'}
              </div>
            </div>
          </CardHeader>
          {expandedSection === 'admin' && (
            <CardContent>
              {!schoolAdmin ? (
                <div className="text-center py-6 text-gray-500">
                  <UserCog className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No admin assigned to this school</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <User className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Name</span>
                      </div>
                      <p className="font-semibold text-gray-900">{schoolAdmin.name}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Username</span>
                      </div>
                      <p className="font-semibold text-gray-900">{schoolAdmin.username}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <Mail className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Email</span>
                      </div>
                      <p className="font-semibold text-gray-900">{schoolAdmin.email || <span className="text-gray-400 italic">Not provided</span>}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <Phone className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Phone</span>
                      </div>
                      <p className="font-semibold text-gray-900">{schoolAdmin.phone || <span className="text-gray-400 italic">Not provided</span>}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <Building className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">School ID</span>
                      </div>
                      <p className="font-semibold text-gray-900">{schoolAdmin.schoolId}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <Key className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Password</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500 italic">(hashed - cannot retrieve)</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs h-7"
                          onClick={() => openResetDialog('admin', schoolAdmin)}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Teachers Section */}
        <Card className="border-green-200">
          <CardHeader
            className="cursor-pointer hover:bg-green-50/50 transition-colors"
            onClick={() => toggleSection('teachers')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Teachers ({schoolTeachers.length})</CardTitle>
              </div>
              <div className="text-sm text-gray-400">
                {expandedSection === 'teachers' ? '▲' : '▼'}
              </div>
            </div>
          </CardHeader>
          {expandedSection === 'teachers' && (
            <CardContent>
              {schoolTeachers.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No teachers in this school</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-3 font-medium text-gray-600">Name</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-600">Teacher ID</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-600">Email</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-600">Phone</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-600">Classes</th>
                        <th className="text-center py-3 px-3 font-medium text-gray-600">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schoolTeachers.map((teacher) => (
                        <tr key={teacher.teacherId} className="border-b border-gray-100 hover:bg-green-50/50 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-medium text-gray-900">{teacher.name}</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 font-mono text-xs">{teacher.teacherId}</td>
                          <td className="py-3 px-3 text-gray-600">
                            {teacher.email || <span className="text-gray-300 italic">N/A</span>}
                          </td>
                          <td className="py-3 px-3 text-gray-600">
                            {teacher.phone || <span className="text-gray-300 italic">N/A</span>}
                          </td>
                          <td className="py-3 px-3 text-gray-600">
                            {teacher.classes && teacher.classes.length > 0
                              ? teacher.classes.join(', ')
                              : <span className="text-gray-300 italic">None</span>}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                              onClick={() => openResetDialog('teacher', teacher)}
                            >
                              <Key className="h-3.5 w-3.5 mr-1" /> Reset
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Students Section */}
        <Card className="border-yellow-200">
          <CardHeader
            className="cursor-pointer hover:bg-yellow-50/50 transition-colors"
            onClick={() => toggleSection('students')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-lg">Students ({schoolStudents.length})</CardTitle>
              </div>
              <div className="text-sm text-gray-400">
                {expandedSection === 'students' ? '▲' : '▼'}
              </div>
            </div>
          </CardHeader>
          {expandedSection === 'students' && (
            <CardContent>
              {schoolStudents.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No students in this school</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-3 font-medium text-gray-600">Name</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-600">Student ID</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-600">Email</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-600">Phone</th>
                        <th className="text-left py-3 px-3 font-medium text-gray-600">Class</th>
                        <th className="text-center py-3 px-3 font-medium text-gray-600">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schoolStudents.map((student) => (
                        <tr key={student.studentId} className="border-b border-gray-100 hover:bg-yellow-50/50 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-medium text-gray-900">{student.name}</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 font-mono text-xs">{student.studentId}</td>
                          <td className="py-3 px-3 text-gray-600">
                            {student.email || <span className="text-gray-300 italic">N/A</span>}
                          </td>
                          <td className="py-3 px-3 text-gray-600">
                            {student.phone || <span className="text-gray-300 italic">N/A</span>}
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">
                              Class {student.class}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                              onClick={() => openResetDialog('student', student)}
                            >
                              <Key className="h-3.5 w-3.5 mr-1" /> Reset
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-6 md:py-8 bg-gray-50">
        <div className="edu-container">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600">Manage all schools, admins, teachers, and students</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statsData.map((stat, i) => (
              <Card key={i} className={`hover:shadow-md transition-shadow ${stat.color}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{stat.title}</CardTitle>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="border-2 border-edu-blue/20 hover:border-edu-blue/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">Register New Users</CardTitle>
                    <CardDescription>Add schools (with admin), admins, teachers, or students</CardDescription>
                  </div>
                  <PlusCircle className="h-8 w-8 text-edu-blue" />
                </div>
              </CardHeader>
              <CardContent>
                <Link to="/register">
                  <Button className="w-full">Register</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-edu-purple/20 hover:border-edu-purple/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">Upload Questions</CardTitle>
                    <CardDescription>Manage question bank for all schools</CardDescription>
                  </div>
                  <School className="h-8 w-8 text-edu-purple" />
                </div>
              </CardHeader>
              <CardContent>
                <Link to="/uploadquestion">
                  <Button variant="outline" className="w-full border-edu-purple text-edu-purple hover:bg-edu-purple/10">
                    Upload Questions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Schools - either grid or detail view */}
          {selectedSchool ? renderSchoolDetail() : renderSchoolGrid()}
        </div>
      </main>

      {/* Set Password Dialog - works for admin, teacher, and student */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Password</DialogTitle>
            <DialogDescription>
              Enter a new password for{' '}
              <strong>
                {resetTarget?.type === 'admin' && resetTarget?.data?.name}
                {resetTarget?.type === 'teacher' && resetTarget?.data?.name}
                {resetTarget?.type === 'student' && resetTarget?.data?.name}
              </strong>
              {' '}({resetTarget?.type === 'admin' && `Username: ${resetTarget?.data?.username}`}
              {resetTarget?.type === 'teacher' && `ID: ${resetTarget?.data?.teacherId}`}
              {resetTarget?.type === 'student' && `ID: ${resetTarget?.data?.studentId}`}).
            </DialogDescription>
          </DialogHeader>

          {tempPassword ? (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800 font-medium mb-1">Password Updated Successfully</p>
                <p className="text-sm text-green-700">
                  The password for <strong>{resetTarget?.data?.name}</strong> has been set to:
                </p>
                <div className="flex items-center justify-between bg-white border border-green-300 p-2 rounded mt-2 text-lg font-mono tracking-wider">
                  <span>{tempPassword}</span>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="text"
                  placeholder="Enter the new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500">The admin will be able to use this password to log in.</p>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setResetDialogOpen(false);
                setNewPassword('');
                setTempPassword('');
              }}
            >
              {tempPassword ? 'Close' : 'Cancel'}
            </Button>
            {!tempPassword && (
              <Button
                type="button"
                className="bg-amber-600 hover:bg-amber-700"
                onClick={handleResetPassword}
                disabled={isResetting || !newPassword}
              >
                {isResetting ? "Setting..." : "Set Password"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
