import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { User, Phone, IdCard, Building, Users } from 'lucide-react';
import Header from '@/components/Header';

const API_URL = import.meta.env.VITE_API_URL;

interface TeacherData {
  _id: string;
  teacherId: string;
  username?: string;
  name: string;
  phone?: string;
  schoolId: string;
  classes: string[];
  quizzesCreated: string[];
  createdAt?: string;
}

const TeacherProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { teacherId } = useParams<{ teacherId: string }>();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'schooladmin') {
      navigate('/');
      return;
    }

    if (!teacherId) {
      setError('Teacher ID is missing');
      setLoading(false);
      return;
    }

    const fetchTeacher = async () => {
      try {
        const response = await axios.get(`${API_URL}/teachers/${teacherId}`);
        const teacher = response.data;
        setTeacherData({
          _id: teacher._id,
          teacherId: teacher.teacherId,
          username: teacher.username,
          name: teacher.name,
          phone: teacher.phone || 'N/A',
          schoolId: teacher.schoolId,
          classes: teacher.classes || [],
          quizzesCreated: teacher.quizzesCreated || [],
          createdAt: teacher.createdAt
        });
      } catch (err) {
        console.error('Error loading teacher profile:', err);
        setError('Failed to load teacher profile');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [navigate, teacherId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !teacherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Teacher not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="bg-white p-4 rounded-full">
                <User className="h-20 w-20 text-blue-600" />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{teacherData.name}</h1>
                <p className="text-blue-100 mt-1">Teacher Profile</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Personal Information
                </h2>

                <div className="flex items-start space-x-3">
                  <IdCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Teacher ID</p>
                    <p className="text-gray-800 font-medium">{teacherData.teacherId}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="text-gray-800 font-medium">{teacherData.username || teacherData.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-800 font-medium">{teacherData.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Professional Details
                </h2>

                <div className="flex items-start space-x-3">
                  <Building className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">School ID</p>
                    <p className="text-gray-800 font-medium">{teacherData.schoolId}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Classes Assigned</p>
                    <p className="text-gray-800 font-medium">
                      {teacherData.classes && teacherData.classes.length > 0
                        ? `${teacherData.classes.length} classes`
                        : 'No classes assigned'}
                    </p>
                    {teacherData.classes && teacherData.classes.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600">
                        {teacherData.classes.slice(0, 3).map((cls, idx) => (
                          <div key={idx} className="truncate">{cls}</div>
                        ))}
                        {teacherData.classes.length > 3 && (
                          <div className="text-blue-600">+{teacherData.classes.length - 3} more</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4 border-t pt-6">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TeacherProfileView;
