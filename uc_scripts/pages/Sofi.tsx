import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Target, X } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { User } from '../types/auth';
import LoginForm from '../components/auth/LoginForm';

const SofiPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weeklyTarget, setWeeklyTarget] = useState<number>(14000); // Default 2000 cal/day * 7 days
const [selectedDay, setSelectedDay] = useState<Date | null>(null);
const [dayData, setDayData] = useState<any>(null);
  

  // Auth logic (same pattern as your other pages)
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
    setIsLoadingAuth(false);
  }, [currentUser]);

  const canAccess = (permission: string) => {
    return currentUser?.permissions.includes(permission) || false;
  };

  if (isLoadingAuth) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <LoginForm onLogin={() => {}} users={users} />;
  }

  return (
    
      <div className="space-y-6">
        {/* Weekly Target Section - Mobile responsive */}
<div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
  <div className="flex items-center justify-between mb-3 sm:mb-4">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
      <Target className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
      <span className="hidden sm:inline">Weekly Calorie Target</span>
      <span className="sm:hidden">Weekly Target</span>
    </h2>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
        Total Weekly Target (Calories)
      </label>
      <input
        type="number"
        value={weeklyTarget}
        onChange={(e) => setWeeklyTarget(Number(e.target.value))}
        className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="14000"
      />
    </div>
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
        Daily Average
      </label>
      <div className="px-2 sm:px-3 py-2 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-md text-gray-600">
        {Math.round(weeklyTarget / 7)} calories/day
      </div>
    </div>
  </div>
</div>
{/* Calendar Section - Adaptive Mobile/Desktop */}
<div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-200">
  <div className="flex items-center justify-between mb-4 sm:mb-6">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
      <span className="block sm:hidden">
        Week of {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
      <span className="hidden sm:block">
        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </span>
    </h2>
    <div className="flex space-x-1 sm:space-x-2">
      <button
        onClick={() => {
          const days = window.innerWidth < 640 ? 7 : 30;
          setCurrentDate(new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000));
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => {
          const days = window.innerWidth < 640 ? 7 : 30;
          setCurrentDate(new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000));
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </div>

  {/* Mobile: Weekly View */}
  <div className="block sm:hidden">
    <div className="grid grid-cols-1 gap-3">
      {(() => {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        
        const days = [];
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          const isToday = day.toDateString() === new Date().toDateString();
          
          // Mock data
          const mockCalories = Math.floor(Math.random() * 3000);
          const mockMood = Math.floor(Math.random() * 11);
          
          days.push(
            <div 
              key={i}
              onClick={() => {
                setSelectedDay(day);
                setDayData({
                  totalCalories: mockCalories,
                  mood: mockMood,
                  notes: '',
                  entries: []
                });
              }}
              className={`
                p-4 border-2 rounded-xl min-h-[100px] 
                hover:bg-gray-50 active:bg-gray-100 cursor-pointer 
                transition-all duration-200 touch-manipulation
                ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              `}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm text-gray-500 font-medium">
                    {day.toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                  <div className={`text-2xl font-bold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {mockCalories} cal
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Mood</div>
                <div className={`flex items-center text-lg font-semibold ${
                  mockMood >= 8 ? 'text-green-500' :
                  mockMood >= 6 ? 'text-yellow-500' :
                  mockMood >= 4 ? 'text-orange-500' :
                  'text-red-500'
                }`}>
                  <span className="text-xl mr-2">
                    {mockMood >= 8 ? '😊' : mockMood >= 6 ? '🙂' : mockMood >= 4 ? '😐' : '😔'}
                  </span>
                  {mockMood}/10
                </div>
              </div>
            </div>
          );
        }
        return days;
      })()}
    </div>
  </div>

  {/* Desktop: Monthly Grid View */}
  <div className="hidden sm:block">
    <div className="grid grid-cols-7 gap-2">
      {/* Day headers */}
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
        <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - (firstDay.getDay() || 7) + 1);
        
        const days = [];
        for (let i = 0; i < 42; i++) {
          const day = new Date(startDate);
          day.setDate(startDate.getDate() + i);
          const isCurrentMonth = day.getMonth() === month;
          const isToday = day.toDateString() === new Date().toDateString();
          
          // Mock data
          const mockCalories = isCurrentMonth ? Math.floor(Math.random() * 3000) : 0;
          const mockMood = isCurrentMonth ? Math.floor(Math.random() * 11) : null;
          
          days.push(
            <div 
              key={i}
              onClick={() => {
                if (isCurrentMonth) {
                  setSelectedDay(day);
                  setDayData({
                    totalCalories: mockCalories,
                    mood: mockMood,
                    notes: '',
                    entries: []
                  });
                }
              }}
              className={`
                p-2 border border-gray-200 rounded-lg min-h-[100px]
                hover:bg-gray-50 cursor-pointer transition-colors
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
              `}
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                {day.getDate()}
              </div>
              
              <div className="text-xs text-green-600 mb-1">
                {mockCalories > 0 ? `${mockCalories} cal` : '0 cal'}
              </div>
              
              {mockMood !== null && (
                <div className={`text-xs font-medium flex items-center ${
                  mockMood >= 8 ? 'text-green-500' :
                  mockMood >= 6 ? 'text-yellow-500' :
                  mockMood >= 4 ? 'text-orange-500' :
                  'text-red-500'
                }`}>
                  <span className="mr-1">
                    {mockMood >= 8 ? '😊' : mockMood >= 6 ? '🙂' : mockMood >= 4 ? '😐' : '😔'}
                  </span>
                  {mockMood}/10
                </div>
              )}
            </div>
          );
        }
        return days;
      })()}
    </div>
  </div>
</div>
       {/* Day Detail Popup */}
{selectedDay && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {selectedDay.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
        <button
          onClick={() => setSelectedDay(null)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Daily Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Calories */}
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xs text-green-600 font-medium">Total Calories</div>
            <div className="text-xl font-bold text-green-700">
              {dayData?.totalCalories || 0}
            </div>
            <div className="text-xs text-green-600">
              Target: {Math.round(weeklyTarget / 7)}
            </div>
          </div>

          {/* Daily Mood */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-blue-600 font-medium">Mood</div>
            <div className="text-xl font-bold text-blue-700 flex items-center">
              <span className="mr-2">
                {(dayData?.mood || 0) >= 8 ? '😊' : 
                 (dayData?.mood || 0) >= 6 ? '🙂' : 
                 (dayData?.mood || 0) >= 4 ? '😐' : '😔'}
              </span>
              {dayData?.mood || 0}/10
            </div>
          </div>
        </div>

        {/* Meals Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Meals & Entries</h4>
          
          {/* Mock meal entries - replace with real data later */}
          {[
            { time: '08:30', meal: 'Breakfast', description: 'Oatmeal with berries', calories: 320 },
            { time: '12:45', meal: 'Lunch', description: 'Grilled chicken salad', calories: 450 },
            { time: '15:30', meal: 'Snack', description: 'Greek yogurt', calories: 150 },
            { time: '19:15', meal: 'Dinner', description: 'Salmon with vegetables', calories: 580 }
          ].map((entry, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{entry.meal}</span>
                  <span className="text-xs text-gray-500">{entry.time}</span>
                </div>
                <span className="text-sm font-semibold text-green-600">{entry.calories} cal</span>
              </div>
              <p className="text-sm text-gray-600">{entry.description}</p>
            </div>
          ))}

          {/* Add Entry Button */}
          <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
            + Add Entry
          </button>
        </div>

        {/* Daily Notes Section */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Notes</h4>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none"
            rows={3}
            placeholder="How did you feel today? Any notes about your meals or mood..."
            defaultValue={dayData?.notes || ''}
          />
        </div>

        {/* Mood Selector */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Update Mood</h4>
          <div className="flex justify-between items-center">
            {[1,2,3,4,5,6,7,8,9,10].map(mood => (
              <button
                key={mood}
                onClick={() => setDayData({...dayData, mood})}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  dayData?.mood === mood 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 flex space-x-3">
        <button
          onClick={() => setSelectedDay(null)}
          className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // TODO: Save data to Supabase
            console.log('Saving day data:', dayData);
            setSelectedDay(null);
          }}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    
  );
};

export default SofiPage;