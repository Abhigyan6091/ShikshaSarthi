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
import { BookOpen, Wifi, WifiOff } from "lucide-react";
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 md:px-8 py-10">
      <div className="fixed top-4 right-4 z-10">
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm ${isOnline ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          title={isOnline ? "Online" : "Offline"}
        >
          {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
      <Card className="w-full max-w-md sm:max-w-sm md:max-w-md mx-auto shadow-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <BookOpen className="h-8 w-8 text-edu-blue sm:h-10 sm:w-10" />
          </div>
          <CardTitle className="text-xl sm:text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-sm sm:text-base text-center">
            Login to access NMMS preparation resources
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

            <div className="text-xs text-gray-500 space-y-0.5">
              <p>Demo credentials:</p>
              <p>ID: 1234</p>
              <p>Password: 1234</p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full text-sm sm:text-base" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            {/* <p className="mt-2 text-center text-xs sm:text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-edu-blue hover:underline">
                Register here
              </a>
            </p> */}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
