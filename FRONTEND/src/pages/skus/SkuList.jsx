import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { DataTable, getStatusBadge } from '../../components/shared/DataTable';
import Loading from '../../components/common/Loading';
import api from '../../services/api';

export default function SkuList() {
  const navigate = useNavigate();
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSkus();
  }, []);

  const fetchSkus = async () => {
    try {
      const response = await api.get('/api/skus/getallskudto');
      setSkus(response.data);
    } catch (error) {
      console.error('Error fetching SKUs:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'SKU ID' },
    { key: 'skuCode', label: 'SKU Code' },
    { key: 'productId', label: 'Product ID' },
    { key: 'color', label: 'Color' },
    { key: 'weight', label: 'Weight', render: (value) => value ? `${value} kg` : '-' },
    { key: 'dimensions', label: 'Dimensions' },
    { 
      key: 'status', 
      label: 'Status',
      render: () => getStatusBadge('In Stock')
    },
  ];

  const filteredSkus = skus.filter(sku =>
    sku.skuCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading text="Loading SKUs..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">SKU Management</h1>
          <p className="text-gray-500">Manage Stock Keeping Units</p>
        </div>
        <Button onClick={() => navigate('/skus/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Add SKU
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by SKU code..."
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
            data={filteredSkus}
            onEdit={(row) => navigate(`/skus/${row.id}/edit`)}
            onDelete={(row) => console.log('Delete', row)}
            onView={(row) => navigate(`/skus/${row.id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
