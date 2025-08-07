import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Table
} from 'lucide-react';
import TelephonyStatusDashboard from './TelephonyStatusDashboard';
import LoginForm from '../../components/auth/LoginForm';
import MainLayout from '../../components/layout/MainLayout';
import { User, LoginCredentials } from '../../types/auth';
import { LogEntry } from '../../types/script';
import { useRouter } from 'next/router';
import ExecutionAnalytics from '../../components/analytics/ExecutionAnalytics';
import NutritionDashboard from '../../pages/NutritionDashboard';
import ProfileDashboard from '../../pages/ProfileDashboard';
import DataDashboard from '../../pages/DataDashboard';
import WorkoutDashboard from '../../pages/WorkoutDashboard';
import SofiPage from '../../pages/Sofi';


// API base URL
const API_BASE_URL = 'http://localhost:8000';

interface ScriptManagerUIProps {
  initialTab?: string;
}

const ScriptManagerUI: React.FC<ScriptManagerUIProps> = ({ initialTab }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab || 'scripts');
  const [scriptLogs, setScriptLogs] = useState<{[key: number]: LogEntry[]}>({});
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
const [scripts, setScripts] = useState<any[]>([]);


  // Mock users - replace with real authentication
  const users: User[] = [
    { id: 1, username: 'admin', role: 'admin', permissions: ['scripts', 'users', 'logs'] },
    { id: 2, username: 'developer', role: 'developer', permissions: ['scripts', 'logs'] },
    { id: 3, username: 'viewer', role: 'viewer', permissions: ['logs'] }
  ];

useEffect(() => {
  if (initialTab && initialTab !== 'scripts') {
    setActiveTab(initialTab);
  }
}, [initialTab]);

useEffect(() => {
  if (currentUser) {
    fetchHistoricalLogs();
    fetchScripts();
  }
}, [currentUser]);
  
console.log('Script logs structure:', scriptLogs);

// Check for stored user on component mount
useEffect(() => {
  const storedUser = sessionStorage.getItem('currentUser');
  if (storedUser && !currentUser) {
    try {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      sessionStorage.removeItem('currentUser');
    }
  }
    // Set loading to false after checking
  setIsLoadingAuth(false);
}, [currentUser]);

 useEffect(() => {
  if (currentUser && activeTab === 'logs') {
    console.log('Logs tab activated, fetching fresh data');
    fetchHistoricalLogs();
  }
}, [currentUser, activeTab]);

  const fetchHistoricalLogs = async () => {
    if (!currentUser) return;
    
    try {
      console.log('Fetching historical logs...');
      const response = await fetch(`${API_BASE_URL}/api/logs/${currentUser.username}?hours=24`);
      if (response.ok) {
        const data = await response.json();
        console.log('Historical logs loaded:', data.logs);
        setScriptLogs(data.logs || {});
      } else {
        console.warn('Failed to fetch historical logs');
      }
    } catch (error) {
      console.error('Failed to fetch historical logs:', error);
    }
  };
  const fetchScripts = async () => {
  try {
    console.log('Fetching scripts...');  
    const response = await fetch(`${API_BASE_URL}/api/scripts`);
    if (response.ok) {
      const data = await response.json();
      console.log('Scripts loaded:', data.scripts);  
      setScripts(data.scripts || []);
    } else {
      console.error('Failed to fetch scripts:', response.status);  
    }
  } catch (error) {
    console.error('Failed to fetch scripts:', error);
  }
};

  const handleLogin = (credentials: LoginCredentials) => {
  const user = users.find(u => u.username === credentials.username);
  if (user && credentials.password === 'password123') {
    setCurrentUser(user);
    // Store user in sessionStorage for the script pages
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    // Immediately redirect to scripts page
    router.push('/scripts');
    return true;
  } else {
    
    alert('Wrong credentials. Use: admin/password123, developer/password123, or viewer/password123');
    return false;
  }
};

  const handleLogout = () => {
  setCurrentUser(null);
  setActiveTab('scripts');
  setScriptLogs({});
  sessionStorage.removeItem('currentUser');
};

  const canAccess = (permission: string): boolean => {
    return currentUser !== null && currentUser.permissions.includes(permission);
  };

  const downloadFile = async (fileName: string, filePath: string) => {
    if (!currentUser) return;

    try {
      console.log('Downloading file:', fileName, 'Path:', filePath);
      
      const response = await fetch(
        `${API_BASE_URL}/api/files/${currentUser.username}/download?file_path=${encodeURIComponent(filePath || fileName)}`
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorText = await response.text();
        console.error('Download error response:', errorText);
        alert(`Failed to download file: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

const getScriptNameById = (scriptId: string) => {
  const id = parseInt(scriptId);
  const script = scripts.find(s => s.id === id);
  return script ? script.name : `Script ${scriptId}`;
};

 if (isLoadingAuth) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

if (!currentUser) {
  return <LoginForm onLogin={handleLogin} />;
}

  return (
  <MainLayout
    currentUser={currentUser}
    activeTab={activeTab}
    onTabChange={setActiveTab}
    onRefresh={fetchHistoricalLogs}
    onLogout={handleLogout}
    canAccess={canAccess}
  >
      {/* Profile Tab */}
{activeTab === 'profile' && canAccess('users') && (
  <ProfileDashboard 
    currentUser={currentUser}
  />
)}

{/* Data Tab */}
{activeTab === 'data' && canAccess('scripts') && (
  <DataDashboard 
    currentUser={currentUser}
  />
)}

{/* Workouts Tab */}
{activeTab === 'workouts' && canAccess('scripts') && (
  <WorkoutDashboard 
    currentUser={currentUser}
  />
)}
{/* Sofi Tab */}
{activeTab === 'sofi' && canAccess('scripts') && (
  <SofiPage 
    currentUser={currentUser}
  />
)}
          
{/* Nutrition Tab */}
{activeTab === 'nutrition' && canAccess('scripts') && (
  <NutritionDashboard 
    currentUser={currentUser}
  />
)}
    </MainLayout>
  );
};

export default ScriptManagerUI;