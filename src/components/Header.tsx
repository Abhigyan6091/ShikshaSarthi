
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Home,
  User,
  BookOpen, 
  LogOut,
  UserPlus,
  Menu,
  Wifi,
  WifiOff
} from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.navigator.onLine;
  });

  useEffect(() => {
    // Check for logged in user
    const role = localStorage.getItem('userRole');
    const currentUser = localStorage.getItem('currentUser');
    const studentData = localStorage.getItem('student');
    
    if (role) {
      setUserRole(role);
    }
    
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        setUserName(user.name || user.username || '');
        
        // Try to get studentId from currentUser
        if (user.studentId) {
          setStudentId(user.studentId);
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
    
    // For students, also check the 'student' localStorage entry
    if (role === 'student' && studentData) {
      try {
        const student = JSON.parse(studentData);
        if (student.student && student.student.studentId) {
          setStudentId(student.student.studentId);
        }
      } catch (e) {
        console.error('Error parsing student data', e);
      }
    }
  }, []);

  useEffect(() => {
    const markOnline = () => setIsOnline(true);
    const markOffline = () => setIsOnline(false);

    window.addEventListener('online', markOnline);
    window.addEventListener('offline', markOffline);

    return () => {
      window.removeEventListener('online', markOnline);
      window.removeEventListener('offline', markOffline);
    };
  }, []);

  const handleLogout = () => {
    // Clear all storage
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('student');
    localStorage.removeItem('schooladmin');
    localStorage.removeItem('superadmin');
    localStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setUserRole(null);
    setUserName('');
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    switch(userRole) {
      case 'superadmin': return '/superadmin';
      case 'schooladmin': return '/schooladmin';
      case 'teacher': return '/teacher';
      case 'student': return '/student';
      default: return '/';
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="edu-container py-3 lg:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-edu-blue" />
            <span className="text-xl sm:text-2xl font-bold text-edu-blue">NMMS Prep</span>
          </Link>
        </div>
        
        <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
              isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          >
            {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          {userRole ? (
            <>
            <Link to={getDashboardPath()}>
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              
              {/* User Profile Button - Navigates to profile for students */}
              {userRole === 'student' && studentId ? (
                <>
                
                <Link to={`/student/profile/${studentId}`}>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {userName} ({userRole})
                  </Button>
                </Link>
                </>
              ) : (
                <></>
              )}
              
              {/* Show profile button for teachers and school admins */}
              {(userRole === 'teacher' || userRole === 'schooladmin') && (
                <>
                  <Link to={userRole === 'teacher' ? "/teacher/profile" : "/schooladmin/profile"}>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                </>
              )}

              {/* Show Register button for admins and teachers */}
              {(userRole === 'superadmin' || userRole === 'schooladmin' || userRole === 'teacher') && (
                <Link to="/register">
                  <Button variant="ghost" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register
                  </Button>
                </Link>
              )}

              
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <div className="flex space-x-2">
              <Link to="/login">
                <Button size="sm">Login</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <div
            className={`flex items-center justify-center rounded-full p-2 ${
              isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          >
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          </div>
          {userRole && (
            <Link to={getDashboardPath()}>
              <Button variant="ghost" size="icon" aria-label="Open dashboard">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-2">
                {userRole ? (
                  <>
                    <SheetClose asChild>
                      <Link to={getDashboardPath()}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Home className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                    </SheetClose>

                    {userRole === 'student' && studentId && (
                      <SheetClose asChild>
                        <Link to={`/student/profile/${studentId}`}>
                          <Button variant="ghost" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </Button>
                        </Link>
                      </SheetClose>
                    )}

                    {(userRole === 'teacher' || userRole === 'schooladmin') && (
                      <SheetClose asChild>
                        <Link to={userRole === 'teacher' ? "/teacher/profile" : "/schooladmin/profile"}>
                          <Button variant="ghost" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </Button>
                        </Link>
                      </SheetClose>
                    )}

                    {(userRole === 'superadmin' || userRole === 'schooladmin' || userRole === 'teacher') && (
                      <SheetClose asChild>
                        <Link to="/register">
                          <Button variant="ghost" className="w-full justify-start">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Register
                          </Button>
                        </Link>
                      </SheetClose>
                    )}

                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Link to="/login">
                      <Button className="w-full">Login</Button>
                    </Link>
                  </SheetClose>
                )}
              </div>

              {userRole && (
                <p className="mt-6 text-sm text-muted-foreground">
                  Signed in as {userName || 'User'} ({userRole})
                </p>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
