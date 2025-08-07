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
      {/* Logs Tab */}
      {activeTab === 'logs' && canAccess('logs') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Script Execution Logs</h2>            
          </div>
          <div className="p-6">
            {Object.keys(scriptLogs).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Terminal className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No logs available. Run some scripts to see execution history.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(scriptLogs).map(([scriptId, logs]) => {
                  return (
                    <div key={scriptId} className="border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">{getScriptNameById(scriptId)}</h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {(logs as LogEntry[]).slice(-10).map((log, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-start space-x-3 text-sm">
                              {getStatusIcon(log.status)}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-900">{log.message}</span>
                                </div>
                                <span className="text-gray-500 text-xs">{log.timestamp}</span>
                              </div>
                            </div>
                            {log.files && log.files.length > 0 && (
                              <div className="ml-7 p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs font-medium text-gray-700 mb-2">Generated Files:</p>
                                <div className="space-y-1">
                                  {log.files.map((file: any, fileIndex: number) => (
                                    <div key={fileIndex} className="flex items-center justify-between">
                                      <span className="text-xs text-gray-600">{file.name}</span>
                                      <button
                                        onClick={() => downloadFile(file.name, file.path)}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                      >
                                        Download
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {log.output && (
                              <div className="ml-7 bg-gray-900 text-green-400 p-2 rounded text-xs font-mono max-h-32 overflow-y-auto whitespace-pre-wrap">
                                {log.output.slice(0, 500)}{log.output.length > 500 ? '...' : ''}
                                
                                {log.output.includes('+') && log.output.includes('|') && log.output.includes('=') && (
                                  <div className="mt-2">
                                    <button
                                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                                      onClick={() => {
                                        const win = window.open('', '_blank');
                                        if (win) {
                                          win.document.write(`
                                            <html>
                                              <head>
                                                <title>Table Output</title>
                                                <style>
                                                  body { font-family: Arial, sans-serif; padding: 20px; }
                                                  .table-container { overflow-x: auto; margin-top: 20px; }
                                                  table { border-collapse: collapse; width: 100%; }
                                                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                                  tr:nth-child(even) { background-color: #f2f2f2; }
                                                  th { background-color: #4CAF50; color: white; }
                                                </style>
                                              </head>
                                              <body>
                                                <h2>Table Output</h2>
                                                <pre>${log.output}</pre>
                                              </body>
                                            </html>
                                          `);
                                          win.document.close();
                                        }
                                      }}
                                    >
                                      <Table className="w-3 h-3" />
                                      <span>View as Table</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Telephony Status Tab */}
      {activeTab === 'telephony' && canAccess('scripts') && (
        <TelephonyStatusDashboard currentUser={currentUser} API_BASE_URL={API_BASE_URL} />
      )}

      {/* Users Tab */}
      {activeTab === 'users' && canAccess('users') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'developer' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.permissions.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Analytics Tab */}
{activeTab === 'analytics' && canAccess('scripts') && (
  <ExecutionAnalytics 
    currentUser={currentUser}
    scriptLogs={scriptLogs}
    scripts={scripts}
  />
)}
    </MainLayout>
  );
};

export default ScriptManagerUI;