import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { clearAllAuth } from '@/lib/session';
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
  Languages,
  Bell,
  CheckCheck
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  link?: string;
  createdAt?: string;
};

const UI_TRANSLATIONS: Record<string, string> = {
  Online: 'ऑनलाइन',
  Offline: 'ऑफ़लाइन',
  Dashboard: 'डैशबोर्ड',
  Settings: 'सेटिंग्स',
  Register: 'रजिस्टर',
  Logout: 'लॉग आउट',
  Profile: 'प्रोफ़ाइल',
  'School Admin Dashboard': 'स्कूल एडमिन डैशबोर्ड',
  'School ID': 'स्कूल आईडी',
  'Local Server Connectivity': 'लोकल सर्वर कनेक्टिविटी',
  'LAN access, local database, AWS updates, and sync-agent status': 'LAN, लोकल डेटाबेस, AWS अपडेट और सिंक-एजेंट स्थिति',
  Refresh: 'रीफ्रेश',
  'Student LAN URL': 'छात्र LAN URL',
  'Local Database': 'लोकल डेटाबेस',
  Connected: 'कनेक्टेड',
  Checking: 'जांच हो रही है',
  'AWS Control': 'AWS कंट्रोल',
  Configured: 'कॉन्फ़िगर',
  'Offline-ready': 'ऑफ़लाइन तैयार',
  'Sync Agent': 'सिंक एजेंट',
  Enabled: 'चालू',
  Disabled: 'बंद',
  Waiting: 'प्रतीक्षा',
  Version: 'वर्जन',
  'Total Teachers': 'कुल शिक्षक',
  'Total Students': 'कुल छात्र',
  'Register New Users': 'नए उपयोगकर्ता रजिस्टर करें',
  'Feedback Management': 'फीडबैक प्रबंधन',
  Teachers: 'शिक्षक',
  'Students by Class': 'कक्षा के अनुसार छात्र',
  'Question Bank': 'प्रश्न बैंक',
  'Add Question Manually': 'प्रश्न मैन्युअल जोड़ें',
  'Advanced Quiz Creator': 'एडवांस्ड क्विज़ निर्माता',
  'Quiz Configuration': 'क्विज़ कॉन्फ़िगरेशन',
  'Question Slots': 'प्रश्न स्लॉट',
  'Create Quiz': 'क्विज़ बनाएं',
  'Adaptive Test': 'अनुकूली परीक्षण',
  'Adaptive Test History': 'अनुकूली परीक्षण इतिहास',
  'Start Adaptive Test': 'अनुकूली परीक्षण शुरू करें',
  'Take New Test': 'नया परीक्षण दें',
  'No Adaptive Tests Yet': 'अभी कोई अनुकूली परीक्षण नहीं',
  'Adaptive Test Setup': 'अनुकूली परीक्षण सेटअप',
  'Mixed Test': 'मिश्रित परीक्षण',
  'Subject-wise Test': 'विषयवार परीक्षण',
  Subject: 'विषय',
  Class: 'कक्षा',
  Topic: 'टॉपिक',
  Question: 'प्रश्न',
  Options: 'विकल्प',
  'Correct Answer': 'सही उत्तर',
  'Add Question': 'प्रश्न जोड़ें',
  'Upload JSON': 'JSON अपलोड करें',
  Search: 'खोजें',
  'Back': 'वापस',
  'Back to Dashboard': 'डैशबोर्ड पर वापस',

  // Login / auth
  'Login': 'लॉग इन',
  'Welcome back': 'वापसी पर स्वागत है',
  'Select Role': 'भूमिका चुनें',
  'Student': 'छात्र',
  'Teacher': 'अध्यापक',
  'School Admin': 'स्कूल एडमिन',
  'Super Admin': 'सुपर एडमिन',
  'Student ID': 'छात्र आईडी',
  'Teacher ID': 'शिक्षक आईडी',
  'Username': 'उपयोगकर्ता नाम',
  'Password': 'पासवर्ड',
  'Forgot Password?': 'पासवर्ड भूल गए?',
  'Logging in...': 'लॉग इन हो रहा है...',
  'Registered Email': 'पंजीकृत ईमेल',
  'Reset Password': 'पासवर्ड रीसेट करें',
  'Forgot Password': 'पासवर्ड भूल गए',

  // Common actions / status
  'Save': 'सहेजें',
  'Cancel': 'रद्द करें',
  'Submit': 'जमा करें',
  'Delete': 'हटाएं',
  'Edit': 'संपादित करें',
  'Loading...': 'लोड हो रहा है...',
  'Loading': 'लोड हो रहा है',
  'Error': 'त्रुटि',
  'Success': 'सफलता',
  'Yes': 'हाँ',
  'No': 'नहीं',
  'Next': 'अगला',
  'Previous': 'पिछला',
  'Continue': 'जारी रखें',
  'Close': 'बंद करें',
  'View': 'देखें',
  'Download': 'डाउनलोड करें',
  'Upload': 'अपलोड करें',
  'Manage Classes': 'कक्षाएं प्रबंधित करें',
  'My Classes': 'मेरी कक्षाएं',
  'Notifications': 'सूचनाएं',
  'Mark all read': 'सभी को पढ़ा हुआ चिह्नित करें',
  'No notifications yet.': 'अभी कोई सूचना नहीं है।',

  // Student dashboard
  'Practice Questions': 'अभ्यास प्रश्न',
  'Start Practice': 'अभ्यास शुरू करें',
  'Open Classes': 'कक्षाएं खोलें',
  'Group Quiz': 'समूह क्विज़',
  'Multimedia Assessment': 'मल्टीमीडिया मूल्यांकन',
  'Experiment Simulation': 'प्रयोग सिमुलेशन',
  'Give Feedback': 'प्रतिक्रिया दें',
  'Reports': 'रिपोर्ट',
  'Member Since': 'सदस्य बने',
  'Correct': 'सही',
  'Incorrect': 'गलत',
  'Accuracy': 'सटीकता',
  'Rating': 'रेटिंग',
  'Class Leaderboard': 'क्लास लीडरबोर्ड',
  'Review Answers': 'उत्तर समीक्षा',
  'Take Again': 'दोबारा दें',
  'Hint used': 'संकेत इस्तेमाल किया',
  'Skipped': 'छोड़ा गया',
  'Show Hint': 'संकेत दिखाएं',
  'Skip': 'छोड़ें',
  'Finish Test': 'परीक्षण समाप्त करें',
  'Next Question': 'अगला प्रश्न',

  // Teacher / school admin
  'Create Enhanced Quiz': 'एडवांस्ड क्विज़ बनाएं',
  'Quiz Analytics': 'क्विज़ विश्लेषण',
  'All Questions': 'सभी प्रश्न',
  'Announcements': 'घोषणाएं',
  'Documents': 'दस्तावेज़',
  'Post Announcement': 'घोषणा पोस्ट करें',
};

const REVERSE_UI_TRANSLATIONS = Object.fromEntries(
  Object.entries(UI_TRANSLATIONS).map(([en, hi]) => [hi, en])
);

function translateStaticUi(language: string) {
  if (typeof document === 'undefined') return;
  const source = language === 'hi' ? UI_TRANSLATIONS : REVERSE_UI_TRANSLATIONS;
  const translateValue = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !source[trimmed]) return value;
    return value.replace(trimmed, source[trimmed]);
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;
    if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) continue;
    textNodes.push(node);
  }
  textNodes.forEach((node) => {
    node.nodeValue = translateValue(node.nodeValue || '');
  });

  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[placeholder]').forEach((element) => {
    element.placeholder = translateValue(element.placeholder);
  });
}

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationScope, setNotificationScope] = useState('');
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
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
    if (!userRole || !['teacher', 'student'].includes(userRole)) {
      setNotifications([]);
      setNotificationScope('');
      setReadNotificationIds([]);
      return;
    }

    const currentUser = (() => {
      try {
        const parsed = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const roleData = userRole === 'teacher'
          ? JSON.parse(localStorage.getItem('teacher') || '{}')
          : JSON.parse(localStorage.getItem('student') || '{}');
        return roleData.teacher || roleData.student || parsed;
      } catch {
        return {};
      }
    })();

    const identifier = userRole === 'teacher'
      ? currentUser.teacherId || currentUser._id
      : currentUser.studentId || studentId;

    if (!identifier) return;

    const scope = `${userRole}:${identifier}`;
    setNotificationScope(scope);
    try {
      const stored = JSON.parse(localStorage.getItem(`notificationsRead:${scope}`) || '[]');
      setReadNotificationIds(Array.isArray(stored) ? stored.filter(Boolean) : []);
    } catch {
      setReadNotificationIds([]);
    }

    fetch(`${API_URL}/notifications/${userRole}/${encodeURIComponent(identifier)}`)
      .then((response) => response.ok ? response.json() : { notifications: [] })
      .then((data) => setNotifications(Array.isArray(data.notifications) ? data.notifications.slice(0, 20) : []))
      .catch(() => setNotifications([]));
  }, [userRole, studentId, refreshKey]);

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

  useEffect(() => {
    const run = () => translateStaticUi(language);
    const id = window.setTimeout(run, 0);
    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearTimeout(id);
      observer.disconnect();
    };
  }, [language]);

  const handleLogout = () => {
    // Clear every auth key/cookie (incl. nmmsUser + Login_student, which the old
    // logout missed and which the mock AuthContext used to resurrect).
    clearAllAuth();

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Dispatch AFTER clearing so AuthContext's listener re-reads empty storage
    // (event dispatch is synchronous — dispatching first would re-read stale data).
    window.dispatchEvent(new CustomEvent('userLoggedOut'));

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

  const unreadNotificationIds = notifications
    .map((item) => item.id)
    .filter((id) => !readNotificationIds.includes(id));

  const markAllNotificationsRead = () => {
    if (!notificationScope || notifications.length === 0) return;
    const next = Array.from(new Set([...readNotificationIds, ...notifications.map((item) => item.id)]));
    setReadNotificationIds(next);
    localStorage.setItem(`notificationsRead:${notificationScope}`, JSON.stringify(next));
  };

  const markNotificationRead = (id: string) => {
    if (!notificationScope || !id || readNotificationIds.includes(id)) return;
    const next = [...readNotificationIds, id];
    setReadNotificationIds(next);
    localStorage.setItem(`notificationsRead:${notificationScope}`, JSON.stringify(next));
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

  const renderNotifications = () => (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setNotificationsOpen((open) => !open)} className="relative">
        <Bell className="h-4 w-4 mr-2" />
        Notifications
        {unreadNotificationIds.length > 0 && (
          <span className="ml-2 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{unreadNotificationIds.length}</span>
        )}
      </Button>
      {notificationsOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-md border bg-white p-2 shadow-lg">
          <div className="mb-2 flex items-center justify-between border-b px-2 pb-2">
            <span className="text-sm font-semibold">Notifications</span>
            <Button variant="ghost" size="sm" onClick={markAllNotificationsRead} disabled={notifications.length === 0 || unreadNotificationIds.length === 0}>
              <CheckCheck className="mr-1 h-4 w-4" />
              Mark all read
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">No notifications yet.</p>
            ) : notifications.map((item) => (
              <Link
                key={item.id}
                to={item.link || getDashboardPath()}
                onClick={() => {
                  markNotificationRead(item.id);
                  setNotificationsOpen(false);
                }}
                className={`block rounded p-3 hover:bg-blue-50 ${readNotificationIds.includes(item.id) ? 'opacity-70' : 'bg-blue-50/60'}`}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{item.message}</p>
                {item.createdAt && <p className="mt-1 text-[11px] text-gray-400">{new Date(item.createdAt).toLocaleString()}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-white/70 shadow-[0_1px_24px_-8px_rgba(30,64,175,0.25)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/60">
      {/* subtle top sheen for the "liquid glass" look */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-white/40 via-white/0 to-white/0" />
      <div className="edu-container relative py-3 lg:py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="ShikshaSarthi logo" className="h-9 w-12 drop-shadow-sm" />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-edu-blue to-edu-purple bg-clip-text text-transparent">ShikshaSarthi</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
          <div
            className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium backdrop-blur-sm ${
              isOnline ? 'border-emerald-200 bg-emerald-100/80 text-emerald-700' : 'border-red-200 bg-red-100/80 text-red-700'
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
                  {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
                </Button>
              </Link>

              <Button variant="outline" size="sm" onClick={toggleLanguage}>
                <Languages className="h-4 w-4 mr-2" />
                {language === 'hi' ? 'English' : 'हिंदी'}
              </Button>

              {(userRole === 'teacher' || userRole === 'student') && renderNotifications()}
              
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
                {language === 'hi' ? 'लॉग आउट' : 'Logout'}
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
                          {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
                        </Button>
                      </Link>
                    </SheetClose>

                    <Button variant="ghost" className="w-full justify-start" onClick={toggleLanguage}>
                      <Languages className="h-4 w-4 mr-2" />
                      {language === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
                    </Button>

                    {(userRole === 'teacher' || userRole === 'student') && (
                      <div className="rounded-md border p-2">
                        <div className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold">
                          <Bell className="h-4 w-4" />
                          Notifications
                          {unreadNotificationIds.length > 0 && (
                            <span className="ml-auto rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{unreadNotificationIds.length}</span>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <Button variant="ghost" size="sm" className="mb-2 w-full justify-start" onClick={markAllNotificationsRead} disabled={unreadNotificationIds.length === 0}>
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Mark all as read
                          </Button>
                        )}
                        {notifications.length === 0 ? (
                          <p className="px-1 text-sm text-muted-foreground">No notifications yet.</p>
                        ) : notifications.slice(0, 6).map((item) => (
                          <SheetClose asChild key={item.id}>
                            <Link
                              to={item.link || getDashboardPath()}
                              onClick={() => markNotificationRead(item.id)}
                              className={`block rounded p-2 text-sm hover:bg-blue-50 ${readNotificationIds.includes(item.id) ? 'opacity-70' : 'bg-blue-50/60'}`}
                            >
                              <span className="block font-medium">{item.title}</span>
                              <span className="line-clamp-2 text-xs text-muted-foreground">{item.message}</span>
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    )}

                    {userRole === 'student' && studentId && (
                      <SheetClose asChild>
                        <Link to={`/student/profile/${studentId}`}>
                          <Button variant="ghost" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" />
                            {language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}
                          </Button>
                        </Link>
                      </SheetClose>
                    )}

                    {(userRole === 'teacher' || userRole === 'schooladmin') && (
                      <SheetClose asChild>
                        <Link to={userRole === 'teacher' ? "/teacher/profile" : "/schooladmin/profile"}>
                          <Button variant="ghost" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" />
                            {language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}
                          </Button>
                        </Link>
                      </SheetClose>
                    )}

                    {userRole !== 'superadmin' && (
                      <SheetClose asChild>
                        <Link to={`/${userRole}/settings`}>
                          <Button variant="ghost" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            {language === 'hi' ? 'सेटिंग्स' : 'Settings'}
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
                      {language === 'hi' ? 'लॉग आउट' : 'Logout'}
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
