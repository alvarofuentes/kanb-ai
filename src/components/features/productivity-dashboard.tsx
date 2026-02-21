'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useTaskStore } from '@/store/task-store';
import { useLanguage } from '@/context/language-context';
import { Loader2, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  open: '#94a3b8',
  pending: '#f59e0b',
  inProgress: '#3b82f6',
  review: '#8b5cf6',
  completed: '#22c55e',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};

const PIE_COLORS = ['#94a3b8', '#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e'];

export function ProductivityDashboard() {
  const { stats, isLoading } = useTaskStore();
  const { t } = useLanguage();

  if (isLoading && !stats) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statusData = stats
    ? [
      { name: t.open, value: stats.byStatus.open, fill: PIE_COLORS[0] },
      { name: t.pending, value: stats.byStatus.pending, fill: PIE_COLORS[1] },
      { name: t.inProgress, value: stats.byStatus.inProgress, fill: PIE_COLORS[2] },
      { name: t.review, value: stats.byStatus.review, fill: PIE_COLORS[3] },
      { name: t.completed, value: stats.byStatus.completed, fill: PIE_COLORS[4] },
    ].filter((item) => item.value > 0)
    : [];

  const priorityLabels = [t.low, t.medium, t.high, t.urgent];
  const priorityData = stats
    ? [
      { name: t.low, value: stats.byPriority.low, fill: PRIORITY_COLORS.low },
      { name: t.medium, value: stats.byPriority.medium, fill: PRIORITY_COLORS.medium },
      { name: t.high, value: stats.byPriority.high, fill: PRIORITY_COLORS.high },
      { name: t.urgent, value: stats.byPriority.urgent, fill: PRIORITY_COLORS.urgent },
    ]
    : [];

  const activityData = stats?.recentActivity || [];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.totalTasks}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">{t.allTasksInWorkspace}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.completionRate}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completionRate || 0}%</div>
            <Progress value={stats?.completionRate || 0} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.dueToday}</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.dueToday || 0}</div>
            <p className="text-xs text-muted-foreground">{t.tasksDueToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.overdue}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.overdue || 0}</div>
            <p className="text-xs text-muted-foreground">{t.pastDueDate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t.taskStatusDistribution}</CardTitle>
            <CardDescription>{t.overviewByStatus}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t.tasksByPriority}</CardTitle>
            <CardDescription>{t.distributionPriorities}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t.recentActivity}</CardTitle>
          <CardDescription>{t.taskUpdates7Days}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.thisWeek}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats?.dueThisWeek || 0}</span>
              <Badge variant="secondary">{t.tasksDue}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.inProgress}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats?.byStatus.inProgress || 0}</span>
              <Badge className="bg-blue-500">{t.inProgressActive}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.review}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats?.byStatus.review || 0}</span>
              <Badge className="bg-purple-500">{t.inReviewPending}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
