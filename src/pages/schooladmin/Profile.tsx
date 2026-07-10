import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Phone, Building, IdCard, Users, GraduationCap, Calendar } from 'lucide-react';
import Header from '@/components/Header';

const API_URL = import.meta.env.VITE_API_URL;

interface SchoolAdminData {
  _id: string;
  username: string;
  name: string;
  phone?: string;
  schoolId: string;
  profilePhoto?: string;
  teachers: string[];
  students: string[];
  createdAt: string;
}

const SchoolAdminProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SchoolAdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const currentUser = localStorage.getItem('currentUser');

    if (role !== 'schooladmin') {
      navigate('/');
      return;
    }

    if (!currentUser) {
      setError('School admin session not found. Please login again.');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const parsed = JSON.parse(currentUser);
        const adminUsername = parsed.username;

        if (!adminUsername) {
          throw new Error('School admin username not found');
        }

        const response = await axios.get(`${API_URL}/schooladmin/${adminUsername}`);
        const admin = response.data;

        setProfile({
          _id: admin._id,
          username: admin.username,
          name: admin.name,
          phone: admin.phone || 'N/A',
          schoolId: admin.schoolId,
          profilePhoto: admin.profilePhoto || '',
          teachers: admin.teachers || [],
          students: admin.students || [],
          createdAt: admin.createdAt || new Date().toISOString()
        });
      } catch (err) {
        console.error('Error fetching schooladmin profile:', err);
        setError('Failed to load school admin profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Profile not found'}</p>
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
              <div className="bg-white p-1 rounded-full">
                <div className="h-20 w-20 rounded-full overflow-hidden">
                  {profile.profilePhoto ? (
                    <img
                      src={`${API_URL}/${profile.profilePhoto.replace(/^\//, '')}`}
                      alt={profile.name}
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
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-blue-100 mt-1">School Admin Profile</p>
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
                    <p className="text-sm text-gray-500">School Admin ID</p>
                    <p className="text-gray-800 font-medium">{profile.username || profile._id}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="text-gray-800 font-medium">{profile.name || profile.username}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-800 font-medium">{profile.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="text-gray-800 font-medium">
                      {new Date(profile.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>
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
                    <p className="text-gray-800 font-medium">{profile.schoolId}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Teachers Assigned</p>
                    <p className="text-gray-800 font-medium">
                      {profile.teachers.length > 0 ? `${profile.teachers.length} teachers` : 'No teachers assigned'}
                    </p>
                    {profile.teachers.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600">
                        {profile.teachers.slice(0, 3).map((teacherId, idx) => (
                          <div key={idx} className="truncate">{teacherId}</div>
                        ))}
                        {profile.teachers.length > 3 && (
                          <div className="text-blue-600">+{profile.teachers.length - 3} more</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Students Assigned</p>
                    <p className="text-gray-800 font-medium">
                      {profile.students.length > 0 ? `${profile.students.length} students` : 'No students assigned'}
                    </p>
                    {profile.students.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600">
                        {profile.students.slice(0, 3).map((studentId, idx) => (
                          <div key={idx} className="truncate">{studentId}</div>
                        ))}
                        {profile.students.length > 3 && (
                          <div className="text-blue-600">+{profile.students.length - 3} more</div>
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

export default SchoolAdminProfile;
