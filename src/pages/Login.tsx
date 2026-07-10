import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Wifi, WifiOff, BrainCircuit, Users, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { clearAllAuth } from "@/lib/session";

const Login: React.FC = () => {
  const [role, setRole] = useState<string>("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return window.navigator.onLine;
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Wipe any leftover session the moment the login page loads, so a new login
  // can never inherit a previous user's cached profile.
  useEffect(() => {
    clearAllAuth();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter username and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      let endpoint = '';
      let redirectPath = '';
      let payload: any = { username, password };

      switch (role) {
        case 'superadmin':
          endpoint = `${API_URL}/superadmin/login`;
          redirectPath = '/superadmin';
          break;
        case 'schooladmin':
          endpoint = `${API_URL}/schooladmin/login`;
          redirectPath = '/schooladmin';
          break;
        case 'teacher':
          endpoint = `${API_URL}/teachers/login`;
          payload = { teacherId: username, password };
          redirectPath = '/teacher';
          break;
        case 'student':
          endpoint = `${API_URL}/students/login`;
          payload = { studentId: username, password };
          redirectPath = '/student';
          break;
        default:
          toast({
            title: "Error",
            description: "Please select a valid role",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
      }

      const response = await axios.post(endpoint, payload);

      if (response.data) {
        // Get the correct user data based on role
        let userData;
        if (role === 'student') {
          userData = {
            ...(response.data.student || response.data.user),
            role: role
          };

          console.log('=== LOGIN DEBUG ===');
          console.log('Response data:', response.data);
          console.log('userData:', userData);
          console.log('studentId in userData:', userData.studentId);
          console.log('==================');

          localStorage.setItem('student', JSON.stringify({ student: userData }));

          // Verify what was stored
          const stored = localStorage.getItem('student');
          console.log('Stored in localStorage:', stored);

        } else if (role === 'teacher') {
          userData = {
            ...(response.data.teacher || response.data.user),
            role: role
          };

          const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
          Cookies.set('teacher', JSON.stringify({ teacher: userData }), {
            expires: 7,
            secure: isHttps,
            sameSite: isHttps ? "strict" : "lax",
          });
          localStorage.setItem('teacher', JSON.stringify({ teacher: userData }));
        } else if (role === 'schooladmin') {
          userData = {
            ...(response.data.user),
            role: role
          };
          localStorage.setItem('schooladmin', JSON.stringify({ user: userData }));
        } else if (role === 'superadmin') {
          userData = {
            ...(response.data.user),
            role: role
          };
          localStorage.setItem('superadmin', JSON.stringify({ user: userData }));
        }

        localStorage.setItem('userRole', role);
        localStorage.setItem('currentUser', JSON.stringify(userData));

        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }

        window.dispatchEvent(new CustomEvent('userLoggedIn'));

        toast({
          title: "Success",
          description: `Welcome back, ${response.data.user?.name || username}!`,
        });

        if (userData.must_change_password) {
          navigate('/change-password');
        } else {
          navigate(redirectPath);
        }
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error?.response?.data?.error || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleCopy: Record<string, { title: string; blurb: string }> = {
    student: { title: "Student ID", blurb: "Practice, take adaptive tests, and track your progress." },
    teacher: { title: "Teacher ID", blurb: "Create quizzes, manage classes, and follow student growth." },
    schooladmin: { title: "Username", blurb: "Oversee your school's teachers, students, and activity." },
    superadmin: { title: "Username", blurb: "Manage every school, question bank, and platform-wide sync." },
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed top-4 right-4 z-20">
        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm ${isOnline ? "border-emerald-200 bg-emerald-100/90 text-emerald-700" : "border-red-200 bg-red-100/90 text-red-700"
            }`}
          title={isOnline ? "Online" : "Offline"}
        >
          {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>

      {/* Left: branding / info panel — hidden on small screens */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-edu-blue via-blue-700 to-edu-purple p-10 text-white lg:flex xl:p-14">
        {/* decorative glass blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-edu-yellow/10 blur-3xl" />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <img src="/logo.png" alt="ShikshaSarthi logo" className="h-10 w-14 drop-shadow" />
          <span className="text-2xl font-bold">ShikshaSarthi</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-3xl font-bold leading-tight xl:text-4xl">
              Learning made simple, offline-first, for every school.
            </h1>
            <p className="mt-3 max-w-md text-blue-100">
              Adaptive tests, a shared question bank, classroom announcements, and real-time
              sync — built for government schools, even with patchy internet.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <BrainCircuit className="mt-0.5 h-6 w-6 flex-shrink-0 text-edu-yellow" />
              <div>
                <p className="font-semibold">Adaptive Testing</p>
                <p className="text-sm text-blue-100">Questions adjust to each student's level, automatically.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <Users className="mt-0.5 h-6 w-6 flex-shrink-0 text-edu-yellow" />
              <div>
                <p className="font-semibold">Classroom Tools</p>
                <p className="text-sm text-blue-100">Announcements, documents, and quizzes in one place.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <Sparkles className="mt-0.5 h-6 w-6 flex-shrink-0 text-edu-yellow" />
              <div>
                <p className="font-semibold">Bilingual by Design</p>
                <p className="text-sm text-blue-100">Switch between Hindi and English, anytime, anywhere.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-blue-100/80">
          © {new Date().getFullYear()} ShikshaSarthi. Built for offline-first classrooms.
        </p>
      </div>

      {/* Right: login form */}
      <div className="flex w-full flex-1 items-center justify-center px-4 py-10 sm:px-6 md:px-8 lg:w-1/2">
        <Card className="w-full max-w-md sm:max-w-sm md:max-w-md mx-auto shadow-xl border-0 lg:shadow-md">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2 lg:hidden">
              <BookOpen className="h-8 w-8 text-edu-blue sm:h-10 sm:w-10" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-sm sm:text-base text-center">
              {roleCopy[role]?.blurb || "Login to access your ShikshaSarthi workspace"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-edu-blue"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="schooladmin">School Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  {role === "student" ? "Student ID" : role === "teacher" ? "Teacher ID" : "Username"}
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={`Enter your ${role === "student" ? "Student ID" : role === "teacher" ? "Teacher ID" : "Username"}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-edu-blue hover:underline font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <Button className="w-full text-sm sm:text-base" type="submit" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
