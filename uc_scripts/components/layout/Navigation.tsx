import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  canAccess: (permission: string) => boolean;
}

interface TabItem {
  id: string;
  label: string;
  shortLabel: string; // For mobile
  permission: string;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, canAccess }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const tabs: TabItem[] = [
    { id: 'nutrition', label: 'Nutrition', shortLabel: 'nutrition', permission: 'scripts' },
    { id: 'sofi', label: 'Sofi', shortLabel: 'Sofi', permission: 'scripts' },
    { id: 'data', label: 'Data', shortLabel: 'Data', permission: 'scripts' },
    { id: 'profile', label: 'Profile', shortLabel: 'Profile', permission: 'logs' },
    { id: 'workouts', label: 'Workouts', shortLabel: 'Workouts', permission: 'scripts' },
  ];

  const handleTabClick = (tab: TabItem) => {
    setMobileMenuOpen(false); // Close mobile menu on selection
    
    // Store current user before navigation to ensure it persists
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
      window.location.href = '/';
      return;
    }

    if (tab.id === 'scripts') {
      window.location.href = '/scripts';
    } else {
      window.location.href = `/?tab=${tab.id}`;
    }
  };

// Determine active tab based on current route
const getActiveTab = () => {
  if (router.pathname.startsWith('/scripts')) {
    return 'scripts';
  }
  return activeTab;
};

  const accessibleTabs = tabs.filter(tab => canAccess(tab.permission));

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden sm:flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
        {accessibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`px-4 lg:px-6 py-2 rounded-md font-medium transition-colors text-sm lg:text-base ${
              getActiveTab() === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile Navigation */}
<div className="sm:hidden mb-6 relative">
  {/* Mobile Menu Button */}
  <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-200">
    <div className="font-medium text-gray-900">
      {accessibleTabs.find(tab => getActiveTab() === tab.id)?.label || 'Menu'}
    </div>
    <button
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
    >
      {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  </div>

  {/* Mobile Menu Dropdown */}
  {mobileMenuOpen && (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={() => setMobileMenuOpen(false)}
      />
      
      {/* Menu Panel - Fixed positioning */}
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
        <div className="py-2">
          {accessibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`w-full text-left px-4 py-3 text-base font-medium transition-colors touch-manipulation ${
                getActiveTab() === tab.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )}
</div>
    </>
  );
};

export default Navigation;