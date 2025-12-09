import { useState } from 'react';
import { BarChart3, Download, TrendingUp, Users, Package } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data - replace with actual API calls
const workerProductivity = [
  { worker: 'John Doe', tasks: 45, completed: 42 },
  { worker: 'Jane Smith', tasks: 38, completed: 36 },
  { worker: 'Mike Johnson', tasks: 52, completed: 50 },
];

const dailyOperations = [
  { day: 'Mon', inbound: 12, outbound: 8 },
  { day: 'Tue', inbound: 15, outbound: 10 },
  { day: 'Wed', inbound: 10, outbound: 12 },
  { day: 'Thu', inbound: 18, outbound: 9 },
  { day: 'Fri', inbound: 14, outbound: 11 },
];

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const handleExport = () => {
    alert('Export functionality will be implemented');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Reports</h1>
          <p className="text-gray-600 mt-1">Monitor operations and worker productivity</p>
        </div>
        <Button variant="primary" onClick={handleExport}>
          <Download size={20} className="mr-2" />
          Export Report
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Active Workers</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">12</div>
            <div className="text-sm text-green-600 mt-1">All active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Tasks Today</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">28</div>
            <div className="text-sm text-green-600 mt-1">+5 from yesterday</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Pending Approvals</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">5</div>
            <div className="text-sm text-orange-600 mt-1">Requires attention</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Completion Rate</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">94%</div>
            <div className="text-sm text-green-600 mt-1">Above target</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Worker Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workerProductivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="worker" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tasks" fill="#2563EB" name="Assigned" />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyOperations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="inbound" stroke="#14B8A6" name="Inbound" strokeWidth={2} />
                <Line type="monotone" dataKey="outbound" stroke="#8B5CF6" name="Outbound" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

