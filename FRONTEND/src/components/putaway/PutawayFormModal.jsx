import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Alert from '../common/Alert';
import { getAllZones } from '../../services/zoneService';
import { getRacksByZone } from '../../services/rackService';
import { getBinsByRack } from '../../services/binService';

export default function PutawayFormModal({ isOpen, onClose, item, onComplete }) {
  const [zones, setZones] = useState([]);
  const [racks, setRacks] = useState([]);
  const [bins, setBins] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedRack, setSelectedRack] = useState('');
  const [selectedBin, setSelectedBin] = useState('');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && item) {
      // Pre-populate with suggested location
      if (item.suggestedZoneId) {
        setSelectedZone(item.suggestedZoneId.toString());
      }
      if (item.suggestedBinId) {
        setSelectedBin(item.suggestedBinId.toString());
      }
      setQuantity(item.quantity || 1);
      fetchZones();
    }
  }, [isOpen, item]);

  useEffect(() => {
    if (selectedZone) {
      fetchRacks();
    } else {
      setRacks([]);
      setBins([]);
      setSelectedRack('');
      setSelectedBin('');
    }
  }, [selectedZone]);

  useEffect(() => {
    if (selectedRack) {
      fetchBins();
    } else {
      setBins([]);
      setSelectedBin('');
    }
  }, [selectedRack]);

  const fetchZones = async () => {
    try {
      const data = await getAllZones();
      setZones(data);
    } catch (err) {
      setError('Failed to load zones');
    }
  };

  const fetchRacks = async () => {
    try {
      const data = await getRacksByZone(parseInt(selectedZone));
      setRacks(data);
      // Try to find the suggested rack if we have a suggested bin
      if (item?.suggestedBinId && data.length > 0) {
        // We'll need to match by bin, but for now just select first rack
        // The bin selection will handle the matching
      }
    } catch (err) {
      setError('Failed to load racks');
    }
  };

  const fetchBins = async () => {
    try {
      const data = await getBinsByRack(parseInt(selectedRack));
      setBins(data);
      // Pre-select suggested bin if available
      if (item?.suggestedBinId) {
        const suggestedBin = data.find(b => b.id === item.suggestedBinId);
        if (suggestedBin) {
          setSelectedBin(item.suggestedBinId.toString());
        }
      }
    } catch (err) {
      setError('Failed to load bins');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedBin || !quantity || quantity <= 0) {
      setError('Please select a bin and enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      // Check if we need to use allocation plan
      if (item?.hasOverflow && item?.allocationPlan && item.allocationPlan.length > 1) {
        // Use multi-bin allocation
        const allocations = item.allocationPlan.map(alloc => ({
          binId: alloc.binId,
          quantity: alloc.quantity
        }));
        await onComplete(item.id, null, null, allocations);
      } else {
        // Single bin allocation
        await onComplete(item.id, parseInt(selectedBin), parseInt(quantity), null);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete putaway');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Putaway: ${item.productName}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600">Shipment Item ID</p>
          <p className="font-semibold text-gray-900">#{item.shipmentItemId}</p>
          <p className="text-sm text-gray-600 mt-2">SKU: {item.skuCode}</p>
        </div>

        {item.hasOverflow && item.allocationPlan && item.allocationPlan.length > 1 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              Multiple bins required due to capacity:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
              {item.allocationPlan.map((alloc, idx) => (
                <li key={idx}>
                  {alloc.quantity} units → {alloc.binCode || `Bin ${alloc.binId}`}
                </li>
              ))}
            </ul>
            <p className="text-xs text-yellow-600 mt-2">
              The system will automatically allocate to these bins.
            </p>
          </div>
        )}

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
                ...bins.map((b) => ({
                  value: b.id.toString(),
                  label: `${b.name}${b.code ? ` (${b.code})` : ''}`,
                })),
              ]}
            />
          )}

          <Input
            label="Quantity"
            type="number"
            min="1"
            max={item.quantity}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            disabled={item.hasOverflow && item.allocationPlan && item.allocationPlan.length > 1}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!selectedBin || !quantity || loading}
            className="flex-1"
          >
            <CheckCircle size={20} className="mr-2" />
            {loading ? 'Completing...' : 'Complete Putaway'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
