import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { DataTable, getStatusBadge } from '../../components/shared/DataTable';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

export default function ShipmentList() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await api.get('/api/shipments');
      setShipments(response.data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'Shipment ID', render: (value) => `SH-${value}` },
    { 
      key: 'shipmentType', 
      label: 'Type',
      render: (value) => getStatusBadge(value || 'INBOUND')
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => getStatusBadge(value || 'Pending')
    },
    { key: 'createdBy', label: 'Created By', render: (value, row) => row.createdBy?.name || '-' },
    { key: 'assignedTo', label: 'Assigned To', render: (value, row) => row.assignedTo?.name || 'Unassigned' },
    { key: 'createdAt', label: 'Date', render: (value) => formatDate(value) },
  ];

  const filteredShipments = shipments.filter(shipment =>
    shipment.id?.toString().includes(searchTerm)
  );

  if (loading) return <Loading text="Loading shipments..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Shipment Management</h1>
          <p className="text-gray-500">Track all inbound and outbound shipments</p>
        </div>
        <Button onClick={() => navigate('/shipments/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Shipment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search shipments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredShipments}
            onEdit={(row) => navigate(`/shipments/${row.id}/edit`)}
            onDelete={(row) => console.log('Delete', row)}
            onView={(row) => navigate(`/shipments/${row.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
