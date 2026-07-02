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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Home,
  User,
  BookOpen, 
  LogOut,
  UserPlus,
  Menu,
  Wifi,
  WifiOff,
  Settings,
  Languages
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const getPhotoUrl = (photo: string) => {
  if (!photo) return '';
  if (photo.startsWith('data:') || photo.startsWith('http')) return photo;
  return `${API_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
};

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [language, setLanguage] = useState<string>(() => localStorage.getItem('appLanguage') || 'hi');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.navigator.onLine;
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const readUserData = () => {
    const role = localStorage.getItem('userRole');
    const currentUser = localStorage.getItem('currentUser');
    const studentData = localStorage.getItem('student');
    let name = '';
    let photo = '';
    let sId = '';

    if (role) {
      setUserRole(role);
    }

    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        name = user.name || user.username || '';
        photo = user.profilePhoto || '';
        if (user.studentId) {
          sId = user.studentId;
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }

    if (role === 'student' && studentData) {
      try {
        const student = JSON.parse(studentData);
        if (student.student && student.student.studentId) {
          sId = student.student.studentId;
        }
      } catch (e) {
        console.error('Error parsing student data', e);
      }
    }

    setUserName(name);
    setProfilePhoto(photo);
    setStudentId(sId);
  };

  useEffect(() => {
    readUserData();
  }, [refreshKey]);

  useEffect(() => {
    const handleUserDataChanged = () => {
      setRefreshKey(k => k + 1);
    };
    window.addEventListener('userDataChanged', handleUserDataChanged);
    return () => window.removeEventListener('userDataChanged', handleUserDataChanged);
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
    window.dispatchEvent(new CustomEvent('userLoggedOut'));

    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('student');
    localStorage.removeItem('schooladmin');
    localStorage.removeItem('superadmin');
    localStorage.removeItem('teacher');
    localStorage.removeItem('authToken');

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setUserRole(null);
    setUserName('');
    setProfilePhoto('');
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const toggleLanguage = () => {
    const nextLanguage = language === 'hi' ? 'en' : 'hi';
    setLanguage(nextLanguage);
    localStorage.setItem('appLanguage', nextLanguage);
    window.dispatchEvent(new CustomEvent('appLanguageChanged', { detail: { language: nextLanguage } }));
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

  const renderAvatar = (sizeClass = 'h-8 w-8', textSize = 'text-sm') => (
    <Avatar className={`${sizeClass} ring-2 ring-edu-blue/20`}>
      {profilePhoto ? (
        <AvatarImage src={getPhotoUrl(profilePhoto)} alt={userName} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-gradient-to-br from-edu-blue to-edu-purple text-white">
        <span className={textSize}>
          {userName ? userName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
        </span>
      </AvatarFallback>
    </Avatar>
  );

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

              <Button variant="outline" size="sm" onClick={toggleLanguage}>
                <Languages className="h-4 w-4 mr-2" />
                {language === 'hi' ? 'English' : 'हिंदी'}
              </Button>
              
              {/* User Profile Button */}
              {userRole === 'student' && studentId ? (
                <Link to={`/student/profile/${studentId}`}>
                  <Button variant="ghost" size="sm">
                    {renderAvatar('h-6 w-6', 'text-xs')}
                    <span className="ml-2">{userName} ({userRole})</span>
                  </Button>
                </Link>
              ) : (
                <></>
              )}
              
              {/* Show profile button for teachers and school admins */}
              {(userRole === 'teacher' || userRole === 'schooladmin') && (
                <>
                  <Link to={userRole === 'teacher' ? "/teacher/profile" : "/schooladmin/profile"}>
                    <Button variant="ghost" size="sm">
                      {renderAvatar('h-6 w-6', 'text-xs')}
                      <span className="ml-2">{userName}</span>
                    </Button>
                  </Link>
                </>
              )}

              {/* Settings button for all logged-in users */}
              {userRole !== 'superadmin' && (
                <Link to={`/${userRole}/settings`}>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
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
                    <div className="flex items-center gap-3 px-3 py-4 border-b mb-2">
                      {renderAvatar('h-12 w-12', 'text-lg')}
                      <div>
                        <p className="font-medium text-sm">{userName || 'User'}</p>
                        <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                      </div>
                    </div>

                    <SheetClose asChild>
                      <Link to={getDashboardPath()}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Home className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                    </SheetClose>

                    <Button variant="ghost" className="w-full justify-start" onClick={toggleLanguage}>
                      <Languages className="h-4 w-4 mr-2" />
                      {language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
                    </Button>

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

                    {userRole !== 'superadmin' && (
                      <SheetClose asChild>
                        <Link to={`/${userRole}/settings`}>
                          <Button variant="ghost" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
