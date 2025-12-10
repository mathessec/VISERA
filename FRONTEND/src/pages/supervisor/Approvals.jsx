import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { formatDateTime } from '../../utils/formatters';

export default function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setApprovals([
        {
          id: 1,
          type: 'AI_MISMATCH',
          title: 'SKU Mismatch Detected',
          description: 'Expected: DELL-LAP-001, Detected: DELL-LAP-002',
          worker: 'John Doe',
          shipmentItem: 'Item #123',
          confidence: '67%',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          type: 'TASK_COMPLETION',
          title: 'Task Completion Request',
          description: 'Putaway task completed for Shipment SH-245',
          worker: 'Jane Smith',
          shipmentItem: 'Item #124',
          createdAt: new Date().toISOString(),
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = async (id) => {
    // Implement approval logic
    setApprovals(approvals.filter(a => a.id !== id));
  };

  const handleReject = async (id) => {
    // Implement rejection logic
    setApprovals(approvals.filter(a => a.id !== id));
  };

  if (loading) return <Loading text="Loading approvals..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve worker actions</p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        {approvals.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              <p className="text-gray-500">No pending approvals</p>
            </div>
          </Card>
        ) : (
          approvals.map((approval) => (
            <Card key={approval.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={approval.type === 'AI_MISMATCH' ? 'red' : 'blue'}>
                      {approval.type === 'AI_MISMATCH' ? 'AI Mismatch' : 'Task Completion'}
                    </Badge>
                    <CardTitle>{approval.title}</CardTitle>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(approval.createdAt)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">{approval.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Worker:</span>
                      <span className="ml-2 font-medium">{approval.worker}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Shipment Item:</span>
                      <span className="ml-2 font-medium">{approval.shipmentItem}</span>
                    </div>
                    {approval.confidence && (
                      <div>
                        <span className="text-gray-500">Confidence:</span>
                        <span className="ml-2 font-medium">{approval.confidence}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="primary"
                      onClick={() => handleApprove(approval.id)}
                    >
                      <CheckCircle size={20} className="mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleReject(approval.id)}
                    >
                      <XCircle size={20} className="mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

