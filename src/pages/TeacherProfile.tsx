import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, BookOpen, Calendar, IdCard, Building, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// Interface matching Teacher schema exactly
interface TeacherData {
  _id: string;
  teacherId: string;
  username: string;
  name: string;
  phone: string;
  schoolId: string;
  profilePhoto?: string;
  classes: string[];
  quizzesCreated: string[];
  questionAdded: any[];
  createdAt: string;
}

const TeacherProfile: React.FC = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');

    // Redirect if not a teacher
    if (userRole !== 'teacher') {
      navigate('/');
      return;
    }

    // Fetch teacher data
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        
        // Get teacher data from cookies (stored during login)
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };

        const teacherCookie = getCookie('teacher');
        console.log('Teacher cookie raw:', teacherCookie);
        
        if (teacherCookie) {
          try {
            const decoded = decodeURIComponent(teacherCookie);
            console.log('Decoded teacher cookie:', decoded);
            const cookieData = JSON.parse(decoded);
            console.log('Parsed teacher cookie data:', cookieData);
            
            // Cookie structure is { teacher: {...teacherData} }
            const teacherInfo = cookieData.teacher;
            
            if (teacherInfo) {
              setTeacherData({
                _id: teacherInfo._id || 'N/A',
                teacherId: teacherInfo.teacherId || 'N/A',
                username: teacherInfo.username || 'N/A',
                name: teacherInfo.name || 'Teacher Name',
                phone: teacherInfo.phone || 'N/A',
                schoolId: teacherInfo.schoolId || 'N/A',
                profilePhoto: teacherInfo.profilePhoto || '',
                classes: teacherInfo.classes || [],
                quizzesCreated: teacherInfo.quizzesCreated || [],
                questionAdded: teacherInfo.questionAdded || [],
                createdAt: teacherInfo.createdAt || new Date().toISOString()
              });
              return;
            }
          } catch (parseError) {
            console.error('Error parsing teacher cookie:', parseError);
          }
        }
        
        throw new Error('No teacher data found in cookies');
      } catch (err) {
        setError('Failed to load teacher profile. Please try again later.');
        console.error('Error fetching teacher data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [navigate]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="bg-white p-1 rounded-full">
                <div className="h-20 w-20 rounded-full overflow-hidden">
                  {teacherData?.profilePhoto ? (
                    <img
                      src={`${API_URL}/${teacherData.profilePhoto.replace(/^\//, '')}`}
                      alt={teacherData.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{teacherData?.name}</h1>
                <p className="text-blue-100 mt-1">Teacher Profile</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Personal Information
                </h2>
                
                <div className="flex items-start space-x-3">
                  <IdCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Teacher ID</p>
                    <p className="text-gray-800 font-medium">{teacherData?.teacherId}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="text-gray-800 font-medium">{teacherData?.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-800 font-medium">{teacherData?.phone || 'N/A'}</p>
                  </div>
                </div>

                
                
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Professional Details
                </h2>

                <div className="flex items-start space-x-3">
                  <Building className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">School ID</p>
                    <p className="text-gray-800 font-medium">{teacherData?.schoolId}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Classes Assigned</p>
                    <p className="text-gray-800 font-medium">
                      {teacherData?.classes && teacherData.classes.length > 0 
                        ? `${teacherData.classes.length} classes` 
                        : 'No classes assigned'}
                    </p>
                    {teacherData?.classes && teacherData.classes.length > 0 && (
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

            {/* Action Buttons */}
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
  );
};

export default TeacherProfile;
