'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Users, BookOpen, Layers, TrendingUp, Activity, Award } from 'lucide-react';

interface AnalyticsData {
  users: {
    total: number;
    byRole: {
      student: number;
      faculty: number;
      pending_faculty: number;
      admin: number;
    };
    active: number;
    suspended: number;
    unverified: number;
  };
  content: {
    courses: {
      total: number;
      published: number;
      draft: number;
    };
    modules: {
      total: number;
      published: number;
    };
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    completionRate: number;
  };
  recentActivity: {
    users: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      created_at: string;
    }>;
    courses: Array<{
      id: string;
      title: string;
      slug: string;
      status: string;
      created_at: string;
      users: { name: string };
    }>;
    enrollments: Array<{
      id: string;
      started_at: string;
      user: { name: string; email: string };
      course: { title: string; slug: string };
    }>;
  };
  trends: {
    userGrowth: Array<{
      date: string;
      count: number;
    }>;
  };
}

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-lg">Loading platform analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-400 text-lg mb-4">{error}</div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Prepare data for charts
  const userRoleData = [
    { name: 'Students', value: analytics.users.byRole.student },
    { name: 'Faculty', value: analytics.users.byRole.faculty },
    { name: 'Pending Faculty', value: analytics.users.byRole.pending_faculty },
    { name: 'Admins', value: analytics.users.byRole.admin },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Platform Analytics</h1>
        <p className="text-gray-400 mt-2">Comprehensive platform metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Users"
          value={analytics.users.total}
          subtitle={`${analytics.users.active} active (7d)`}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          label="Total Courses"
          value={analytics.content.courses.total}
          subtitle={`${analytics.content.courses.published} published`}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <StatCard
          icon={<Layers className="w-6 h-6" />}
          label="Total Modules"
          value={analytics.content.modules.total}
          subtitle={`${analytics.content.modules.published} published`}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Enrollments"
          value={analytics.enrollments.total}
          subtitle={`${analytics.enrollments.completionRate}% completion rate`}
          color="text-synapse-400"
          bgColor="bg-synapse-500/10"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Role Distribution */}
        <div className="bg-neural-800/50 backdrop-blur-sm rounded-xl p-6 border border-synapse-500/20">
          <h2 className="text-xl font-semibold text-white mb-4">User Distribution by Role</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userRoleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userRoleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth Trend */}
        <div className="bg-neural-800/50 backdrop-blur-sm rounded-xl p-6 border border-synapse-500/20">
          <h2 className="text-xl font-semibold text-white mb-4">User Growth (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trends.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', borderRadius: '8px' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8B5CF6"
                strokeWidth={2}
                name="New Users"
                dot={{ fill: '#8B5CF6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neural-800/50 backdrop-blur-sm rounded-xl p-6 border border-synapse-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">User Status</h3>
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active</span>
              <span className="text-white font-semibold">{analytics.users.total - analytics.users.suspended}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Suspended</span>
              <span className="text-red-400 font-semibold">{analytics.users.suspended}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Unverified Email</span>
              <span className="text-yellow-400 font-semibold">{analytics.users.unverified}</span>
            </div>
          </div>
        </div>

        <div className="bg-neural-800/50 backdrop-blur-sm rounded-xl p-6 border border-synapse-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Course Status</h3>
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Published</span>
              <span className="text-white font-semibold">{analytics.content.courses.published}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Drafts</span>
              <span className="text-yellow-400 font-semibold">{analytics.content.courses.draft}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total</span>
              <span className="text-synapse-400 font-semibold">{analytics.content.courses.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-neural-800/50 backdrop-blur-sm rounded-xl p-6 border border-synapse-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Enrollment Metrics</h3>
            <Award className="w-5 h-5 text-synapse-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active (7d)</span>
              <span className="text-white font-semibold">{analytics.enrollments.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Completed</span>
              <span className="text-green-400 font-semibold">{analytics.enrollments.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Completion Rate</span>
              <span className="text-synapse-400 font-semibold">{analytics.enrollments.completionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="bg-neural-800/50 backdrop-blur-sm rounded-xl p-6 border border-synapse-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
          <div className="space-y-3">
            {analytics.recentActivity.users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-synapse-500/10 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{user.name}</div>
                  <div className="text-gray-400 text-xs truncate">{user.email}</div>
                </div>
                <div className="text-gray-500 text-xs ml-2">
                  {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-neural-800/50 backdrop-blur-sm rounded-xl p-6 border border-synapse-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Courses</h3>
          <div className="space-y-3">
            {analytics.recentActivity.courses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center justify-between py-2 border-b border-synapse-500/10 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{course.title}</div>
                  <div className="text-gray-400 text-xs">by {course.users.name}</div>
                </div>
                <div className="text-gray-500 text-xs ml-2">
                  {new Date(course.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-neural-800/50 backdrop-blur-sm rounded-xl p-6 border border-synapse-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Enrollments</h3>
          <div className="space-y-3">
            {analytics.recentActivity.enrollments.slice(0, 5).map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between py-2 border-b border-synapse-500/10 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{enrollment.user.name}</div>
                  <div className="text-gray-400 text-xs truncate">{enrollment.course.title}</div>
                </div>
                <div className="text-gray-500 text-xs ml-2">
                  {new Date(enrollment.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  bgColor: string;
}

function StatCard({ icon, label, value, subtitle, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-neural-800/50 backdrop-blur-sm rounded-xl p-6 border border-synapse-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <div className={color}>{icon}</div>
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
      </div>
    </div>
  );
}
