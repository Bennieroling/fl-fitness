import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  PhoneCall,
  PhoneOff,
  AlertTriangle
} from 'lucide-react';

interface StatusDashboardProps {
  currentUser: any;
  API_BASE_URL: string;
}

interface SystemHealth {
  total_phones: number;
  operational: number;
  degraded: number;
  offline: number;
  health_percent: number;
  status: string;
}

interface IssueItem {
  country: string;
  status: string;
  phone_number: string;
  last_failure: string;
  provider: string;
  source: string;
}

const TelephonyStatusDashboard: React.FC<StatusDashboardProps> = ({ currentUser, API_BASE_URL }) => {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [issuesData, setIssuesData] = useState<IssueItem[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const runStatusScript = async () => {
    if (!currentUser) return;
    setRefreshing(true);
    
    try {
      // Use script ID 5 to match the server.py configuration
      const response = await fetch(`${API_BASE_URL}/api/scripts/5/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.username,
          requester: currentUser.username,
          output_prefix: 'Telephony_Status'
        })
      });

      console.log("Status script response status:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("Script output received, length:", result.execution_log?.length || 0);
        console.log("Script output (first 100 chars):", result.execution_log?.substring(0, 100));
        
        parseScriptOutput(result.execution_log);
        setLastRefreshed(new Date());
      } else {
        const errorText = await response.text();
        console.error('Failed to run status script:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error running status script:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const parseScriptOutput = (output: string) => {
    if (!output) return;
    
    console.log("Parsing script output:", output);

    // Parse health JSON
    const healthMatch = output.match(/Health Summary \(JSON\):\s*({[\s\S]*?})/);
    if (healthMatch && healthMatch[1]) {
      try {
        const healthJson = JSON.parse(healthMatch[1]);
        console.log("Parsed health data:", healthJson);
        setHealthData(healthJson);
      } catch (e) {
        console.error('Failed to parse health JSON:', e);
      }
    } else {
      console.warn("No health summary JSON found in output");
    }

    // Parse issues table
    const issuesMatch = output.match(/Running daily_summary\.sql\.\.\.\s*([\s\S]*?)\(\d+ rows affected\)/);
    if (issuesMatch && issuesMatch[1]) {
      const issuesLines = issuesMatch[1].trim().split('\n');
      const issues: IssueItem[] = [];
      
      console.log("Issues lines:", issuesLines);
      
      issuesLines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 6) {
          issues.push({
            country: parts[0],
            status: parts[1],
            phone_number: parts[2],
            last_failure: parts[3],
            provider: parts[4],
            source: parts[5]
          });
        }
      });
      
      console.log("Parsed issues:", issues);
      setIssuesData(issues);
    } else {
      console.warn("No issues table found in output");
    }
  };

  // Run script on initial load
  useEffect(() => {
    if (currentUser) {
      runStatusScript();
    }
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'offline':
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRowStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'green':
        return 'border-l-4 border-green-500 bg-green-50';
      case 'yellow':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'red':
        return 'border-l-4 border-red-500 bg-red-50';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading telephony status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Telephony System Status</h2>
        <div className="flex items-center space-x-4">
          {lastRefreshed && (
            <span className="text-sm text-gray-500">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={runStatusScript}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Health Status Cards */}
      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Overall Status */}
          <div className="bg-white rounded-lg shadow p-5 border-t-4 border-blue-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">System Status</p>
                <p className="text-xl font-bold mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(healthData.status)}`}>
                    {getStatusIcon(healthData.status)}
                    <span className="ml-1">{healthData.status}</span>
                  </span>
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-full">
                <PhoneCall className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{healthData.health_percent}%</p>
            <p className="text-sm text-gray-500">Overall health</p>
          </div>

          {/* Total Phone Numbers */}
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Phone Numbers</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{healthData.total_phones}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-full">
                <PhoneCall className="w-6 h-6 text-gray-500" />
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <div>
                <p className="text-sm text-gray-500">Operational</p>
                <p className="text-lg font-semibold text-green-600">{healthData.operational}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Degraded</p>
                <p className="text-lg font-semibold text-yellow-600">{healthData.degraded}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Offline</p>
                <p className="text-lg font-semibold text-red-600">{healthData.offline}</p>
              </div>
            </div>
          </div>

          {/* Operational Phones */}
          <div className="bg-white rounded-lg shadow p-5 border-t-4 border-green-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Operational</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{healthData.operational}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${(healthData.operational / healthData.total_phones) * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {((healthData.operational / healthData.total_phones) * 100).toFixed(1)}% of total
            </p>
          </div>

          {/* Offline Phones */}
          <div className="bg-white rounded-lg shadow p-5 border-t-4 border-red-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Offline</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{healthData.offline}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-full">
                <PhoneOff className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-500 h-2.5 rounded-full" 
                  style={{ width: `${(healthData.offline / healthData.total_phones) * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {((healthData.offline / healthData.total_phones) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>
      )}

      {/* Issues Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Issues</h3>
          <p className="text-sm text-gray-500 mt-1">
            Showing {issuesData.length} phone numbers with issues
          </p>
        </div>
        
        {issuesData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Failure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issuesData.map((issue, index) => (
                  <tr key={index} className={getRowStatusColor(issue.status)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {issue.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {issue.status === 'red' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Offline
                        </span>
                      ) : issue.status === 'yellow' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Degraded
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Operational
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {issue.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(issue.last_failure).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {issue.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {issue.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-gray-500">No issues found. All systems operational.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelephonyStatusDashboard;