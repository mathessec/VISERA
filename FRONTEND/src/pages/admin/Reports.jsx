import { useState } from 'react';
import { BarChart3, Download, Calendar } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data - replace with actual API calls
const shipmentData = [
  { month: 'Jan', inbound: 65, outbound: 45 },
  { month: 'Feb', inbound: 75, outbound: 55 },
  { month: 'Mar', inbound: 85, outbound: 65 },
  { month: 'Apr', inbound: 70, outbound: 50 },
  { month: 'May', inbound: 90, outbound: 70 },
  { month: 'Jun', inbound: 95, outbound: 75 },
];

const roleDistribution = [
  { name: 'Workers', value: 45 },
  { name: 'Supervisors', value: 8 },
  { name: 'Admins', value: 2 },
];

const COLORS = ['#2563EB', '#10B981', '#8B5CF6'];

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const handleExport = () => {
    // Implement export functionality
    alert('Export functionality will be implemented');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive warehouse analytics and insights</p>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipment Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Shipment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={shipmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="inbound" fill="#14B8A6" name="Inbound" />
                <Bar dataKey="outbound" fill="#8B5CF6" name="Outbound" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Total Shipments</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">248</div>
            <div className="text-sm text-green-600 mt-1">+12% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">AI Mismatches</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">12</div>
            <div className="text-sm text-red-600 mt-1">-5% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Active Users</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">55</div>
            <div className="text-sm text-green-600 mt-1">+3% from last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Total SKUs</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">1,547</div>
            <div className="text-sm text-green-600 mt-1">+8% from last month</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

