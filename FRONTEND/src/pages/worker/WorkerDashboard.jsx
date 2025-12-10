import { useState } from 'react';
import { PackageSearch, Truck, MapPin, CheckCircle } from 'lucide-react';
import { StatsCard } from '../../components/shared/StatsCard';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';

export default function WorkerDashboard() {
  const [metrics] = useState({
    pendingInbound: 12,
    pendingOutbound: 8,
    pendingPutaway: 5,
    completedToday: 24,
  });

  const inboundTasks = [
    {
      id: 'IB-2025-001',
      shipmentId: 'SH-2025-001',
      vendor: 'TechSupply Co.',
      items: 45,
      priority: 'High',
      expectedTime: '10:00 AM',
      status: 'Ready to Scan',
    },
    {
      id: 'IB-2025-002',
      shipmentId: 'SH-2025-002',
      vendor: 'ElectroWorks Inc.',
      items: 32,
      priority: 'Medium',
      expectedTime: '11:30 AM',
      status: 'In Progress',
    },
  ];

  const outboundTasks = [
    {
      id: 'OB-2025-045',
      orderId: 'ORD-8821',
      customer: 'Retail Store #42',
      items: 15,
      priority: 'High',
      deadline: '3:00 PM',
      status: 'Ready to Pick',
    },
    {
      id: 'OB-2025-046',
      orderId: 'ORD-8822',
      customer: 'Online Order',
      items: 8,
      priority: 'Medium',
      deadline: '4:30 PM',
      status: 'In Progress',
    },
  ];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <Badge variant="destructive">{priority}</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-100 text-yellow-800">{priority}</Badge>;
      case 'Low':
        return <Badge className="bg-green-100 text-green-800">{priority}</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Worker Dashboard</h1>
        <p className="text-gray-500">Your tasks and activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Pending Inbound"
          value={metrics.pendingInbound}
          icon={PackageSearch}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Pending Outbound"
          value={metrics.pendingOutbound}
          icon={Truck}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Pending Putaway"
          value={metrics.pendingPutaway}
          icon={MapPin}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Completed Today"
          value={metrics.completedToday}
          icon={CheckCircle}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inbound Tasks</CardTitle>
              <Link to="/worker/inbound">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inboundTasks.map((task) => (
                <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{task.shipmentId}</span>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <p className="text-gray-600 text-sm">{task.vendor}</p>
                  <p className="text-gray-500 text-sm">
                    {task.items} items • Expected: {task.expectedTime}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Outbound Tasks</CardTitle>
              <Link to="/worker/picking">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outboundTasks.map((task) => (
                <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{task.orderId}</span>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <p className="text-gray-600 text-sm">{task.customer}</p>
                  <p className="text-gray-500 text-sm">
                    {task.items} items • Deadline: {task.deadline}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
