import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import { createShipment } from '../../services/shipmentService';
import { getUserId } from '../../services/authService';

export default function ShipmentCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    shipmentType: 'INBOUND',
    status: 'CREATED',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        createdBy: { id: parseInt(getUserId()) },
      };
      const result = await createShipment(payload);
      navigate(`/shipments/${result.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Creating shipment..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/shipments')}>
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Shipment</h1>
          <p className="text-gray-600 mt-1">Create a new inbound or outbound shipment</p>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            label="Shipment Type"
            name="shipmentType"
            value={formData.shipmentType}
            onChange={handleChange}
            required
            options={[
              { value: 'INBOUND', label: 'Inbound' },
              { value: 'OUTBOUND', label: 'Outbound' },
            ]}
          />

          <Select
            label="Initial Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            options={[
              { value: 'CREATED', label: 'Created' },
              { value: 'ARRIVED', label: 'Arrived' },
            ]}
          />

          <div className="flex gap-4">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Shipment'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/shipments')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
