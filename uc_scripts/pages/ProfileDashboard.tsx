import React, { useState } from 'react';
import { User } from '../types/auth';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface ProfileDashboardProps {
  currentUser: User;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ currentUser }) => {
  const [selectedUnit, setSelectedUnit] = useState<'KG' | 'LB'>('KG');
  const [currentWeight, setCurrentWeight] = useState(70);
  const [targetWeight, setTargetWeight] = useState(65);
  const [age, setAge] = useState(24);

  // Mock profile data
  const profileData = {
    name: 'John Watson',
    weight: 70,
    goal: 65,
    height: 165,
    location: 'India',
    email: 'john.watson@gmail.com',
    theme: 'Light'
  };

  const ProfileField = ({ label, value, showChange = false, onChange }: {
    label: string;
    value: string | number;
    showChange?: boolean;
    onChange?: () => void;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
        <div className="bg-gray-100 px-3 py-2 rounded-lg text-gray-900">
          {value}
        </div>
      </div>
      {showChange && (
        <button 
          onClick={onChange}
          className="ml-4 px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors flex items-center"
        >
          CHANGE
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
            </div>
            
            <div className="p-6">
              {/* Profile Avatar and Name */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👨🏻‍💼</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{profileData.name}</h3>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="space-y-4">
                <ProfileField label="Name" value={profileData.name} />
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 mb-1">Age</div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setAge(Math.max(18, age - 1))}
                        className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                      >
                        −
                      </button>
                      <div className="bg-gray-100 px-4 py-2 rounded-lg text-gray-900 min-w-[60px] text-center">
                        {age}
                      </div>
                      <button 
                        onClick={() => setAge(age + 1)}
                        className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <ProfileField 
                  label="Weight" 
                  value={`${profileData.weight} kg`} 
                  showChange={true}
                />
                
                <ProfileField 
                  label="Set your Goal" 
                  value={`${profileData.goal} kg`} 
                  showChange={true}
                />
                
                <ProfileField 
                  label="Height" 
                  value={`${profileData.height} cm`} 
                  showChange={true}
                />
                
                <ProfileField 
                  label="Location" 
                  value={profileData.location} 
                />
                
                <ProfileField 
                  label="Email" 
                  value={profileData.email} 
                />
                
             
              </div>

              
            </div>
          </div>

          {/* Weight Change Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Change Your Weight</h2>
            </div>
            
            <div className="p-6">
              {/* Unit Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-8 w-fit">
                <button 
                  onClick={() => setSelectedUnit('KG')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    selectedUnit === 'KG' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  KG
                </button>
                <button 
                  onClick={() => setSelectedUnit('LB')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    selectedUnit === 'LB' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  LB
                </button>
              </div>

              {/* Weight Visualization */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative">
                  {/* Circular progress indicator */}
                  <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#f3f4f6" 
                      strokeWidth="8"
                    />
                    {/* Progress circle with gradient effect */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="url(#weightGradient)" 
                      strokeWidth="8"
                      strokeDasharray={`${(currentWeight / 100) * 283} 283`}
                      strokeLinecap="round"
                    />
                    
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="weightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Center text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900">{currentWeight}KG</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Slider */}
              <div className="mb-8">
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #ec4899 50%, #8b5cf6 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>40kg</span>
                  <span>120kg</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4">
                <button className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                  UPDATE WEIGHT
                </button>
                <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default ProfileDashboard;