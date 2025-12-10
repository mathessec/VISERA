import { useState, useEffect } from 'react';
import { Package, Scan, CheckCircle, MapPin } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getTasksByUser, updateTaskStatus } from '../../services/taskService';
import { getUserId } from '../../services/authService';

export default function Picking() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);
  const [scanInput, setScanInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const userId = getUserId();
      const tasksData = await getTasksByUser(parseInt(userId));
      const pickingTasks = tasksData.filter(t => t.taskType === 'PICKING' && t.status !== 'COMPLETED');
      setTasks(pickingTasks);
    } catch (err) {
      setError('Failed to load picking tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    if (!scanInput.trim()) return;

    const newItem = {
      id: Date.now(),
      sku: scanInput,
      scannedAt: new Date().toISOString(),
      verified: true,
    };

    setScannedItems([...scannedItems, newItem]);
    setScanInput('');
  };

  const handleCompletePicking = async () => {
    if (!selectedTask) return;

    try {
      await updateTaskStatus(selectedTask.id, 'COMPLETED');
      setSelectedTask(null);
      setScannedItems([]);
      fetchTasks();
    } catch (err) {
      setError('Failed to complete picking task');
    }
  };

  if (loading) return <Loading text="Loading picking tasks..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Picking Operations</h1>
        <p className="text-gray-600 mt-1">Pick items for outbound shipments</p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!selectedTask ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No picking tasks available</p>
                </div>
              </Card>
            </div>
          ) : (
            tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <CardTitle>Task #{task.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge variant="purple">PICKING</Badge>
                    <Badge variant="yellow" className="ml-2">
                      {task.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Shipment Item: #{task.shipmentItemId}</p>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setSelectedTask(task)}
                  >
                    <Package size={20} className="mr-2" />
                    Start Picking
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Picking: Task #{selectedTask.id}</CardTitle>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTask(null);
                  setScannedItems([]);
                }}
              >
                Back to Tasks
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-gray-600">Shipment Item ID</p>
              <p className="font-semibold text-gray-900">#{selectedTask.shipmentItemId}</p>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Scan SKU or bin location..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                className="flex-1"
              />
              <Button variant="primary" onClick={handleScan}>
                <Scan size={20} className="mr-2" />
                Scan
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {scannedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={20} />
                      <span className="font-medium">{item.sku}</span>
                    </div>
                    <Badge variant="green">Picked</Badge>
                  </div>
                </div>
              ))}
            </div>

            {scannedItems.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Picked: {scannedItems.length} items
                  </span>
                  <Button variant="primary" onClick={handleCompletePicking}>
                    <CheckCircle size={20} className="mr-2" />
                    Complete Picking
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

