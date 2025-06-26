import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { attendanceAPI } from '../services/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  today: {
    present: number;
    absent: number;
    late: number;
  };
  weekly: Array<{
    _id: string;
    present: number;
    absent: number;
    late: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await attendanceAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const todayTotal = stats ? stats.today.present + stats.today.absent + stats.today.late : 0;
  const attendancePercentage = todayTotal > 0 ? Math.round((stats!.today.present / todayTotal) * 100) : 0;

  const statCards = [
    {
      title: 'Present Today',
      value: stats?.today.present || 0,
      icon: UserCheck,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      title: 'Absent Today',
      value: stats?.today.absent || 0,
      icon: UserX,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
    {
      title: 'Late Today',
      value: stats?.today.late || 0,
      icon: Clock,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      title: 'Attendance Rate',
      value: `${attendancePercentage}%`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's today's attendance overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance</h3>
          {stats?.weekly && stats.weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#10B981" name="Present" />
                <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                <Bar dataKey="late" fill="#F59E0B" name="Late" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No attendance data available
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium">
              Mark Today's Attendance
            </button>
            <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-800 transition-all duration-200 font-medium">
              View Attendance History
            </button>
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-800 transition-all duration-200 font-medium">
              Add New Student
            </button>
          </div>

          {/* Today's Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Today's Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Total Students: {todayTotal}</p>
              <p>Present: {stats?.today.present || 0}</p>
              <p>Absent: {stats?.today.absent || 0}</p>
              <p>Late: {stats?.today.late || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};