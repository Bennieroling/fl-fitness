import React from 'react';
import { useRouter } from 'next/router';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  canAccess: (permission: string) => boolean;
}

interface TabItem {
  id: string;
  label: string;
  permission: string;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, canAccess }) => {
  const router = useRouter();
  
  const tabs: TabItem[] = [
  { id: 'nutrition', label: 'Nutrition', permission: 'scripts' },
  { id: 'workouts', label: 'Workouts', permission: 'scripts' },
  { id: 'data', label: 'Data', permission: 'scripts' },
  { id: 'profile', label: 'Profile', permission: 'scripts' },
  { id: 'sofi', label: 'Sofi', permission: 'scripts' }
];

 const handleTabClick = (tab: TabItem) => {
  // Store current user before navigation to ensure it persists
  const currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = '/';
    return;
  }

  if (tab.id === 'sofi') {
    window.location.href = '/sofi';
  } else {
    window.location.href = `/?tab=${tab.id}`;
  }
};

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (router.pathname.startsWith('/sofi')) {
      return 'sofi';
    }
    return activeTab;
  };

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
      {tabs.map((tab) => 
        canAccess(tab.permission) && (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              getActiveTab() === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        )
      )}
    </div>
  );
};

export default Navigation;