import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Building, IdCard, Phone, User, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface TeacherData {
  _id?: string;
  teacherId?: string;
  username?: string;
  name?: string;
  phone?: string;
  schoolId?: string;
  profilePhoto?: string;
  classes?: string[];
  createdAt?: string;
}

const unwrapTeacher = (raw: string | null): TeacherData | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed.teacher || parsed;
  } catch {
    return null;
  }
};

const TeacherProfileFixed: React.FC = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('userRole') !== 'teacher') {
      navigate('/login');
      return;
    }

    const fromCookie = unwrapTeacher(Cookies.get('teacher') || null);
    const fromTeacherStorage = unwrapTeacher(localStorage.getItem('teacher'));
    const fromCurrentUser = unwrapTeacher(localStorage.getItem('currentUser'));
    const teacher = fromCookie || fromTeacherStorage || fromCurrentUser;

    if (teacher?.teacherId || teacher?._id) {
      setTeacherData(teacher);
    }
    setLoading(false);
  }, [navigate]);

  const photoUrl = teacherData?.profilePhoto
    ? `${API_URL}/${teacherData.profilePhoto.replace(/^\//, '')}`
    : '';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Teacher profile could not be loaded.</p>
          <button onClick={() => navigate('/teacher')} className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-lg bg-white shadow">
        <div className="bg-blue-600 px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white">
              {photoUrl ? (
                <img src={photoUrl} alt={teacherData.name || 'Teacher'} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-blue-600" />
              )}
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold">{teacherData.name || 'Teacher'}</h1>
              <p className="text-blue-100">Teacher Profile</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-6 py-8 md:grid-cols-2">
          <section className="space-y-4">
            <h2 className="border-b pb-2 text-xl font-semibold">Personal Information</h2>
            <div className="flex gap-3">
              <IdCard className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Teacher ID</p>
                <p className="font-medium">{teacherData.teacherId || teacherData._id || 'N/A'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <User className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{teacherData.username || teacherData.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{teacherData.phone || 'N/A'}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="border-b pb-2 text-xl font-semibold">Professional Details</h2>
            <div className="flex gap-3">
              <Building className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">School ID</p>
                <p className="font-medium">{teacherData.schoolId || 'N/A'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Users className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Classes Assigned</p>
                <p className="font-medium">{teacherData.classes?.length ? `${teacherData.classes.length} classes` : 'No classes assigned'}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t px-6 py-4 text-right">
          <button onClick={() => navigate('/teacher')} className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileFixed;
