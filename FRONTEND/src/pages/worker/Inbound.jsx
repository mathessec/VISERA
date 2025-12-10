import { useState, useEffect } from 'react';
import { Package, Scan, CheckCircle, AlertTriangle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getAllShipments } from '../../services/shipmentService';

export default function Inbound() {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);
  const [scanInput, setScanInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInboundShipments();
  }, []);

  const fetchInboundShipments = async () => {
    try {
      const data = await getAllShipments();
      const inbound = data.filter(s => s.shipmentType === 'INBOUND' && s.status !== 'SHIPPED');
      setShipments(inbound);
    } catch (err) {
      setError('Failed to load inbound shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    if (!scanInput.trim()) return;

    // Mock scanning logic - replace with actual barcode scanning
    const newItem = {
      id: Date.now(),
      sku: scanInput,
      scannedAt: new Date().toISOString(),
      verified: Math.random() > 0.3, // Mock verification
    };

    setScannedItems([...scannedItems, newItem]);
    setScanInput('');
  };

  const handleStartScanning = (shipment) => {
    setSelectedShipment(shipment);
    setScannedItems([]);
  };

  if (loading) return <Loading text="Loading inbound shipments..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inbound Operations</h1>
        <p className="text-gray-600 mt-1">Scan and receive inbound shipments</p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!selectedShipment ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shipments.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No inbound shipments available</p>
                </div>
              </Card>
            </div>
          ) : (
            shipments.map((shipment) => (
              <Card key={shipment.id}>
                <CardHeader>
                  <CardTitle>Shipment SH-{shipment.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge variant="blue">INBOUND</Badge>
                    <Badge variant="yellow" className="ml-2">
                      {shipment.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Created: {new Date(shipment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleStartScanning(shipment)}
                  >
                    <Scan size={20} className="mr-2" />
                    Start Scanning
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Scanning: Shipment SH-{selectedShipment.id}</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedShipment(null);
                    setScannedItems([]);
                  }}
                >
                  Back to List
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Scan or enter SKU code..."
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

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {scannedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border ${
                      item.verified
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.verified ? (
                          <CheckCircle className="text-green-600" size={20} />
                        ) : (
                          <AlertTriangle className="text-red-600" size={20} />
                        )}
                        <span className="font-medium">{item.sku}</span>
                      </div>
                      <Badge variant={item.verified ? 'green' : 'red'}>
                        {item.verified ? 'Verified' : 'Mismatch'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {scannedItems.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Scanned: {scannedItems.length} items
                    </span>
                    <Button variant="primary">
                      Complete Receiving
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

