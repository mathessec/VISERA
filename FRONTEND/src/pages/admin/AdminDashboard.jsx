import { useState, useEffect } from 'react';
import { Package, AlertTriangle, FileText, Users, ArrowRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MetricCard from '../../components/common/MetricCard';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

// Mock data - replace with actual API calls
const stockMovementData = [
  { month: 'Jan', inbound: 65, outbound: 45 },
  { month: 'Feb', inbound: 75, outbound: 55 },
  { month: 'Mar', inbound: 85, outbound: 65 },
  { month: 'Apr', inbound: 70, outbound: 50 },
  { month: 'May', inbound: 90, outbound: 70 },
  { month: 'Jun', inbound: 95, outbound: 75 },
];

const inventoryTrendData = [
  { month: 'Jan', value: 2400 },
  { month: 'Feb', value: 2600 },
  { month: 'Mar', value: 2800 },
  { month: 'Apr', value: 2700 },
  { month: 'May', value: 3000 },
  { month: 'Jun', value: 3200 },
];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalShipments: 248,
    aiMismatches: 12,
    totalSKUs: 1547,
    activeUsers: 45,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch metrics from API
    // Example: fetchMetrics().then(setMetrics);
  }, []);

  if (loading) return <Loading text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of warehouse operations and analytics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Shipments"
          value={metrics.totalShipments}
          icon={Package}
          color="blue"
          trend={12}
        />
        <MetricCard
          title="AI Mismatches"
          value={metrics.aiMismatches}
          icon={AlertTriangle}
          color="orange"
          trend={-5}
        />
        <MetricCard
          title="Total SKUs"
          value={metrics.totalSKUs}
          icon={FileText}
          color="purple"
          trend={8}
        />
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          icon={Users}
          color="green"
          trend={3}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockMovementData}>
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

        {/* Inventory Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={inventoryTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#2563EB" name="Inventory Level" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => window.location.href = '/products'}
            >
              <Package size={24} />
              <span>Manage Products</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => window.location.href = '/shipments'}
            >
              <ArrowRight size={24} />
              <span>View Shipments</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => window.location.href = '/users'}
            >
              <Users size={24} />
              <span>Manage Users</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => window.location.href = '/warehouse/zones'}
            >
              <Package size={24} />
              <span>Warehouse Layout</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

