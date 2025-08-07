import React, { useState } from 'react';
import { User } from '../../types/auth';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DataDashboardProps {
  currentUser: User;
}

interface DayData {
  date: number;
  consumed: number;
  burned: number;
  status: 'surplus' | 'equal' | 'deficit';
}

const DataDashboard: React.FC<DataDashboardProps> = ({ currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Generate mock data for the current month
  const generateMockData = (year: number, month: number): DayData[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data: DayData[] = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      // Generate random but realistic calorie data
      const consumed = Math.floor(Math.random() * 1000) + 1500; // 1500-2500 kcal
      const burned = Math.floor(Math.random() * 800) + 1600; // 1600-2400 kcal
      
      let status: 'surplus' | 'equal' | 'deficit';
      const diff = Math.abs(consumed - burned);
      
      if (consumed > burned + 50) {
        status = 'surplus';
      } else if (diff <= 50) {
        status = 'equal';
      } else {
        status = 'deficit';
      }
      
      data.push({
        date: day,
        consumed,
        burned,
        status
      });
    }
    
    return data;
  };

  const monthData = generateMockData(currentDate.getFullYear(), currentDate.getMonth());
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };
  
  const getStatusColor = (status: 'surplus' | 'equal' | 'deficit') => {
    switch (status) {
      case 'surplus':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'equal':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'deficit':
        return 'bg-green-100 border-green-200 text-green-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };
  
  const getStatusBadge = (status: 'surplus' | 'equal' | 'deficit') => {
    switch (status) {
      case 'surplus':
        return '🔴';
      case 'equal':
        return '🟡';
      case 'deficit':
        return '🟢';
      default:
        return '⚪';
    }
  };

  // Calculate month summary
  const monthSummary = monthData.reduce((acc, day) => {
    acc[day.status]++;
    acc.totalConsumed += day.consumed;
    acc.totalBurned += day.burned;
    return acc;
  }, {
    surplus: 0,
    equal: 0,
    deficit: 0,
    totalConsumed: 0,
    totalBurned: 0
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calorie Data Calendar</h2>
          <p className="text-gray-600 mt-1">Track your daily calorie consumption vs burn rate</p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>Deficit (Good)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>Equal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span>Surplus</span>
          </div>
        </div>
      </div>

      {/* Month Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{monthSummary.deficit}</div>
            <div className="text-sm text-gray-600">Deficit Days</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{monthSummary.equal}</div>
            <div className="text-sm text-gray-600">Equal Days</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{monthSummary.surplus}</div>
            <div className="text-sm text-gray-600">Surplus Days</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((monthSummary.totalConsumed - monthSummary.totalBurned) / daysInMonth)}
            </div>
            <div className="text-sm text-gray-600">Avg Daily Net</div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Calendar className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-20"></div>
            ))}
            
            {/* Days of the month */}
            {monthData.map((dayData) => (
              <div
                key={dayData.date}
                className={`h-20 border-2 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all ${getStatusColor(dayData.status)}`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{dayData.date}</span>
                    <span className="text-lg">{getStatusBadge(dayData.status)}</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center text-xs">
                    <div className="font-medium">↑ {dayData.consumed}</div>
                    <div className="font-medium">↓ {dayData.burned}</div>
                    <div className="font-bold">
                      {dayData.consumed > dayData.burned ? '+' : ''}
                      {dayData.consumed - dayData.burned}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Consumed:</span>
              <span className="font-semibold">{monthSummary.totalConsumed.toLocaleString()} kcal</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Burned:</span>
              <span className="font-semibold">{monthSummary.totalBurned.toLocaleString()} kcal</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-600">Net Difference:</span>
              <span className={`font-bold ${
                (monthSummary.totalConsumed - monthSummary.totalBurned) > 0 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                {monthSummary.totalConsumed > monthSummary.totalBurned ? '+' : ''}
                {(monthSummary.totalConsumed - monthSummary.totalBurned).toLocaleString()} kcal
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Daily Average Consumed:</span>
              <span className="font-semibold">
                {Math.round(monthSummary.totalConsumed / daysInMonth)} kcal
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Daily Average Burned:</span>
              <span className="font-semibold">
                {Math.round(monthSummary.totalBurned / daysInMonth)} kcal
              </span>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Deficit Days</span>
                <span>{Math.round((monthSummary.deficit / daysInMonth) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(monthSummary.deficit / daysInMonth) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Equal Days</span>
                <span>{Math.round((monthSummary.equal / daysInMonth) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(monthSummary.equal / daysInMonth) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Surplus Days</span>
                <span>{Math.round((monthSummary.surplus / daysInMonth) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(monthSummary.surplus / daysInMonth) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(((monthSummary.deficit + monthSummary.equal) / daysInMonth) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Overall Success Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  (Deficit + Equal days)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDashboard;