import React, { useState } from 'react';
import { User } from '../types/auth';
import { Play, Pause, Heart, Zap, Clock, MapPin, TrendingUp, Calendar, Filter } from 'lucide-react';

interface WorkoutDashboardProps {
  currentUser: User;
}

interface WorkoutSession {
  id: string;
  date: string;
  type: 'running' | 'cycling' | 'swimming' | 'strength' | 'yoga' | 'walking';
  duration: number; // in minutes
  distance?: number; // in km
  calories: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgPace?: string; // min/km
  elevation?: number; // in meters
  zones: {
    zone1: number; // Recovery (50-60% HRmax)
    zone2: number; // Aerobic (60-70% HRmax)
    zone3: number; // Tempo (70-80% HRmax)
    zone4: number; // Lactate (80-90% HRmax)
    zone5: number; // Neuromuscular (90-100% HRmax)
  };
  splits?: Array<{
    km: number;
    time: string;
    pace: string;
    heartRate: number;
  }>;
}

const WorkoutDashboard: React.FC<WorkoutDashboardProps> = ({ currentUser }) => {
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Mock .fit file data from HealthFit app
  const workoutSessions: WorkoutSession[] = [
    {
      id: '1',
      date: '2025-01-07',
      type: 'running',
      duration: 45,
      distance: 8.2,
      calories: 654,
      avgHeartRate: 156,
      maxHeartRate: 182,
      avgPace: '5:29',
      elevation: 127,
      zones: { zone1: 8, zone2: 15, zone3: 18, zone4: 4, zone5: 0 },
      splits: [
        { km: 1, time: '5:15', pace: '5:15', heartRate: 145 },
        { km: 2, time: '5:32', pace: '5:32', heartRate: 152 },
        { km: 3, time: '5:41', pace: '5:41', heartRate: 158 },
        { km: 4, time: '5:28', pace: '5:28', heartRate: 161 },
        { km: 5, time: '5:19', pace: '5:19', heartRate: 159 },
        { km: 6, time: '5:35', pace: '5:35', heartRate: 156 },
        { km: 7, time: '5:42', pace: '5:42', heartRate: 154 },
        { km: 8, time: '5:18', pace: '5:18', heartRate: 165 }
      ]
    },
    {
      id: '2',
      date: '2025-01-06',
      type: 'cycling',
      duration: 75,
      distance: 32.5,
      calories: 892,
      avgHeartRate: 142,
      maxHeartRate: 171,
      avgPace: '2:18',
      elevation: 456,
      zones: { zone1: 12, zone2: 35, zone3: 22, zone4: 6, zone5: 0 }
    },
    {
      id: '3',
      date: '2025-01-05',
      type: 'strength',
      duration: 60,
      calories: 423,
      avgHeartRate: 128,
      maxHeartRate: 158,
      zones: { zone1: 25, zone2: 20, zone3: 10, zone4: 5, zone5: 0 }
    },
    {
      id: '4',
      date: '2025-01-04',
      type: 'swimming',
      duration: 40,
      distance: 2.1,
      calories: 387,
      avgHeartRate: 134,
      maxHeartRate: 156,
      zones: { zone1: 5, zone2: 18, zone3: 12, zone4: 5, zone5: 0 }
    },
    {
      id: '5',
      date: '2025-01-03',
      type: 'yoga',
      duration: 50,
      calories: 156,
      avgHeartRate: 98,
      maxHeartRate: 125,
      zones: { zone1: 45, zone2: 5, zone3: 0, zone4: 0, zone5: 0 }
    }
  ];

  const getWorkoutIcon = (type: string) => {
    const icons = {
      running: '🏃‍♂️',
      cycling: '🚴‍♂️',
      swimming: '🏊‍♂️',
      strength: '💪',
      yoga: '🧘‍♀️',
      walking: '🚶‍♂️'
    };
    return icons[type as keyof typeof icons] || '🏃‍♂️';
  };

  const getWorkoutColor = (type: string) => {
    const colors = {
      running: 'bg-blue-100 text-blue-800 border-blue-200',
      cycling: 'bg-green-100 text-green-800 border-green-200',
      swimming: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      strength: 'bg-purple-100 text-purple-800 border-purple-200',
      yoga: 'bg-pink-100 text-pink-800 border-pink-200',
      walking: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getHeartRateZoneColor = (zone: string) => {
    const colors = {
      zone1: 'bg-gray-400',
      zone2: 'bg-blue-400',
      zone3: 'bg-green-400',
      zone4: 'bg-yellow-400',
      zone5: 'bg-red-400'
    };
    return colors[zone as keyof typeof colors];
  };

  const filteredWorkouts = filterType === 'all' 
    ? workoutSessions 
    : workoutSessions.filter(w => w.type === filterType);

  // Calculate weekly summary
  const weeklyStats = workoutSessions.reduce((acc, workout) => {
    acc.totalWorkouts++;
    acc.totalDuration += workout.duration;
    acc.totalCalories += workout.calories;
    if (workout.distance) acc.totalDistance += workout.distance;
    return acc;
  }, {
    totalWorkouts: 0,
    totalDuration: 0,
    totalCalories: 0,
    totalDistance: 0
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workout Analytics</h2>
          <p className="text-gray-600 mt-1">Data imported from HealthFit .fit files</p>
        </div>
        
        {/* Filter */}
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Workouts</option>
            <option value="running">Running</option>
            <option value="cycling">Cycling</option>
            <option value="swimming">Swimming</option>
            <option value="strength">Strength</option>
            <option value="yoga">Yoga</option>
            <option value="walking">Walking</option>
          </select>
        </div>
      </div>

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Workouts</p>
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.totalWorkouts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(weeklyStats.totalDuration)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Calories Burned</p>
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.totalCalories.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Distance</p>
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.totalDistance.toFixed(1)} km</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Workouts</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                onClick={() => setSelectedWorkout(workout)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getWorkoutIcon(workout.type)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 capitalize">{workout.type}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getWorkoutColor(workout.type)}`}>
                          {workout.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{workout.date}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{formatDuration(workout.duration)}</p>
                    <p className="text-sm text-gray-600">{workout.calories} kcal</p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                  {workout.distance && (
                    <div>
                      <p className="text-gray-600">Distance</p>
                      <p className="font-semibold">{workout.distance} km</p>
                    </div>
                  )}
                  {workout.avgHeartRate && (
                    <div>
                      <p className="text-gray-600">Avg HR</p>
                      <p className="font-semibold">{workout.avgHeartRate} bpm</p>
                    </div>
                  )}
                  {workout.avgPace && (
                    <div>
                      <p className="text-gray-600">Avg Pace</p>
                      <p className="font-semibold">{workout.avgPace}/km</p>
                    </div>
                  )}
                  {workout.elevation && (
                    <div>
                      <p className="text-gray-600">Elevation</p>
                      <p className="font-semibold">{workout.elevation}m</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workout Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedWorkout ? 'Workout Details' : 'Select a Workout'}
            </h3>
          </div>
          
          {selectedWorkout ? (
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl">{getWorkoutIcon(selectedWorkout.type)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">{selectedWorkout.type}</h4>
                    <p className="text-sm text-gray-600">{selectedWorkout.date}</p>
                  </div>
                </div>
              </div>

              {/* Heart Rate Zones */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Heart Rate Zones</h5>
                <div className="space-y-2">
                  {Object.entries(selectedWorkout.zones).map(([zone, minutes]) => (
                    <div key={zone} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded ${getHeartRateZoneColor(zone)}`}></div>
                        <span className="text-sm text-gray-600 capitalize">
                          {zone.replace('zone', 'Zone ')}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{minutes}min</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Performance</h5>
                <div className="space-y-3">
                  {selectedWorkout.avgHeartRate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">Avg Heart Rate</span>
                      </div>
                      <span className="text-sm font-medium">{selectedWorkout.avgHeartRate} bpm</span>
                    </div>
                  )}
                  {selectedWorkout.maxHeartRate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-gray-600">Max Heart Rate</span>
                      </div>
                      <span className="text-sm font-medium">{selectedWorkout.maxHeartRate} bpm</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Calories</span>
                    </div>
                    <span className="text-sm font-medium">{selectedWorkout.calories} kcal</span>
                  </div>
                </div>
              </div>

              {/* Splits for running */}
              {selectedWorkout.splits && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Split Times</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedWorkout.splits.map((split, index) => (
                      <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span>Km {split.km}</span>
                        <span>{split.pace}</span>
                        <span>{split.heartRate} bpm</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Click on a workout to view detailed analytics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDashboard;