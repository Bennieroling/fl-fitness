import React from 'react';
import { User } from '../types/auth';

interface NutritionDashboardProps {
  currentUser: User;
}

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({ currentUser }) => {
  // Mock data
  const meals = [
    {
      id: 1,
      name: 'Breakfast',
      foods: 'Banana, Wheat Chapathi, Dosa',
      calories: 393,
      icon: '🥞',
      color: 'bg-red-100'
    },
    {
      id: 2,
      name: 'Snack',
      foods: 'Apple, Orange, Peas',
      calories: 298,
      icon: '☕',
      color: 'bg-yellow-100'
    },
    {
      id: 3,
      name: 'Lunch',
      foods: 'Moong Dal, Chicken Curry, Curd Rice',
      calories: 686,
      icon: '🥗',
      color: 'bg-purple-100'
    },
    {
      id: 4,
      name: 'Snack',
      foods: 'Recommended',
      calories: 165,
      icon: '🧁',
      color: 'bg-orange-100',
      isRecommended: true
    },
    {
      id: 5,
      name: 'Dinner',
      foods: 'Recommended',
      calories: 440,
      icon: '🍽️',
      color: 'bg-blue-100',
      isRecommended: true
    }
  ];

  const totalConsumed = 1377;
  const totalTarget = 3000;
  const burnedCalories = 684;

  const macros = [
    { name: 'PROTEINS', value: '68.8 gm', color: 'text-green-600' },
    { name: 'FAT', value: '24.8 gm', color: 'text-orange-600' },
    { name: 'CARBOHYDRATES', value: '228.5 gm', color: 'text-yellow-600' }
  ];

  const nutrients = [
    { name: 'CALCIUM', value: '460 mg', color: 'text-orange-600' },
    { name: 'SODIUM', value: '990 mg', color: 'text-purple-600' },
    { name: 'IRON', value: '0 mg', color: 'text-red-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">5 Course Meals</h2>
      </div>

      {/* Meal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {meals.map((meal) => (
          <div key={meal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${meal.color} rounded-full flex items-center justify-center text-2xl`}>
                {meal.icon}
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2">{meal.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{meal.foods}</p>
            
            {meal.isRecommended ? (
              <button className="w-full py-2 px-4 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors">
                ADD MENU
              </button>
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {meal.calories} <span className="text-sm font-normal text-gray-500">kcal</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Calorie Summary and Macros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calorie Diet Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Calorie Diet</h3>
          
          <div className="flex items-center justify-center mb-6">
            {/* Simple pie chart representation */}
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="12"/>
                {/* Progress circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#fbbf24" 
                  strokeWidth="12"
                  strokeDasharray={`${(totalConsumed / totalTarget) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">CONSUMED CALORIES</div>
                  <div className="text-2xl font-bold text-gray-900">{totalConsumed}</div>
                  <div className="text-sm text-gray-500">kcal / {totalTarget} kcal</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">BURNED CALORIES</div>
            <div className="text-2xl font-bold text-gray-900">{burnedCalories} <span className="text-sm font-normal">kcal</span></div>
          </div>
        </div>

        {/* Macronutrients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Macronutrients</h3>
          
          <div className="grid grid-cols-3 gap-6 mb-8">
            {macros.map((macro, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-2">{macro.name}</div>
                <div className={`text-2xl font-bold ${macro.color}`}>{macro.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {nutrients.map((nutrient, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-2">{nutrient.name}</div>
                <div className={`text-2xl font-bold ${nutrient.color}`}>{nutrient.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionDashboard;