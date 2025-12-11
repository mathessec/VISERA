import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, Calendar, X, UserPlus } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import MultiSelect from '../../components/common/MultiSelect';
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import { getShipmentById } from '../../services/shipmentService';
import { getAssignedWorkers, assignWorkers, removeWorker } from '../../services/shipmentService';
import { getItemsByShipment } from '../../services/shipmentItemService';
import { getAllUsers } from '../../services/userService';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { getStatusColor } from '../../utils/helpers';
import { isAdmin, isSupervisor } from '../../services/authService';

export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [packages, setPackages] = useState([]);
  const [assignedWorkers, setAssignedWorkers] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      const [shipmentData, packagesData, workersData, usersData] = await Promise.all([
        getShipmentById(id),
        getItemsByShipment(id),
        getAssignedWorkers(id),
        getAllUsers(),
      ]);
      setShipment(shipmentData);
      setPackages(packagesData);
      setAssignedWorkers(workersData);
      setAllWorkers(usersData.filter((u) => u.role === 'WORKER'));
    } catch (err) {
      console.error('Error fetching shipment:', err);
      setError('Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWorkers = async () => {
    if (selectedWorkers.length === 0) {
      setError('Please select at least one worker');
      return;
    }

    setAssigning(true);
    setError('');

    try {
      await assignWorkers(id, selectedWorkers);
      await fetchShipment();
      setIsAssignModalOpen(false);
      setSelectedWorkers([]);
    } catch (err) {
      setError('Failed to assign workers');
      console.error('Error assigning workers:', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to remove this worker?')) {
      return;
    }

    try {
      await removeWorker(id, workerId);
      await fetchShipment();
    } catch (err) {
      setError('Failed to remove worker');
      console.error('Error removing worker:', err);
    }
  };

  if (loading) return <Loading text="Loading shipment..." />;
  if (error && !shipment) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/shipments')}>
          <ArrowLeft size={20} className="mr-2" />
          Back to Shipments
        </Button>
        <Card>
          <div className="text-center py-8 text-gray-500">{error || 'Shipment not found'}</div>
        </Card>
      </div>
    );
  }

  const canManageWorkers = isAdmin() || isSupervisor();
  const workerOptions = allWorkers
    .filter((w) => !assignedWorkers.some((aw) => aw.id === w.id))
    .map((worker) => ({
      value: worker.id,
      label: worker.name,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/shipments')}>
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shipment SH-{shipment.id}</h1>
            <p className="text-gray-600 mt-1">Shipment Details</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Shipment ID</label>
                  <p className="text-gray-900 font-semibold">SH-{shipment.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <div className="mt-1">
                    <Badge variant={shipment.shipmentType === 'INBOUND' ? 'blue' : 'purple'}>
                      {shipment.shipmentType}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusColor(shipment.status)}>
                      {shipment.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar size={16} />
                    Deadline
                  </label>
                  <p className={`text-gray-900 mt-1 ${shipment.deadline && new Date(shipment.deadline) < new Date() ? 'text-red-600 font-medium' : ''}`}>
                    {shipment.deadline ? formatDate(shipment.deadline) : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-gray-900">{formatDateTime(shipment.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Packages</label>
                  <p className="text-gray-900 font-semibold">{shipment.packageCount || packages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Packages</CardTitle>
            </CardHeader>
            <CardContent>
              {packages.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package #</TableHead>
                      <TableHead>SKU Code</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg, index) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{pkg.skuCode || 'N/A'}</TableCell>
                        <TableCell>{pkg.productName || 'N/A'}</TableCell>
                        <TableCell>{pkg.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(pkg.status)}>
                            {pkg.status || 'CREATED'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No packages added yet. Packages will be displayed here once added to the shipment.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <User size={16} />
                  Created By
                </label>
                <p className="text-gray-900 mt-1">{shipment.createdBy?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{shipment.createdBy?.email}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User size={16} />
                    Assigned Workers
                  </label>
                  {canManageWorkers && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAssignModalOpen(true)}
                    >
                      <UserPlus size={16} className="mr-1" />
                      Add
                    </Button>
                  )}
                </div>
                {assignedWorkers.length > 0 ? (
                  <div className="space-y-2">
                    {assignedWorkers.map((worker) => (
                      <div
                        key={worker.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{worker.name}</p>
                          <p className="text-xs text-gray-500">{worker.email}</p>
                        </div>
                        {canManageWorkers && (
                          <button
                            onClick={() => handleRemoveWorker(worker.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove worker"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No workers assigned</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-xs text-gray-500">{formatDate(shipment.createdAt)}</p>
                </div>
              </div>
              {shipment.deadline && (
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${new Date(shipment.deadline) < new Date() ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Deadline</p>
                    <p className={`text-xs ${new Date(shipment.deadline) < new Date() ? 'text-red-600' : 'text-gray-500'}`}>
                      {formatDate(shipment.deadline)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Workers Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedWorkers([]);
        }}
        title="Assign Workers"
      >
        <div className="space-y-4">
          <MultiSelect
            label="Select Workers"
            options={workerOptions}
            value={selectedWorkers}
            onChange={setSelectedWorkers}
            placeholder="Select workers..."
            searchable
          />
          {error && <Alert variant="error">{error}</Alert>}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedWorkers([]);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignWorkers} disabled={assigning}>
              {assigning ? 'Assigning...' : 'Assign Workers'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
