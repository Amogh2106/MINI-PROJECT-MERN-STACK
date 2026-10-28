import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Briefcase, DollarSign, CheckSquare, MessageSquare, ArrowRight, Calendar } from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi.js';
import { useAuth } from '../hooks/useAuth.js';
import StatCard from '../components/common/StatCard.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { formatCurrency, formatDateTime, getStageBadgeVariant } from '../utils/formatters.js';

const Dashboard = () => {
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => dashboardApi.getMetrics(),
  });

  const metrics = data?.data?.metrics || {
    totalContacts: 0,
    openDeals: 0,
    totalPipelineValue: 0,
    tasksDueToday: 0,
  };

  const recentActivity = data?.data?.recentActivity || [];
  const recentDeals = data?.data?.recentDeals || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Sales Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Welcome back, <span className="font-semibold text-gray-800">{user?.name}</span>. Here is your pipeline snapshot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/deals">
            <Button variant="secondary" size="sm" className="gap-1.5">
              View Pipeline
            </Button>
          </Link>
          <Link to="/tasks">
            <Button variant="primary" size="sm" className="gap-1.5">
              Review Tasks
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded">
          Calculating sales metrics...
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {error?.message || 'Failed to load dashboard metrics'}
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Contacts"
              value={metrics.totalContacts}
              subtitle="Leads & customer accounts"
              icon={Users}
            />

            <StatCard
              title="Open Deals"
              value={metrics.openDeals}
              subtitle="Active sales opportunities"
              icon={Briefcase}
            />

            <StatCard
              title="Pipeline Value"
              value={formatCurrency(metrics.totalPipelineValue)}
              subtitle="Sum of active stages"
              icon={DollarSign}
              valueColor="text-blue-700"
            />

            <StatCard
              title="Tasks Due Today"
              value={metrics.tasksDueToday}
              subtitle="Requires follow-up action"
              icon={CheckSquare}
              valueColor={metrics.tasksDueToday > 0 ? 'text-amber-600' : 'text-gray-900'}
            />
          </div>

          {/* Activity & Recent Deals Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity List */}
            <div className="bg-white border border-gray-200 rounded p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-bold text-gray-900">Recent Activity & Notes</h2>
                </div>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  No activity recorded yet. Notes posted on contacts or deals will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">{activity.title}</span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{activity.description}</p>
                      <div className="pt-1">
                        <Link
                          to={`/${activity.entityType === 'contact' ? 'contacts' : 'deals'}/${activity.entityId}`}
                          className="text-[11px] text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                        >
                          View {activity.entityType} <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Opportunities Snapshot */}
            <div className="bg-white border border-gray-200 rounded p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <h2 className="text-sm font-bold text-gray-900">Recent Deals In Pipeline</h2>
                </div>
                <Link to="/deals" className="text-xs text-blue-600 hover:underline font-medium">
                  View all
                </Link>
              </div>

              {recentDeals.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  No deals recorded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentDeals.map((deal) => (
                    <div
                      key={deal._id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded text-xs hover:bg-gray-50"
                    >
                      <div className="min-w-0 pr-3">
                        <Link
                          to={`/deals/${deal._id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 hover:underline block truncate"
                        >
                          {deal.title}
                        </Link>
                        <span className="text-gray-500 text-[11px]">
                          {deal.company?.name || 'Individual opportunity'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={getStageBadgeVariant(deal.stage)} className="capitalize">
                          {deal.stage}
                        </Badge>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(deal.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
