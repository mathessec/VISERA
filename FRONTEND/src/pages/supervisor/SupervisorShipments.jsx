import { useState, useEffect } from 'react';
import { Package, User, Search, UserPlus } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAllShipments, assignShipment } from '../../services/shipmentService';
import { getAllUsers } from '../../services/userService';
import { formatDate } from '../../utils/formatters';
import { getStatusColor } from '../../utils/helpers';

export default function SupervisorShipments() {
  const [shipments, setShipments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shipmentsData, usersData] = await Promise.all([
        getAllShipments(),
        getAllUsers(),
      ]);
      setShipments(shipmentsData);
      setWorkers(usersData.filter(u => u.role === 'WORKER'));
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedShipment || !selectedWorker) return;

    try {
      await assignShipment(selectedShipment.id, parseInt(selectedWorker));
      setIsAssignModalOpen(false);
      setSelectedShipment(null);
      setSelectedWorker('');
      fetchData();
    } catch (err) {
      setError('Failed to assign shipment');
    }
  };

  const openAssignModal = (shipment) => {
    setSelectedShipment(shipment);
    setIsAssignModalOpen(true);
  };

  const filteredShipments = shipments.filter(shipment =>
    shipment.id?.toString().includes(searchTerm) ||
    shipment.shipmentType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading text="Loading shipments..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shipment Management</h1>
        <p className="text-gray-600 mt-1">Assign and track shipments</p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <div className="flex items-center gap-4 p-4">
          <div className="flex-1">
            <Input
              placeholder="Search shipments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline">
            <Search size={20} className="mr-2" />
            Search
          </Button>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shipment ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShipments.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell className="font-medium">SH-{shipment.id}</TableCell>
                <TableCell>
                  <Badge variant={shipment.shipmentType === 'INBOUND' ? 'blue' : 'purple'}>
                    {shipment.shipmentType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(shipment.status)}>
                    {shipment.status}
                  </Badge>
                </TableCell>
                <TableCell>{shipment.createdBy?.name || '-'}</TableCell>
                <TableCell>
                  {shipment.assignedTo?.name || (
                    <Badge variant="yellow">Unassigned</Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                <TableCell>
                  {!shipment.assignedTo && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => openAssignModal(shipment)}
                    >
                      <UserPlus size={16} className="mr-1" />
                      Assign
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredShipments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No shipments found
          </div>
        )}
      </Card>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedShipment(null);
          setSelectedWorker('');
        }}
        title="Assign Shipment to Worker"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              Shipment: <span className="font-medium">SH-{selectedShipment?.id}</span>
            </p>
          </div>
          <Select
            label="Select Worker"
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
            options={[
              { value: '', label: 'Select a worker' },
              ...workers.map((w) => ({
                value: w.id.toString(),
                label: `${w.name} (${w.email})`,
              })),
            ]}
          />
          <div className="flex gap-4">
            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={!selectedWorker}
            >
              Assign
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedShipment(null);
                setSelectedWorker('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

