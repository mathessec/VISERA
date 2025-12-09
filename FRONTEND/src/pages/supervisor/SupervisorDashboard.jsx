import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Users, CheckCircle } from 'lucide-react';
import MetricCard from '../../components/common/MetricCard';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function SupervisorDashboard() {
  const [metrics] = useState({
    activeShipments: 15,
    pendingApprovals: 5,
    activeWorkers: 12,
    completedToday: 28,
  });

  const [mismatches] = useState([
    {
      id: 'MIS-001',
      product: 'Dell Laptop i7',
      sku: 'DELL-LAP-001',
      worker: 'John Doe',
      confidence: '67%',
      location: 'A-01-R5',
    },
    {
      id: 'MIS-002',
      product: 'iPhone 15 Pro',
      sku: 'APPL-IPH-015',
      worker: 'Jane Smith',
      confidence: '58%',
      location: 'B-03-R2',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor operations and manage your team</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Shipments"
          value={metrics.activeShipments}
          icon={Package}
          color="orange"
        />
        <MetricCard
          title="Pending Approvals"
          value={metrics.pendingApprovals}
          icon={AlertTriangle}
          color="orange"
        />
        <MetricCard
          title="Active Workers"
          value={metrics.activeWorkers}
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Completed Today"
          value={metrics.completedToday}
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* AI Mismatch Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI Mismatch Alerts</CardTitle>
            <Badge variant="red">NEW</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mismatches.map((mismatch) => (
              <div
                key={mismatch.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="red">{mismatch.id}</Badge>
                    <span className="font-medium text-gray-900">{mismatch.product}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-x-4">
                    <span>SKU: {mismatch.sku}</span>
                    <span>Worker: {mismatch.worker}</span>
                    <span>Confidence: {mismatch.confidence}</span>
                    <span>Location: {mismatch.location}</span>
                  </div>
                </div>
                <Button size="sm" variant="primary">
                  Resolve
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Worker Task Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Worker Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['John Doe', 'Jane Smith', 'Mike Johnson'].map((worker, i) => (
              <div key={worker} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{worker}</span>
                  <Badge variant={i === 0 ? 'yellow' : 'green'}>
                    {i === 0 ? 'In Progress' : 'Completed'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Task: Putaway - Ship #SH-{245 + i}</p>
                  <p>Items: {15 - i * 2} / {20 - i * 3}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

