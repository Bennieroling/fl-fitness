import React from 'react';
import { Terminal, RefreshCw, LogOut } from 'lucide-react';
import { User } from '../../types/auth';

interface HeaderProps {
  currentUser: User;
  onRefresh: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onRefresh, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center">
              <Terminal className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Script Manager</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh files"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">{currentUser.username}</span>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{currentUser.role}</span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;