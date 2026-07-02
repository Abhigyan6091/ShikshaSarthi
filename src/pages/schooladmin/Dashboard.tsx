import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from "@/components/ui/use-toast";
import { Users, GraduationCap, PlusCircle, School, Eye, MessageSquare, Key, Copy, Check, Activity, Cloud, Server, Wifi, RefreshCw, Trash2 } from 'lucide-react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

const SchoolAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    schoolId: ''
  });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [username, setUsername] = useState<string>('');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [awsStatus, setAwsStatus] = useState<any>(null);
  const [awsSyncStatus, setAwsSyncStatus] = useState<any>(null);
  const [connectivityBusy, setConnectivityBusy] = useState(false);

  // Reset password states
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleResetPassword = async (student: any) => {
    setSelectedStudent(student);
    setTempPassword('');
    setIsCopied(false);
    setResetDialogOpen(true);
  };

  const confirmReset = async () => {
    if (!selectedStudent) return;

    try {
      setIsResetting(true);
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      const response = await axios.post(`${API_URL}/api/auth/admin/reset-student-password`, {
        adminId: currentUser._id || currentUser.username,
        adminRole: 'SchoolAdmin',
        studentId: selectedStudent.studentId
      });

      setTempPassword(response.data.tempPassword);
      toast({
        title: "Success",
        description: "Temporary password generated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        const uname = user.username;
        setUsername(uname);
        fetchStats(uname);
        fetchTeachers(uname);
        fetchStudents(uname);
        fetchConnectivity();
      } catch (e) {
        console.error('Error parsing user', e);
      }
    }
  }, []);

  const fetchConnectivity = async () => {
    try {
      setConnectivityBusy(true);
      const [appStatusRes, awsStatusRes, awsSyncRes] = await Promise.allSettled([
        axios.get(`${API_URL}/app/status`),
        axios.get(`${API_URL}/api/aws/status`),
        axios.get(`${API_URL}/api/aws/sync/status`),
      ]);

      if (appStatusRes.status === 'fulfilled') setSystemStatus(appStatusRes.value.data);
      if (awsStatusRes.status === 'fulfilled') setAwsStatus(awsStatusRes.value.data);
      if (awsSyncRes.status === 'fulfilled') setAwsSyncStatus(awsSyncRes.value.data);
    } catch (error) {
      console.error('Error fetching connectivity:', error);
    } finally {
      setConnectivityBusy(false);
    }
  };

  const currentBrowserEndpoint = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}`
    : 'http://localhost:6050';
  const lanEndpoint = currentBrowserEndpoint || systemStatus?.network?.lanUrl || 'http://localhost:6050';

  const fetchStats = async (uname: string) => {
    try {
      const response = await axios.get(`${API_URL}/schooladmin/${uname}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTeachers = async (uname: string) => {
    try {
      const response = await axios.get(`${API_URL}/schooladmin/${uname}/teachers`);
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchStudents = async (uname: string) => {
    try {
      const response = await axios.get(`${API_URL}/schooladmin/${uname}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const refreshSchoolData = (uname = username) => {
    if (!uname) return;
    fetchStats(uname);
    fetchTeachers(uname);
    fetchStudents(uname);
  };

  const handleDeleteTeacher = async (teacher: any) => {
    if (!username) return;
    const label = teacher.name || teacher.teacherId;
    if (!window.confirm(`Delete teacher ${label}?`)) return;

    try {
      await axios.delete(`${API_URL}/schooladmin/${username}/teachers/${teacher.teacherId}`);
      toast({ title: "Teacher deleted", description: `${label} has been removed.` });
      refreshSchoolData();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error?.response?.data?.error || error?.response?.data?.message || "Could not delete teacher",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStudent = async (student: any) => {
    if (!username) return;
    const label = student.name || student.studentId;
    if (!window.confirm(`Delete student ${label}?`)) return;

    try {
      await axios.delete(`${API_URL}/schooladmin/${username}/students/${student.studentId}`);
      toast({ title: "Student deleted", description: `${label} has been removed.` });
      refreshSchoolData();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error?.response?.data?.error || error?.response?.data?.message || "Could not delete student",
        variant: "destructive",
      });
    }
  };

  const statsData = [
    {
      title: "Total Teachers",
      value: stats.teachers,
      icon: <GraduationCap className="h-8 w-8 text-edu-green" />,
      description: "In your school",
    },
    {
      title: "Total Students",
      value: stats.students,
      icon: <Users className="h-8 w-8 text-edu-blue" />,
      description: "Enrolled students",
    },
  ];

  // Filter students by class
  const availableClasses = [...new Set(students.map(s => s.class))].filter(Boolean).sort((a: any, b: any) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    return numA - numB;
  });

  const filteredStudents = selectedClass === 'all'
    ? students
    : students.filter(s => s.class === selectedClass);

  // Group students by class for display
  const studentsByClass = filteredStudents.reduce((acc: any, student) => {
    const className = student.class || 'Unassigned';
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(student);
    return acc;
  }, {});

  // Sort class names numerically
  const sortedClasses = Object.keys(studentsByClass).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return parseInt(a) - parseInt(b);
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-6 md:py-8 bg-gray-50">
        <div className="edu-container">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">School Admin Dashboard</h1>
            <p className="text-gray-600">School ID: {stats.schoolId}</p>
          </div>

          <Card className="mb-8 border-2 border-edu-blue/20 bg-white">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-edu-blue" />
                    Local Server Connectivity
                  </CardTitle>
                  <CardDescription>LAN access, local database, AWS updates, and sync-agent status</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={fetchConnectivity} disabled={connectivityBusy}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-lg border bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase text-gray-500 font-medium">
                    <Server className="h-4 w-4" />
                    Student LAN URL
                  </div>
                  <p className="mt-2 font-mono text-sm font-bold text-gray-900 break-all">{lanEndpoint}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Students use this same host and port from the local network.
                  </p>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase text-gray-500 font-medium">
                    <Activity className="h-4 w-4" />
                    Local Database
                  </div>
                  <p className={`mt-2 text-lg font-bold ${systemStatus?.database?.connected ? 'text-green-600' : 'text-amber-600'}`}>
                    {systemStatus?.database?.connected ? 'Connected' : 'Checking'}
                  </p>
                  <p className="text-xs text-gray-500">Local MongoDB keeps login and quizzes working offline.</p>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase text-gray-500 font-medium">
                    <Cloud className="h-4 w-4" />
                    AWS Control
                  </div>
                  <p className={`mt-2 text-lg font-bold ${awsStatus?.reachable ? 'text-green-600' : 'text-amber-600'}`}>
                    {awsStatus?.reachable ? 'Online' : 'Offline-ready'}
                  </p>
                  <p className="text-xs text-gray-500">Updates and sync resume whenever internet is available.</p>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase text-gray-500 font-medium">
                    <RefreshCw className="h-4 w-4" />
                    Sync Agent
                  </div>
                  <p className={`mt-2 text-lg font-bold ${awsSyncStatus?.enabled ? 'text-green-600' : 'text-amber-600'}`}>
                    {awsSyncStatus?.enabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last success: {awsSyncStatus?.lastSuccessAt ? new Date(awsSyncStatus.lastSuccessAt).toLocaleString() : 'Waiting'}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-md bg-blue-50 p-3">
                  School ID: <strong>{awsStatus?.schoolId || stats.schoolId || 'Not bound'}</strong>
                </div>
                <div className="rounded-md bg-blue-50 p-3">
                  Node ID: <strong>{awsStatus?.nodeId || awsSyncStatus?.nodeId || 'Not configured'}</strong>
                </div>
                <div className="rounded-md bg-blue-50 p-3">
                  Version: <strong>{systemStatus?.version || '1.0.0'}</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {statsData.map((stat, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
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
                    <CardDescription>Add teachers or students to your school</CardDescription>
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

            <Card className="border-2 border-green-500/20 hover:border-green-500/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">Feedback Management</CardTitle>
                    <CardDescription>Create and manage feedback forms</CardDescription>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <Link to="/schooladmin/feedback-management">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Manage Feedback</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Teachers List */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Teachers ({teachers.length})</CardTitle>
              <CardDescription>Teachers in your school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {teachers.length === 0 ? (
                  <p className="text-gray-500">No teachers found</p>
                ) : (
                  teachers.map((teacher) => (
                    <div
                      key={teacher.teacherId}
                      className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/schooladmin/teacher-profile/${teacher.teacherId || teacher._id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-edu-blue transition-colors">{teacher.name}</p>
                          <p className="text-sm text-gray-600">
                            ID: {teacher.teacherId}
                            <span className="hidden sm:inline"> | </span>
                            <span className="block sm:inline">Phone: {teacher.phone || 'N/A'}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTeacher(teacher);
                            }}
                            title="Delete Teacher"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Eye className="h-5 w-5 text-gray-400 group-hover:text-edu-blue transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Students by Class */}
          <Card>
            <CardHeader>
              <CardTitle>Students by Class</CardTitle>
              <CardDescription>View students organized by class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Class Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Filter by Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes ({students.length} students)</SelectItem>
                      {availableClasses.map((className) => (
                        <SelectItem key={className} value={className}>
                          Class {className} ({students.filter(s => s.class === className).length} students)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Students List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sortedClasses.length === 0 ? (
                    <p className="text-gray-500">No students found</p>
                  ) : (
                    sortedClasses.map((className) => (
                      <div key={className} className="space-y-2">
                        {/* Class Header */}
                        <div className="flex items-center gap-2 py-2 border-b border-gray-200">
                          <GraduationCap className="h-5 w-5 text-edu-blue" />
                          <h3 className="font-semibold text-gray-900">
                            Class {className}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ({studentsByClass[className].length} students)
                          </span>
                        </div>

                        {/* Students in this class */}
                        {studentsByClass[className].map((student: any) => (
                          <div
                            key={student.studentId}
                            className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors group sm:ml-7"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 cursor-pointer" onClick={() => navigate(`/student/profile/${student.studentId}`)}>
                                <p className="font-medium text-gray-900 group-hover:text-edu-blue transition-colors">
                                  {student.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ID: {student.studentId}
                                  <span className="hidden sm:inline"> | </span>
                                  <span className="block sm:inline">Phone: {student.phone || 'N/A'}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResetPassword(student);
                                  }}
                                  title="Reset Password"
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteStudent(student);
                                  }}
                                  title="Delete Student"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Eye
                                  className="h-5 w-5 text-gray-400 cursor-pointer hover:text-edu-blue transition-colors"
                                  onClick={() => navigate(`/student/profile/${student.studentId}`)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Student Password</DialogTitle>
            <DialogDescription>
              Generate a temporary password for <strong>{selectedStudent?.name}</strong> (ID: {selectedStudent?.studentId}).
            </DialogDescription>
          </DialogHeader>

          {tempPassword ? (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800 font-medium mb-1">Temporary Password:</p>
                <div className="flex items-center justify-between bg-white border border-amber-300 p-2 rounded text-lg font-mono tracking-wider">
                  <span>{tempPassword}</span>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    {isCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  Please share this password with the student. They will be required to change it upon their next login.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
              <Key className="h-12 w-12 text-amber-500 opacity-20" />
              <p className="text-sm text-gray-600">
                Are you sure you want to reset the password for this student?
              </p>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setResetDialogOpen(false)}
            >
              Close
            </Button>
            {!tempPassword && (
              <Button
                type="button"
                className="bg-amber-600 hover:bg-amber-700"
                onClick={confirmReset}
                disabled={isResetting}
              >
                {isResetting ? "Generating..." : "Generate Password"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SchoolAdminDashboard;
