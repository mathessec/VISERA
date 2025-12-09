import { useState, useEffect } from 'react';
import { MapPin, Scan, Package, CheckCircle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getTasksByUser } from '../../services/taskService';
import { createStock } from '../../services/inventoryService';
import { updateTaskStatus } from '../../services/taskService';
import { getAllZones } from '../../services/zoneService';
import { getRacksByZone } from '../../services/rackService';
import { getBinsByRack } from '../../services/binService';
import { getUserId } from '../../services/authService';

export default function Putaway() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [zones, setZones] = useState([]);
  const [racks, setRacks] = useState([]);
  const [bins, setBins] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedRack, setSelectedRack] = useState('');
  const [selectedBin, setSelectedBin] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      fetchRacks();
    }
  }, [selectedZone]);

  useEffect(() => {
    if (selectedRack) {
      fetchBins();
    }
  }, [selectedRack]);

  const fetchData = async () => {
    try {
      const userId = getUserId();
      const [tasksData, zonesData] = await Promise.all([
        getTasksByUser(parseInt(userId)),
        getAllZones(),
      ]);
      const putawayTasks = tasksData.filter(t => t.taskType === 'PUTAWAY' && t.status !== 'COMPLETED');
      setTasks(putawayTasks);
      setZones(zonesData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRacks = async () => {
    try {
      const data = await getRacksByZone(parseInt(selectedZone));
      setRacks(data);
    } catch (err) {
      setError('Failed to load racks');
    }
  };

  const fetchBins = async () => {
    try {
      const data = await getBinsByRack(parseInt(selectedRack));
      setBins(data);
    } catch (err) {
      setError('Failed to load bins');
    }
  };

  const handlePutaway = async () => {
    if (!selectedTask || !selectedBin || !quantity) {
      setError('Please fill all fields');
      return;
    }

    try {
      // Create inventory stock entry
      await createStock({
        skuId: selectedTask.shipmentItemId, // This would be the actual SKU ID
        binId: parseInt(selectedBin),
        quantity: parseInt(quantity),
      });

      // Update task status
      await updateTaskStatus(selectedTask.id, 'COMPLETED');

      setSelectedTask(null);
      setSelectedZone('');
      setSelectedRack('');
      setSelectedBin('');
      setQuantity(1);
      fetchData();
    } catch (err) {
      setError('Failed to complete putaway');
    }
  };

  if (loading) return <Loading text="Loading putaway tasks..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Putaway Operations</h1>
        <p className="text-gray-600 mt-1">Assign received items to storage bins</p>
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
                  <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No putaway tasks available</p>
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
                    <Badge variant="blue">PUTAWAY</Badge>
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
                    <MapPin size={20} className="mr-2" />
                    Start Putaway
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
              <CardTitle>Putaway: Task #{selectedTask.id}</CardTitle>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTask(null);
                  setSelectedZone('');
                  setSelectedRack('');
                  setSelectedBin('');
                }}
              >
                Back to Tasks
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">Shipment Item ID</p>
              <p className="font-semibold text-gray-900">#{selectedTask.shipmentItemId}</p>
            </div>

            <div className="space-y-4">
              <Select
                label="Select Zone"
                value={selectedZone}
                onChange={(e) => {
                  setSelectedZone(e.target.value);
                  setSelectedRack('');
                  setSelectedBin('');
                }}
                options={[
                  { value: '', label: 'Select a zone' },
                  ...zones.map((z) => ({ value: z.id.toString(), label: z.name })),
                ]}
              />

              {selectedZone && (
                <Select
                  label="Select Rack"
                  value={selectedRack}
                  onChange={(e) => {
                    setSelectedRack(e.target.value);
                    setSelectedBin('');
                  }}
                  options={[
                    { value: '', label: 'Select a rack' },
                    ...racks.map((r) => ({ value: r.id.toString(), label: r.name })),
                  ]}
                />
              )}

              {selectedRack && (
                <Select
                  label="Select Bin"
                  value={selectedBin}
                  onChange={(e) => setSelectedBin(e.target.value)}
                  options={[
                    { value: '', label: 'Select a bin' },
                    ...bins.map((b) => ({ value: b.id.toString(), label: b.name })),
                  ]}
                />
              )}

              <Input
                label="Quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="primary"
                onClick={handlePutaway}
                disabled={!selectedBin || !quantity}
                className="flex-1"
              >
                <CheckCircle size={20} className="mr-2" />
                Complete Putaway
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

