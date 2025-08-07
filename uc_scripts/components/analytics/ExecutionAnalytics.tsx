import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle, XCircle, Activity } from 'lucide-react';
import { LogEntry } from '../../types/script';
import { User } from '../../types/auth';

const API_BASE_URL = 'http://localhost:8000';

interface ExecutionAnalyticsProps {
  currentUser: User;
  scriptLogs: {[key: number]: LogEntry[]};
  scripts: any[];
}

const ExecutionAnalytics: React.FC<ExecutionAnalyticsProps> = ({ 
  currentUser, 
  scriptLogs,
  scripts
}) => {
  console.log('Analytics - Scripts received:', scripts);  
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('24h');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<string>('personal');
const [teamLogs, setTeamLogs] = useState<{[key: string]: {[key: number]: LogEntry[]}}>({}); 
const [userFilter, setUserFilter] = useState<string>('all'); 
   

useEffect(() => {
  console.log('useEffect triggered, viewMode:', viewMode, 'isAdmin:', isAdmin());
  if (viewMode === 'team' && isAdmin()) {
    fetchTeamLogs();
  }
}, [viewMode]);

const isAdmin = () => {
  return currentUser.role === 'admin';
};

  // Calculate analytics metrics
const getAllLogs = () => {
  const logsWithScriptId: (LogEntry & { scriptId: number; username?: string })[] = [];
  
  if (viewMode === 'team' && isAdmin()) {
    // Team mode: combine logs from all users
    Object.entries(teamLogs).forEach(([username, userScriptLogs]) => {
      Object.entries(userScriptLogs).forEach(([scriptId, logs]) => {
        logs.forEach(log => {
          logsWithScriptId.push({
            ...log,
            scriptId: parseInt(scriptId),
            username: username
          });
        });
      });
    });
  } else {
    // Personal mode: use current user's logs
    Object.entries(scriptLogs).forEach(([scriptId, logs]) => {
      logs.forEach(log => {
        logsWithScriptId.push({
          ...log,
          scriptId: parseInt(scriptId)
        });
      });
    });
  }
  
  return logsWithScriptId;
};

  const allLogs = getAllLogs();

  // Debug logs to understand the data
  console.log('Analytics - Sample log message:', allLogs[0]?.message);  
  console.log('Analytics - All log messages:', allLogs.map(log => log.message)); 
  console.log('Analytics - First 3 scripts:', scripts.slice(0, 3));
  console.log('Analytics - Script IDs and names:', scripts.map(s => ({ id: s.id, name: s.name })));
console.log('Analytics - ScriptLogs structure:', Object.entries(scriptLogs).map(([scriptId, logs]) => ({ scriptId, logCount: logs.length })));

  

 const getScriptName = (log: any) => {
  if (log.scriptId) {
    const script = scripts.find(s => s.id === log.scriptId);
    return script ? script.name : `Script ${log.scriptId}`;
  }
  return log.message;
};



const fetchTeamLogs = async () => {
  if (!isAdmin()) return;


  
  try {
    console.log('Fetching team logs...');
    // For now, we'll fetch data for known users: admin, developer, viewer
    const users = ['admin', 'developer', 'viewer'];
    const teamData: {[key: string]: {[key: number]: LogEntry[]}} = {};
    
    for (const username of users) {
      const response = await fetch(`${API_BASE_URL}/api/logs/${username}?hours=24`);
      if (response.ok) {
        const data = await response.json();
        teamData[username] = data.logs || {};
      }
    }
    
    console.log('Team logs loaded:', teamData);
    console.log('Team logs keys:', Object.keys(teamData));
    setTeamLogs(teamData);
  } catch (error) {
    console.error('Failed to fetch team logs:', error);
  }
};

const getFilteredLogs = () => {
  let filtered = allLogs;

  // Status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter(log => log.status === statusFilter);
  }

  // Time filter
  if (timeFilter !== 'all') {
    const now = new Date();
    const timeLimit = new Date();
    
    switch (timeFilter) {
      case '1h':
        timeLimit.setHours(now.getHours() - 1);
        break;
      case '24h':
        timeLimit.setHours(now.getHours() - 24);
        break;
      case '7d':
        timeLimit.setDate(now.getDate() - 7);
        break;
    }
    
    filtered = filtered.filter(log => new Date(log.timestamp) >= timeLimit);
  }



  // Category filter
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(log => {
      if (log.scriptId) {
        const script = scripts.find(s => s.id === log.scriptId);
        return script?.category === categoryFilter;
      }
      return true;
    });
  }

    // User filter (only in team mode)
  if (viewMode === 'team' && userFilter !== 'all') {
    filtered = filtered.filter(log => log.username === userFilter);
  }

  // Sort
  if (sortBy === 'recent') {
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } else if (sortBy === 'oldest') {
    filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => getScriptName(a).localeCompare(getScriptName(b)));
  }

  return filtered;
};

const filteredLogs = getFilteredLogs();

const totalExecutions = filteredLogs.length;
  const successfulExecutions = filteredLogs.filter(log => log.status === 'success').length;
  const failedExecutions = filteredLogs.filter(log => log.status === 'error').length;
  const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions * 100).toFixed(1) : '0';
  
  
  
  return (
    <div className="space-y-6">
      {/* Admin View Toggle - Only for Admins */}
{isAdmin() && (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Analytics View</h3>
      <div className="flex space-x-2">
        <button
          onClick={() => setViewMode('personal')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'personal'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          My Analytics
        </button>
        <button
          onClick={() => setViewMode('team')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'team'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Team Analytics
        </button>
      </div>
    </div>
  </div>
)}
      {/* Filter Controls */}
<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Sorting</h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* Status Filter */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">All Status</option>
        <option value="success">Success Only</option>
        <option value="error">Errors Only</option>
      </select>
    </div>

    {/* Time Filter */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
      <select
        value={timeFilter}
        onChange={(e) => setTimeFilter(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">All Time</option>
        <option value="1h">Last Hour</option>
        <option value="24h">Last 24 Hours</option>
        <option value="7d">Last 7 Days</option>
      </select>
    </div>

    {/* Category Filter */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">All Categories</option>
        <option value="Data Collection">Data Collection</option>
        <option value="Reporting">Reporting</option>
        <option value="Monitoring">Monitoring</option>
        <option value="Maintenance">Maintenance</option>
        <option value="Troubleshooting">Troubleshooting</option>
      </select>
    </div>

    {/* Sort Options */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="recent">Most Recent</option>
        <option value="oldest">Oldest First</option>
        <option value="name">Script Name</option>
      </select>
    </div>
  </div>
</div>

 {/* User Filter - Only show in team mode */}
    {viewMode === 'team' && isAdmin() && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Users</option>
          <option value="admin">Admin</option>
          <option value="developer">Developer</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
    )}


      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Executions</p>
              <p className="text-2xl font-bold text-gray-900">{totalExecutions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-gray-900">{successfulExecutions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{failedExecutions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {viewMode === 'team' && (() => {
  console.log('Filtered logs for display:', filteredLogs.slice(-10).map(log => ({ username: log.username, message: getScriptName(log), status: log.status, timestamp: log.timestamp })));
  return null;
})()}

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No execution data available</p>
              <p className="text-sm">Run some scripts to see analytics</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.slice(viewMode === 'team' ? -20 : -10).map((log, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${
                    log.status === 'success' ? 'bg-green-100 text-green-600' :
                    log.status === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {log.status === 'success' ? <CheckCircle className="w-4 h-4" /> :
                     log.status === 'error' ? <XCircle className="w-4 h-4" /> :
                     <Clock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{getScriptName(log)}</p>
                    <p className="text-xs text-gray-500">
                      {log.timestamp}
                      {viewMode === 'team' && log.username && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {log.username}
                        </span>                        
                      )}
                    </p>  
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutionAnalytics;