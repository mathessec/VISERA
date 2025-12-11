import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import MultiSelect from '../../components/common/MultiSelect';
import PackageInputRow from '../../components/shipments/PackageInputRow';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import { createShipment, assignWorkers } from '../../services/shipmentService';
import { createBatchItems } from '../../services/shipmentItemService';
import { getAllUsers } from '../../services/userService';
import { getAllSkus } from '../../services/skuService';
import { getUserId } from '../../services/authService';

export default function ShipmentCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [workers, setWorkers] = useState([]);
  const [skus, setSkus] = useState([]);
  
  // Set default deadline to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDeadline = tomorrow.toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    shipmentType: 'INBOUND',
    status: 'CREATED',
    deadline: defaultDeadline,
    selectedWorkers: [],
  });
  
  const [packages, setPackages] = useState([
    { skuId: '', quantity: '' },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workersData, skusData] = await Promise.all([
        getAllUsers(),
        getAllSkus(),
      ]);
      setWorkers(workersData.filter((u) => u.role === 'WORKER'));
      setSkus(skusData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleWorkersChange = (selectedIds) => {
    setFormData({ ...formData, selectedWorkers: selectedIds });
  };

  const handleAddPackage = () => {
    setPackages([...packages, { skuId: '', quantity: '' }]);
  };

  const handleRemovePackage = (index) => {
    if (packages.length > 1) {
      setPackages(packages.filter((_, i) => i !== index));
    }
  };

  const handlePackageChange = (index, field, value) => {
    const newPackages = [...packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    setPackages(newPackages);
  };

  const validateForm = () => {
    if (!formData.deadline) {
      setError('Deadline is required');
      return false;
    }

    if (packages.length === 0) {
      setError('At least one package is required');
      return false;
    }

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      if (!pkg.skuId || !pkg.quantity || parseInt(pkg.quantity) <= 0) {
        setError(`Package ${i + 1} must have a valid SKU and quantity`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setError('');
    setSaving(true);

    try {
      const userId = getUserId();
      if (!userId) {
        setError('User ID not found. Please log in again.');
        setSaving(false);
        return;
      }

      // Step 1: Create shipment
      const shipmentPayload = {
        shipmentType: formData.shipmentType,
        status: formData.status,
        deadline: formData.deadline,
        createdBy: { id: parseInt(userId) },
      };
      
      const shipment = await createShipment(shipmentPayload);

      // Step 2: Assign workers if any selected
      if (formData.selectedWorkers.length > 0) {
        await assignWorkers(shipment.id, formData.selectedWorkers);
      }

      // Step 3: Create packages
      const packagePayload = packages.map((pkg) => ({
        shipment: { id: shipment.id },
        sku: { id: parseInt(pkg.skuId) },
        quantity: parseInt(pkg.quantity),
        status: 'PENDING',
      }));

      await createBatchItems(packagePayload);

      // Navigate to shipment detail page
      navigate(`/shipments/${shipment.id}`);
    } catch (err) {
      console.error('Error creating shipment:', err);
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Failed to create shipment';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Loading..." />;

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

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shipment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Shipment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                { value: 'IN_TRANSIT', label: 'In Transit' },
                { value: 'ARRIVED', label: 'Arrived' },
              ]}
            />

            <Input
              label="Deadline"
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </CardContent>
        </Card>

        {/* Worker Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Worker Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiSelect
              label="Assign Workers"
              options={workers.map((w) => ({
                value: w.id,
                label: `${w.name} (${w.email})`,
              }))}
              value={formData.selectedWorkers}
              onChange={handleWorkersChange}
              placeholder="Select workers to assign..."
            />
          </CardContent>
        </Card>

        {/* Package Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Package Details</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPackage}
              >
                <Plus size={16} className="mr-2" />
                Add Package
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {packages.map((pkg, index) => (
              <PackageInputRow
                key={index}
                pkg={pkg}
                index={index}
                skus={skus}
                onChange={handlePackageChange}
                onRemove={handleRemovePackage}
              />
            ))}
            {packages.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No packages added. Click "Add Package" to add items.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Creating...' : 'Create Shipment'}
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
    </div>
  );
}
