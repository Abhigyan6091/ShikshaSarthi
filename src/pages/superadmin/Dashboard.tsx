import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Eye } from 'lucide-react';
import { School, Users, GraduationCap, UserCog, PlusCircle, User, Phone, IdCard, Building, Calendar, BookOpen, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    schools: 0,
    teachers: 0,
    students: 0,
    schoolAdmins: 0
  });
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [schoolTeachers, setSchoolTeachers] = useState<any[]>([]);
  const [schoolStudents, setSchoolStudents] = useState<any[]>([]);
  const [schoolAdmins, setSchoolAdmins] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

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

  const handleSchoolSelect = async (schoolId: string) => {
    setSelectedSchool(schoolId);
    setSelectedClass('all'); // Reset class filter when school changes
    try {
      const [teachersRes, studentsRes, adminsRes] = await Promise.all([
        axios.get(`${API_URL}/superadmin/schools/${schoolId}/teachers`),
        axios.get(`${API_URL}/superadmin/schools/${schoolId}/students`),
        axios.get(`${API_URL}/superadmin/schools/${schoolId}/admins`)
      ]);
      setSchoolTeachers(teachersRes.data);
      setSchoolStudents(studentsRes.data);
      setSchoolAdmins(adminsRes.data);
    } catch (error) {
      console.error('Error fetching school data:', error);
    }
  };

  // Get unique classes from students
  const availableClasses = [...new Set(schoolStudents.map(s => s.class))].sort((a: any, b: any) => {
    return parseInt(a) - parseInt(b);
  });

  // Filter students by class
  const filteredStudents = selectedClass === 'all' 
    ? schoolStudents 
    : schoolStudents.filter(s => s.class === selectedClass);

  // Group students by class for display
  const studentsByClass = filteredStudents.reduce((acc: any, student) => {
    const className = student.class || 'Unassigned';
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(student);
    return acc;
  }, {});

  const sortedClasses = Object.keys(studentsByClass).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return parseInt(a) - parseInt(b);
  });

  const handleTeacherClick = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsTeacherModalOpen(true);
  };

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleAdminClick = (admin: any) => {
    setSelectedAdmin(admin);
    setIsAdminModalOpen(true);
  };

  const statsData = [
    { 
      title: "Total Schools",
      value: stats.schools,
      icon: <School className="h-8 w-8 text-edu-blue" />,
      description: "Registered schools",
    },
    { 
      title: "School Admins", 
      value: stats.schoolAdmins,
      icon: <UserCog className="h-8 w-8 text-edu-purple" />,
      description: "School administrators",
    },
    { 
      title: "Total Teachers", 
      value: stats.teachers,
      icon: <GraduationCap className="h-8 w-8 text-edu-green" />,
      description: "Across all schools",
    },
    { 
      title: "Total Students", 
      value: stats.students,
      icon: <Users className="h-8 w-8 text-edu-yellow" />,
      description: "Enrolled students",
    },
  ];

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
                    <CardDescription>Add schools, admins, teachers, or students</CardDescription>
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

          {/* Schools List */}
          <Card>
            <CardHeader>
              <CardTitle>Schools Overview</CardTitle>
              <CardDescription>View teachers and students by school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select School</label>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={selectedSchool}
                    onChange={(e) => handleSchoolSelect(e.target.value)}
                  >
                    <option value="">-- Select a school --</option>
                    {schools.map((school) => (
                      <option key={school.schoolId} value={school.schoolId}>
                        {school.schoolName} ({school.location})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSchool && (
                  <div className="space-y-6 mt-6">
                    {/* School Admins Section - Full Width on Top */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">School Admins ({schoolAdmins.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto border rounded p-4 bg-purple-50/30">
                        {schoolAdmins.length === 0 ? (
                          <p className="text-gray-500 col-span-3">No admins found</p>
                        ) : (
                          schoolAdmins.map((admin) => (
                            <div 
                              key={admin.schoolAdminId || admin._id} 
                              className="p-3 bg-white rounded-lg hover:bg-purple-50 cursor-pointer transition-colors border border-purple-200 hover:border-purple-400 shadow-sm hover:shadow-md"
                              onClick={() => handleAdminClick(admin)}
                            >
                              <p className="font-medium text-gray-900">{admin.name}</p>
                              <p className="text-sm text-gray-600">ID: {admin.schoolId}</p>
                              <p className="text-xs text-purple-600 mt-1 font-medium">Click to view profile →</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {/* Teachers and Students Section - 2 Columns Below */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Teachers ({schoolTeachers.length})</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-2">
                          {schoolTeachers.length === 0 ? (
                            <p className="text-gray-500">No teachers found</p>
                          ) : (
                            schoolTeachers.map((teacher) => (
                              <div 
                                key={teacher.teacherId} 
                                className="p-3 bg-gray-50 rounded hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-300"
                                onClick={() => handleTeacherClick(teacher)}
                              >
                                <p className="font-medium">{teacher.name}</p>
                                <p className="text-sm text-gray-600">ID: {teacher.teacherId}</p>
                                <p className="text-xs text-blue-600 mt-1">Click to view profile</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-lg">Students ({filteredStudents.length})</h3>
                          <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger className="w-full sm:w-40">
                              <SelectValue placeholder="Filter by class" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Classes</SelectItem>
                              {availableClasses.map((cls) => (
                                <SelectItem key={cls} value={cls}>
                                  Class {cls}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto border rounded p-2">
                          {filteredStudents.length === 0 ? (
                            <p className="text-gray-500">No students found</p>
                          ) : (
                            sortedClasses.map((className) => (
                              <div key={className} className="mb-4">
                                <h4 className="font-medium text-sm text-gray-700 mb-2 sticky top-0 bg-white py-1">
                                  Class {className} ({studentsByClass[className].length} students)
                                </h4>
                                <div className="space-y-2 pl-2">
                                  {studentsByClass[className].map((student: any) => (
                                    <div 
                                      key={student.studentId} 
                                      className="p-3 bg-gray-50 rounded hover:bg-green-50 cursor-pointer transition-colors border border-transparent hover:border-green-300"
                                      onClick={() => handleStudentClick(student)}
                                    >
                                      <p className="font-medium">{student.name}</p>
                                      <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                                      <p className="text-xs text-green-600 mt-1">Click to view profile</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Teacher Profile Modal */}
      <Dialog open={isTeacherModalOpen} onOpenChange={setIsTeacherModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-600">Teacher Profile</DialogTitle>
          </DialogHeader>
          
          {selectedTeacher && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="bg-blue-600 p-4 rounded-full">
                  <User className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedTeacher.name}</h2>
                  <p className="text-gray-600">Teacher</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                  
                  <div className="flex items-start space-x-3">
                    <IdCard className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Teacher ID</p>
                      <p className="text-gray-800 font-medium">{selectedTeacher.teacherId || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="text-gray-800 font-medium">{selectedTeacher.name || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800 font-medium">{selectedTeacher.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Professional Details</h3>

                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">School ID</p>
                      <p className="text-gray-800 font-medium">{selectedTeacher.schoolId || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Classes Assigned</p>
                      <p className="text-gray-800 font-medium">
                        {selectedTeacher.classes && selectedTeacher.classes.length > 0 
                          ? `${selectedTeacher.classes.length} classes` 
                          : 'No classes assigned'}
                      </p>
                      {selectedTeacher.classes && selectedTeacher.classes.length > 0 && (
                        <div className="mt-1 text-xs text-gray-600 max-h-32 overflow-y-auto">
                          {selectedTeacher.classes.map((cls: string, idx: number) => (
                            <div key={idx} className="truncate bg-gray-50 p-1 rounded mt-1">{cls}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Quizzes Created</p>
                      <p className="text-gray-800 font-medium">
                        {selectedTeacher.quizzesCreated?.length || 0} quizzes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student Profile Modal */}
      <Dialog open={isStudentModalOpen} onOpenChange={setIsStudentModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600">Student Profile</DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="bg-green-600 p-4 rounded-full">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.name}</h2>
                  <p className="text-gray-600">Student</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                  
                  <div className="flex items-start space-x-3">
                    <IdCard className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Student ID</p>
                      <p className="text-gray-800 font-medium">{selectedStudent.studentId || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="text-gray-800 font-medium">{selectedStudent.name || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800 font-medium">{selectedStudent.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Academic Details</h3>

                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">School ID</p>
                      <p className="text-gray-800 font-medium">{selectedStudent.schoolId || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Class</p>
                      <p className="text-gray-800 font-medium">{selectedStudent.class || 'N/A'}</p>
                    </div>
                  </div>

                  {/* <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Quizzes Attempted</p>
                      <p className="text-gray-800 font-medium">
                        {selectedStudent.quizzesAttempted?.length || 0} quizzes
                      </p>
                    </div>
                  </div> */}

                  {selectedStudent.totalScore !== undefined && (
                    <div className="flex items-start space-x-3">
                      <BookOpen className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Total Score</p>
                        <p className="text-gray-800 font-medium">{selectedStudent.totalScore} points</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* School Admin Profile Modal */}
      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-600">School Admin Profile</DialogTitle>
          </DialogHeader>
          
          {selectedAdmin && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                <div className="bg-purple-600 p-4 rounded-full">
                  <UserCog className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedAdmin.name}</h2>
                  <p className="text-gray-600">School Administrator</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                  
                  <div className="flex items-start space-x-3">
                    <IdCard className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Admin ID</p>
                      <p className="text-gray-800 font-medium">{selectedAdmin.schoolId || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="text-gray-800 font-medium">{selectedAdmin.username || selectedAdmin.name || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800 font-medium">{selectedAdmin.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Administrative Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Administrative Details</h3>

                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">School ID</p>
                      <p className="text-gray-800 font-medium">{selectedAdmin.schoolId || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <School className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="text-gray-800 font-medium">School Administrator</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Permissions</p>
                      <p className="text-gray-800 font-medium">Manage Teachers & Students</p>
                    </div>
                  </div>

                  {selectedAdmin.email && (
                    <div className="flex items-start space-x-3">
                      <IdCard className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-800 font-medium">{selectedAdmin.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
