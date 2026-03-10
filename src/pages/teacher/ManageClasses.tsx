import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PlusCircle, BookOpen, Users } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;

const SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'Hindi',
  'Social Studies',
  'History',
  'Geography',
  'Civics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Physical Education',
  'Art',
  'Music'
];

const ManageClasses: React.FC = () => {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState<string>('');
  const [schoolId, setSchoolId] = useState<string>('');
  const [classes, setClasses] = useState<any[]>([]);
  
  // Form for creating new class
  const [newClass, setNewClass] = useState({
    className: '',
    subject: ''
  });

  useEffect(() => {
    const teacherCookie = Cookies.get("teacher");
    console.log("Teacher Cookie:", teacherCookie);
    if (teacherCookie) {
      try {
        const parsed = JSON.parse(teacherCookie);
        console.log("Parsed teacher data:", parsed);
        const tId = parsed.teacher.teacherId;
        const sId = parsed.teacher.schoolId;
        console.log("Teacher ID:", tId, "School ID:", sId);
        setTeacherId(tId);
        setSchoolId(sId);
        fetchClasses(tId);
      } catch (e) {
        console.error('Error parsing teacher data', e);
        toast({
          title: "Error",
          description: "Failed to load teacher data. Please log in again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Not Logged In",
        description: "Please log in as a teacher first.",
        variant: "destructive",
      });
    }
  }, []);

  const fetchClasses = async (tId: string) => {
    try {
      console.log("Fetching classes for teacher:", tId);
      const response = await axios.get(`${API_URL}/classes/teacher/${tId}`);
      console.log("Classes fetched:", response.data);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      });
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClass.className || !newClass.subject) {
      toast({
        title: "Missing Information",
        description: "Please select both class number and subject",
        variant: "destructive",
      });
      return;
    }

    if (!teacherId || !schoolId) {
      toast({
        title: "Authentication Error",
        description: "Teacher ID or School ID not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        className: newClass.className,
        subject: newClass.subject,
        teacherId,
        schoolId
      };

      console.log('Creating class with payload:', payload); // Debug log

      const response = await axios.post(`${API_URL}/classes`, payload);

      toast({
        title: "Success",
        description: "Class created successfully",
      });

      setNewClass({ className: '', subject: '' });
      fetchClasses(teacherId);
    } catch (error: any) {
      console.error('Error creating class:', error.response?.data); // Debug log
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create class",
        variant: "destructive",
      });
    }
  };

  const handleManageStudents = (classId: string) => {
    navigate(`/teacher/class/${classId}/students`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8 bg-gray-50">
        <div className="edu-container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Classes</h1>
            <p className="text-gray-600">Create classes and manage student enrollment</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create New Class */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Create New Class
                </CardTitle>
                <CardDescription>Add a new class for your subject</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Number</Label>
                    <Select
                      value={newClass.className}
                      onValueChange={(value) => setNewClass({ ...newClass, className: value })}
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

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={newClass.subject}
                      onValueChange={(value) => setNewClass({ ...newClass, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Class
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* My Classes List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  My Classes ({classes.length})
                </CardTitle>
                <CardDescription>Click on a class to manage its students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {classes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No classes yet. Create one!</p>
                  ) : (
                    classes.map((cls) => (
                      <div
                        key={cls.classId}
                        className="p-3 rounded border bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium">Class {cls.className} - {cls.subject}</p>
                            <p className="text-sm text-gray-600">
                              Students: {cls.students?.length || 0}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handleManageStudents(cls.classId)}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ManageClasses;
