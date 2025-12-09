import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Barcode } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
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

  const filteredSkus = skus.filter(sku =>
    sku.skuCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading text="Loading SKUs..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SKU Management</h1>
          <p className="text-gray-600 mt-1">Manage Stock Keeping Units</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/skus/create')}>
          <Plus size={20} className="mr-2" />
          Add SKU
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by SKU code..."
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

      {/* SKUs Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU ID</TableHead>
              <TableHead>SKU Code</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSkus.map((sku) => (
              <TableRow key={sku.id}>
                <TableCell>#{sku.id}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Barcode size={16} />
                    {sku.skuCode}
                  </div>
                </TableCell>
                <TableCell>Product #{sku.productId}</TableCell>
                <TableCell>{sku.color || '-'}</TableCell>
                <TableCell>{sku.weight ? `${sku.weight} kg` : '-'}</TableCell>
                <TableCell>{sku.dimensions || '-'}</TableCell>
                <TableCell>
                  <Badge variant="green">In Stock</Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredSkus.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No SKUs found
          </div>
        )}
      </Card>
    </div>
  );
}
