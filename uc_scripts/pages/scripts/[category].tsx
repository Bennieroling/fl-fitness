import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ScriptCard from '../../components/scripts/ScriptCard';
import MainLayout from '../../components/layout/MainLayout';
import { User } from '../../types/auth';
import { Script, LogEntry } from '../../types/script';
import LoginForm from '../../components/auth/LoginForm';
import SearchBar from '../../components/common/SearchBar';



// API base URL
const API_BASE_URL = 'http://localhost:8000';

const CategoryDetailPage: React.FC = () => {
  const router = useRouter();
  const { category } = router.query;
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningScripts, setRunningScripts] = useState<{[key: number]: boolean}>({});
  const [scriptOutputs, setScriptOutputs] = useState<{[key: number]: string}>({});
  const [scriptFiles, setScriptFiles] = useState<{[key: number]: any[]}>({});
  const [scriptLogs, setScriptLogs] = useState<{[key: number]: LogEntry[]}>({});
  const [scriptInputs, setScriptInputs] = useState<{ [key: number]: { [key: string]: string } }>({});
  const [hasTableOutput, setHasTableOutput] = useState<{[key: number]: boolean}>({});
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [outputViewMode, setOutputViewMode] = useState<{[key: number]: 'terminal' | 'table'}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);




  // Get user from localStorage or session
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
        let scriptsData = data.scripts || [];
        
        // Process scripts (same logic as before)
        scriptsData.forEach((script: Script) => {
          if (script.inputs && !Array.isArray(script.inputs)) {
            script.inputs = [script.inputs];
          }
        });
        
        setScripts(scriptsData);
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
    loadFavorites();
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
 const getFilteredScripts = () => {
  const categoryMap: { [key: string]: string[] } = {
    'data-collection': ['Data Collection'],
    'monitoring': ['Monitoring'],
    'reporting': ['Reporting'],
    'maintenance': ['Maintenance'],
    'troubleshooting': ['Troubleshooting'],
    'other': scripts
      .map(s => s.category)
      .filter(cat => !['Data Collection', 'Monitoring', 'Reporting', 'Maintenance', 'Troubleshooting'].includes(cat))
  };
  
  const allowedCategories = categoryMap[category as string] || [];
  let filtered = scripts.filter(script => allowedCategories.includes(script.category));
  
  // Apply search filter
  if (searchQuery.trim()) {
    filtered = filtered.filter(script =>
      script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.file.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  return filtered;
};

  const getCategoryTitle = () => {
    const titleMap: { [key: string]: string } = {
      'data-collection': 'Data Collection Scripts',
      'monitoring': 'Monitoring & Health Scripts',
      'reporting': 'Reporting Scripts',
      'maintenance': 'Maintenance Scripts',
      'troubleshooting': 'Troubleshooting Scripts',
      'other': 'Other Scripts'
    };
    return titleMap[category as string] || 'Scripts';
  };

  // All your existing script functions (runScript, stopScript, etc.)
  const runScript = async (scriptId: number, scriptName: string) => {
    if (!currentUser) return;

    setRunningScripts(prev => ({ ...prev, [scriptId]: true }));
    setScriptOutputs(prev => ({ ...prev, [scriptId]: 'Starting script execution...\n' }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/scripts/${scriptId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.username,
          requester: currentUser.username,
          output_prefix: `Script_${scriptName}`,
          inputs: scriptInputs[scriptId] || {}
        })
      });

      const result = await response.json();
      
      const logEntry: LogEntry = {
  timestamp: new Date().toLocaleString(),
  status: response.ok && result.status === 'success' ? 'success' : 'error',
  message: response.ok ? result.message : `HTTP ${response.status}: ${result.message || 'Unknown error'}`,
  files: result.files || [],
  output: result.execution_log || ''
};

// Add to logs
setScriptLogs(prev => ({
  ...prev,
  [scriptId]: [...(prev[scriptId] || []), logEntry]
}));

// Save to backend
try {
  await fetch(`${API_BASE_URL}/api/logs/${currentUser.username}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      script_id: scriptId,
      status: logEntry.status,
      message: logEntry.message,
      files: logEntry.files,
      output: logEntry.output
    })
  });
} catch (error) {
  console.error('Failed to save log to backend:', error);
}

if (response.ok) {
  setScriptOutputs(prev => ({ 
    ...prev, 
    [scriptId]: result.execution_log || 'Script completed successfully.' 
  }));
  
  setScriptFiles(prev => ({ 
    ...prev, 
    [scriptId]: result.files || [] 
  }));
  
  const hasTable = result.execution_log && 
    (result.execution_log.includes('### TABLE_OUTPUT_BEGIN ###') ||
     result.execution_log.includes('+') && 
     result.execution_log.includes('│') && 
     (result.execution_log.includes('═') || result.execution_log.includes('─')));
  
  setHasTableOutput(prev => ({ ...prev, [scriptId]: hasTable }));
} else {
        setScriptOutputs(prev => ({ 
          ...prev, 
          [scriptId]: `ERROR: ${result.message || 'Unknown error'}` 
        }));
      }
    } catch (error) {
      setScriptOutputs(prev => ({ 
        ...prev, 
        [scriptId]: `ERROR: Failed to execute script\n${error}` 
      }));
    } finally {
      setRunningScripts(prev => ({ ...prev, [scriptId]: false }));
    }
  };

  const stopScript = async (scriptId: number, scriptName: string) => {
    if (!currentUser) return;
    
    try {
      await fetch(`${API_BASE_URL}/api/scripts/${scriptId}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.username })
      });
      
      setRunningScripts(prev => ({ ...prev, [scriptId]: false }));
      setScriptOutputs(prev => ({ 
        ...prev, 
        [scriptId]: (prev[scriptId] || '') + '\n\n=== SCRIPT STOPPED BY USER ===\n' 
      }));
    } catch (error) {
      console.error('Failed to stop script:', error);
    }
  };

  const handleInputChange = (scriptId: number, key: string, value: string) => {
    setScriptInputs((prev) => ({
      ...prev,
      [scriptId]: {
        ...(prev[scriptId] || {}),
        [key]: value,
      },
    }));
  };

  const downloadFile = async (fileName: string, filePath: string) => {
    if (!currentUser) return;

    try {
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
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isFileRecent = (modifiedDate: string): boolean => {
    const fileDate = new Date(modifiedDate);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    return fileDate >= twentyFourHoursAgo;
  };
const loadFavorites = () => {
  if (!currentUser) return;
  const key = `favorites_${currentUser.username}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      setFavoriteIds(JSON.parse(stored));
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavoriteIds([]);
    }
  }
};

const saveFavorites = (newFavorites: number[]) => {
  if (!currentUser) return;
  const key = `favorites_${currentUser.username}`;
  localStorage.setItem(key, JSON.stringify(newFavorites));
  setFavoriteIds(newFavorites);
};

const toggleFavorite = (scriptId: number) => {
  const newFavorites = favoriteIds.includes(scriptId)
    ? favoriteIds.filter(id => id !== scriptId)
    : [...favoriteIds, scriptId];
  saveFavorites(newFavorites);
};
  const handleLogout = () => {
  setCurrentUser(null);
  sessionStorage.removeItem('currentUser');
  router.push('/');
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

  const filteredScripts = getFilteredScripts();

  return (
    <MainLayout
      currentUser={currentUser}
      activeTab="scripts"
      onTabChange={(tab) => {
  if (tab === 'scripts') router.push('/scripts');
  if (tab === 'logs') router.push('/?tab=logs');
  if (tab === 'telephony') router.push('/?tab=telephony');
  if (tab === 'users') router.push('/?tab=users');
}}
      onRefresh={fetchScripts}
      onLogout={handleLogout}
      canAccess={canAccess}
    >
      <div>
        {/* Back button */}
        <div className="mb-6">
          <Link href="/scripts" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Categories</span>
          </Link>
        </div>
        
        {/* Category header */}
<div className="mb-6">
  <h2 className="text-2xl font-bold text-gray-900 mb-2">{getCategoryTitle()}</h2>
  <p className="text-gray-600 mb-4">
    {getFilteredScripts().length} {getFilteredScripts().length === 1 ? 'script' : 'scripts'} available
  </p>
  
  {/* Search Bar */}
  <SearchBar 
    placeholder="Search scripts in this category..."
    onSearch={setSearchQuery}
    className="max-w-md"
  />
</div>

{searchQuery && (
  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
    <p className="text-sm text-blue-700">
      Showing {getFilteredScripts().length} scripts matching "{searchQuery}"
    </p>
  </div>
)}
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading scripts...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredScripts.map((script) => (
              <ScriptCard
                key={script.id}
                script={script}
                currentUser={currentUser}
                isRunning={runningScripts[script.id] || false}
                scriptOutput={scriptOutputs[script.id]}
                scriptFiles={scriptFiles[script.id] || []}
                hasTableOutput={hasTableOutput[script.id] || false}
                scriptInputs={scriptInputs[script.id] || {}}
                onRun={runScript}
                onStop={stopScript}
                onInputChange={handleInputChange}
                onDownloadFile={downloadFile}
                formatFileSize={formatFileSize}
                isFileRecent={isFileRecent}
                isFavorite={favoriteIds.includes(script.id)}
                onToggleFavorite={toggleFavorite}             
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CategoryDetailPage;