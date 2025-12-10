import { useState } from 'react';
import { Truck, AlertTriangle, Users, CheckCircle } from 'lucide-react';
import { StatsCard } from '../../components/shared/StatsCard';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';

export default function SupervisorDashboard() {
  const [metrics] = useState({
    activeShipments: 8,
    pendingApprovals: 5,
    activeWorkers: 12,
    completedToday: 45,
  });

  const pendingMismatches = [
    {
      id: 'MIS-001',
      predictedSku: 'SKU001',
      scannedSku: 'SKU002',
      worker: 'Emily Brown',
      confidence: 67,
    },
    {
      id: 'MIS-002',
      predictedSku: 'SKU005',
      scannedSku: 'SKU006',
      worker: 'David Wilson',
      confidence: 78,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Supervisor Dashboard</h1>
        <p className="text-gray-500">Monitor operations and manage approvals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Shipments"
          value={metrics.activeShipments}
          icon={Truck}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Pending Approvals"
          value={pendingMismatches.length}
          icon={AlertTriangle}
          iconBgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatsCard
          title="Active Workers"
          value={metrics.activeWorkers}
          icon={Users}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Tasks Completed Today"
          value={metrics.completedToday}
          icon={CheckCircle}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>AI Mismatch Alerts</CardTitle>
              <Link to="/supervisor/approvals">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingMismatches.slice(0, 4).map((mismatch) => (
                <div key={mismatch.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-900">{mismatch.id}</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Pending
                    </Badge>
                  </div>
                  <p className="text-gray-600">
                    Predicted: {mismatch.predictedSku} → Scanned: {mismatch.scannedSku}
                  </p>
                  <p className="text-gray-500">
                    Worker: {mismatch.worker} • Confidence: {mismatch.confidence}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Worker Task Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
    </div>
  );
}
