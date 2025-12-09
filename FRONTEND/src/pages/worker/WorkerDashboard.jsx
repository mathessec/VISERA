import { useState } from 'react';
import { Package, MapPin, CheckCircle, Clock } from 'lucide-react';
import MetricCard from '../../components/common/MetricCard';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function WorkerDashboard() {
  const [metrics] = useState({
    pendingInbound: 5,
    pendingOutbound: 3,
    pendingPutaway: 8,
    completedToday: 15,
  });

  const [tasks] = useState([
    {
      id: 'SH-245',
      type: 'Inbound',
      priority: 'HIGH',
      items: 12,
      zone: 'Zone A',
      deadline: '10:30 AM',
    },
    {
      id: 'SH-246',
      type: 'Inbound',
      priority: 'MEDIUM',
      items: 8,
      zone: 'Zone B',
      deadline: '11:00 AM',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Worker Dashboard</h1>
          <p className="text-gray-600 mt-1">Your tasks and activities</p>
        </div>
        <Button variant="primary">
          Quick Scan Packaging
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Pending Inbound"
          value={metrics.pendingInbound}
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Pending Outbound"
          value={metrics.pendingOutbound}
          icon={Package}
          color="purple"
        />
        <MetricCard
          title="Pending Putaway"
          value={metrics.pendingPutaway}
          icon={MapPin}
          color="green"
        />
        <MetricCard
          title="Completed Today"
          value={metrics.completedToday}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* AI Mismatch Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>AI Mismatch Alerts</CardTitle>
            <Badge variant="red">2 NEW</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="red">NEW</Badge>
                    <span className="font-medium">Dell Laptop i7</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Expected: DELL-LAP-001 | Scanned: DELL-LAP-002</p>
                    <p>Location: A-01-R5 | Confidence: 67%</p>
                  </div>
                </div>
                <Button size="sm" variant="primary">
                  Resolve
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Inbound Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border border-gray-200 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{task.id}</span>
                    <Badge variant={task.priority === 'HIGH' ? 'red' : 'yellow'}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{task.deadline}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{task.items} items • {task.zone}</p>
                </div>
                <Button variant="primary" className="w-full">
                  Start Scanning
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

