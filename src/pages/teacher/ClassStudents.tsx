import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, Users, PlusCircle, Trash2, User, Phone, IdCard, Building, Calendar, BookOpen, GraduationCap } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface Student {
  studentId: string;
  name: string;
  class: string;
  phone?: string;
}

interface ClassData {
  classId: string;
  className: string;
  subject: string;
  teacherId: string;
  schoolId: string;
  students: string[];
  studentDetails?: Student[];
}

const ClassStudents: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [studentToAdd, setStudentToAdd] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const response = await axios.get(`${API_URL}/classes/${classId}`);
      setClassData(response.data);
      
      // Fetch all students from the same school
      if (response.data.schoolId) {
        const studentsRes = await axios.get(`${API_URL}/classes/school/${response.data.schoolId}/students`);
        setAllStudents(studentsRes.data);
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
      toast({
        title: "Error",
        description: "Failed to load class data",
        variant: "destructive",
      });
    }
  };

  const handleAddStudent = async () => {
    if (!studentToAdd) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(`${API_URL}/classes/${classId}/students`, {
        studentId: studentToAdd
      });

      toast({
        title: "Success",
        description: "Student added to class",
      });

      setStudentToAdd('');
      fetchClassData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add student",
        variant: "destructive",
      });
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the class?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/classes/${classId}/students/${studentId}`);

      toast({
        title: "Success",
        description: "Student removed from class",
      });

      fetchClassData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove student",
        variant: "destructive",
      });
    }
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  // Filter available students
  const availableStudents = allStudents.filter(student => {
    // Not already in class
    if (classData?.students?.includes(student.studentId)) return false;
    
    // Batch filter (falls back to legacy class value for pre-migration records)
    if (classFilter && classFilter !== 'all' && (student.batch || student.class) !== classFilter) return false;

    return true;
  });

  // Get enrolled students with details
  const enrolledStudents = classData?.studentDetails || [];

  // Unique batches from all students for the filter dropdown
  const availableClasses = Array.from(new Set(allStudents.map(s => s.batch || s.class).filter(Boolean))).sort();

  if (!classData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 bg-gray-50">
        <div className="edu-container">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/teacher/manage-classes')}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Classes
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Class {classData.className} - {classData.subject}
              </h1>
              <p className="text-gray-600">Manage student enrollment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Add Students
                </CardTitle>
                <CardDescription>
                  {availableStudents.length} students available to add
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="space-y-2">
                  <Label htmlFor="classFilter">Filter by Batch</Label>
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All batches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All batches</SelectItem>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls} Batch
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Student Selection */}
                <div className="space-y-2">
                  <Label htmlFor="student">Select Student</Label>
                  <Select value={studentToAdd} onValueChange={setStudentToAdd}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {availableStudents.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">
                          No students available
                        </div>
                      ) : (
                        availableStudents.map((student) => (
                          <SelectItem key={student.studentId} value={student.studentId}>
                            {student.name} ({student.studentId}) - {student.batch || student.class} Batch
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleAddStudent} 
                  className="w-full"
                  disabled={!studentToAdd}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </CardContent>
            </Card>

            {/* Enrolled Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Enrolled Students ({enrolledStudents.length})
                </CardTitle>
                <CardDescription>
                  Students currently in this class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {enrolledStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">No students enrolled yet</p>
                      <p className="text-sm text-gray-400">Add students from the left panel</p>
                    </div>
                  ) : (
                    enrolledStudents.map((student) => (
                      <div
                        key={student.studentId}
                        className="p-2 bg-gray-50 rounded border flex flex-col sm:flex-row gap-2 sm:items-center hover:bg-green-50 transition-colors group"
                      >
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleStudentClick(student)}
                        >
                          <p className="font-medium group-hover:text-green-700 transition-colors">{student.name}</p>
                          <p className="text-sm text-gray-600">
                            ID: {student.studentId}
                          </p>
                          <p className="text-xs text-green-600 mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to view profile →
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveStudent(student.studentId);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

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
                      <p className="text-sm text-gray-500">Full Name</p>
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
                    <BookOpen className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Class</p>
                      <p className="text-gray-800 font-medium">{selectedStudent.class || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Current Class</p>
                      <p className="text-gray-800 font-medium">{classData?.className || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Subject</p>
                      <p className="text-gray-800 font-medium">{classData?.subject || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Enrollment Status</p>
                    <p className="text-sm text-gray-600 mt-1">
                      This student is currently enrolled in {classData?.className} - {classData?.subject}
                    </p>
                  </div>
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

export default ClassStudents;
