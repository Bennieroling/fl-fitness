import React from 'react';
import Header from './Header';
import Navigation from './Navigation';
import { User } from '../../types/auth';

interface MainLayoutProps {
  currentUser: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefresh: () => void;
  onLogout: () => void;
  canAccess: (permission: string) => boolean;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  onRefresh,
  onLogout,
  canAccess,
  children
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentUser={currentUser}
        onRefresh={onRefresh}
        onLogout={onLogout}
      />
      
<div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
  <div className="relative z-10"> {/* Add z-index to ensure proper stacking */}
    <Navigation 
      activeTab={activeTab}
      onTabChange={onTabChange}
      canAccess={canAccess}
    />
    
    {children}
  </div>
</div>
    </div>
  );
};

export default MainLayout;