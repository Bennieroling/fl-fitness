import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CategoryOverview from '../../components/scripts/CategoryOverview';
import MainLayout from '../../components/layout/MainLayout';
import { User } from '../../types/auth';
import { Script } from '../../types/script';
import LoginForm from '../../components/auth/LoginForm';
import { LogEntry } from '../../types/script';
import RecentScripts from '../../components/scripts/RecentScripts';
import FavoriteScripts from '../../components/scripts/FavoriteScripts';



// API base URL
const API_BASE_URL = 'http://localhost:8000';

const ScriptsIndexPage: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [scriptLogs, setScriptLogs] = useState<{[key: number]: LogEntry[]}>({});
  const [outputViewMode, setOutputViewMode] = useState<{[key: number]: 'terminal' | 'table'}>({});
  const [scriptFiles, setScriptFiles] = useState<{[key: number]: any[]}>({});



  // Get user from localStorage or session (you'll need to implement proper auth state management)
useEffect(() => {
  const checkAuth = () => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        sessionStorage.removeItem('currentUser');
        router.push('/');
      }
    } else {
      router.push('/');
    }
    // Set loading to false after checking
    setIsLoadingAuth(false);
  };

  const timer = setTimeout(checkAuth, 100);
  return () => clearTimeout(timer);
}, [router]);

  // Fetch scripts
  useEffect(() => {
    if (currentUser) {
      fetchScripts();
    }
  }, [currentUser]);

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/scripts`);
      if (response.ok) {
        const data = await response.json();
        setScripts(data.scripts || []);
      }
    } catch (error) {
      console.error('Failed to fetch scripts:', error);
    } finally {
      setLoading(false);
    }
  };
  // Fetch historical logs and state when user is set
useEffect(() => {
  if (currentUser) {
    fetchHistoricalLogs();
  }
}, [currentUser]);

const fetchHistoricalLogs = async () => {
  if (!currentUser) return;
  
  try {
    console.log('Fetching historical logs for user:', currentUser.username);
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
// Separate useEffect for periodic file fetching
useEffect(() => {
  if (currentUser && scripts.length > 0) {
    const interval = setInterval(() => {
      fetchAllScriptFiles();
    }, 10000);
    return () => clearInterval(interval);
  }
}, [currentUser, scripts.length]);

const fetchAllScriptFiles = async () => {
  if (!currentUser) return;
  
  for (const script of scripts) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/files/${currentUser.username}?script_id=${script.id}`);
      if (response.ok) {
        const data = await response.json();
        setScriptFiles(prev => ({
          ...prev,
          [script.id]: data.files || []
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch files for script ${script.id}:`, error);
    }
  }
};
const reloadConfiguration = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reload-config`, {
      method: 'POST'
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Configuration reloaded:', result.message);
      // Refresh scripts after reload
      await fetchScripts();
    } else {
      console.error('Failed to reload configuration');
    }
  } catch (error) {
    console.error('Error reloading configuration:', error);
  }
};
  const handleCategoryClick = (categoryId: string) => {
    router.push(`/scripts/${categoryId}`);
  };

  const handleLogout = () => {
  setCurrentUser(null);
  sessionStorage.removeItem('currentUser');
  router.push('/');
};

const handleRunScript = (scriptId: number, scriptName: string) => {
  // Navigate to the appropriate category page
  const script = scripts.find(s => s.id === scriptId);
  if (script) {
    const categoryId = script.category.toLowerCase().replace(/\s+/g, '-');
    router.push(`/scripts/${categoryId}`);
  }
};

const handleViewScript = (categoryId: string, scriptId: number) => {
  router.push(`/scripts/${categoryId}#script-${scriptId}`);
};
  const canAccess = (permission: string): boolean => {
    return currentUser !== null && currentUser.permissions.includes(permission);
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
  return <LoginForm onLogin={(credentials) => {
    const users: User[] = [
      { id: 1, username: 'admin', role: 'admin', permissions: ['scripts', 'users', 'logs'] },
      { id: 2, username: 'developer', role: 'developer', permissions: ['scripts', 'logs'] },
      { id: 3, username: 'viewer', role: 'viewer', permissions: ['logs'] }
    ];
    
    const user = users.find(u => u.username === credentials.username);
    if (user && credentials.password === 'password123') {
      setCurrentUser(user);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } else {
      alert('Wrong credentials. Use: admin/password123, developer/password123, or viewer/password123');
      return false;
    }
  }} />;
}

  return (
    <MainLayout
  currentUser={currentUser}
  activeTab="scripts"
  onTabChange={(tab) => {
    if (tab === 'scripts') return;
    if (tab === 'logs') window.location.href = '/?tab=logs';
    if (tab === 'telephony') window.location.href = '/?tab=telephony';
    if (tab === 'users') window.location.href = '/?tab=users';
  }}
  onRefresh={() => {
    fetchScripts();
    reloadConfiguration();
  }}
  onLogout={handleLogout}
  canAccess={canAccess}
>
      {loading ? (
  <div className="text-center py-8 text-gray-500">
    Loading scripts from API...
  </div>
) : (
  <div className="space-y-8">
      {/* Favorite Scripts Section */}
    <FavoriteScripts
      currentUser={currentUser}
      scripts={scripts}
      onRunScript={handleRunScript}
      onViewScript={handleViewScript}
    />
    
    {/* Category Overview */}
    <CategoryOverview 
      scripts={scripts}
      onCategoryClick={handleCategoryClick}
      API_BASE_URL={API_BASE_URL}
    />

{/* Recent Scripts Section */}
    <RecentScripts
      currentUser={currentUser}
      scripts={scripts}
      API_BASE_URL={API_BASE_URL}
      onRunScript={handleRunScript}
      onViewScript={handleViewScript}
    />
    
  </div>
)}
    </MainLayout>
  );
};

export default ScriptsIndexPage;