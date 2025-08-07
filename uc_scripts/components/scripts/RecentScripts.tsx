import React, { useState, useEffect } from 'react';
import { Clock, Play, FileText } from 'lucide-react';
import { Script, LogEntry } from '../../types/script';
import { User } from '../../types/auth';

interface RecentScriptsProps {
  currentUser: User;
  scripts: Script[];
  API_BASE_URL: string;
  onRunScript: (scriptId: number, scriptName: string) => void;
  onViewScript: (categoryId: string, scriptId: number) => void;
}

interface RecentScript {
  script: Script;
  lastRun: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

const RecentScripts: React.FC<RecentScriptsProps> = ({ 
  currentUser, 
  scripts, 
  API_BASE_URL, 
  onRunScript, 
  onViewScript 
}) => {
  const [recentScripts, setRecentScripts] = useState<RecentScript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchRecentScripts();
    }
  }, [currentUser]);

  const fetchRecentScripts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logs/${currentUser.username}?hours=168`); // 7 days
      if (response.ok) {
        const data = await response.json();
        processRecentScripts(data.logs || {});
      }
    } catch (error) {
      console.error('Error fetching recent scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const processRecentScripts = (logs: { [key: string]: LogEntry[] }) => {
    const scriptMap = new Map<number, RecentScript>();

    // Process logs to find most recent execution per script
    Object.entries(logs).forEach(([scriptIdStr, scriptLogs]) => {
      const scriptId = parseInt(scriptIdStr);
      const script = scripts.find(s => s.id === scriptId);
      
      if (script && scriptLogs.length > 0) {
        // Get the most recent log entry
        const sortedLogs = scriptLogs.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        const latestLog = sortedLogs[0];

        scriptMap.set(scriptId, {
          script,
          lastRun: latestLog.timestamp,
          status: latestLog.status,
          message: latestLog.message
        });
      }
    });

    // Convert to array and sort by most recent
    const recent = Array.from(scriptMap.values())
      .sort((a, b) => new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime())
      .slice(0, 5); // Top 5 recent scripts

    setRecentScripts(recent);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryId = (script: Script) => {
    return script.category.toLowerCase().replace(/\s+/g, '-');
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scripts</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recentScripts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scripts</h3>
        <div className="text-center py-6 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No recent script executions</p>
          <p className="text-sm">Scripts you run will appear here for quick access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Scripts</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-3">
        {recentScripts.map((item) => (
          <div key={item.script.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 truncate">{item.script.name}</h4>
                  <p className="text-sm text-gray-600 truncate">{item.script.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(item.lastRun)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onViewScript(getCategoryId(item.script), item.script.id)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="View script details"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => onRunScript(item.script.id, item.script.name)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                title="Run script again"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentScripts;