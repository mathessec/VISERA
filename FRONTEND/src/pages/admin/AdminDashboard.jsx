import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Warehouse, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatsCard } from '../../components/shared/StatsCard';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import Loading from '../../components/common/Loading';

// Mock data - replace with actual API calls
const stockReports = [
  { month: 'Jan', inbound: 65, outbound: 45, variance: 20 },
  { month: 'Feb', inbound: 75, outbound: 55, variance: 20 },
  { month: 'Mar', inbound: 85, outbound: 65, variance: 20 },
  { month: 'Apr', inbound: 70, outbound: 50, variance: 20 },
  { month: 'May', inbound: 90, outbound: 70, variance: 20 },
  { month: 'Jun', inbound: 95, outbound: 75, variance: 20 },
];

const quickLinks = [
  { label: 'Manage Products', path: '/products', icon: Package },
  { label: 'View Shipments', path: '/shipments', icon: TrendingUp },
  { label: 'Manage Users', path: '/users', icon: Package },
  { label: 'Warehouse Layout', path: '/warehouse/zones', icon: Warehouse },
];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalShipments: 156,
    aiMismatches: 23,
    totalSKUs: 1248,
    activeUsers: 42,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch metrics from API
    // Example: fetchMetrics().then(setMetrics);
  }, []);

  if (loading) return <Loading text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening in your warehouse.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Shipments"
          value={metrics.totalShipments}
          icon={Package}
          trend={{ value: '12% from last month', isPositive: true }}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="AI Mismatches"
          value={metrics.aiMismatches}
          icon={AlertTriangle}
          trend={{ value: '5% from last month', isPositive: false }}
          iconBgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatsCard
          title="Total SKUs"
          value={metrics.totalSKUs.toLocaleString()}
          icon={Warehouse}
          trend={{ value: '8% from last month', isPositive: true }}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Active Users"
          value={metrics.activeUsers}
          icon={TrendingUp}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockReports}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="inbound" fill="#3b82f6" name="Inbound" />
                <Bar dataKey="outbound" fill="#10b981" name="Outbound" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stockReports}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="variance" stroke="#f59e0b" strokeWidth={2} name="Variance" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}>
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                    <Icon className="w-6 h-6" />
                    <span>{link.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
