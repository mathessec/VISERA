import { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { getVerificationLogsByShipmentItem } from '../../services/verificationLogService';
import { formatDateTime } from '../../utils/formatters';

export default function VerificationLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shipmentItemId, setShipmentItemId] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('ALL');

  const handleSearch = async () => {
    if (!shipmentItemId) {
      setError('Please enter a shipment item ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getVerificationLogsByShipmentItem(parseInt(shipmentItemId));
      setLogs(data);
    } catch (err) {
      setError('Failed to load verification logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (confidenceFilter === 'ALL') return true;
    const confidence = parseFloat(log.confidence || 0);
    if (confidenceFilter === 'HIGH') return confidence >= 80;
    if (confidenceFilter === 'MEDIUM') return confidence >= 50 && confidence < 80;
    if (confidenceFilter === 'LOW') return confidence < 50;
    return true;
  });

  const getConfidenceColor = (confidence) => {
    const conf = parseFloat(confidence || 0);
    if (conf >= 80) return 'green';
    if (conf >= 50) return 'yellow';
    return 'red';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Verification Logs</h1>
        <p className="text-gray-600 mt-1">View AI-powered verification history and mismatches</p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Shipment Item ID"
              type="number"
              value={shipmentItemId}
              onChange={(e) => setShipmentItemId(e.target.value)}
              placeholder="Enter shipment item ID"
            />
            <Select
              label="Confidence Filter"
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Confidence Levels' },
                { value: 'HIGH', label: 'High (≥80%)' },
                { value: 'MEDIUM', label: 'Medium (50-79%)' },
                { value: 'LOW', label: 'Low (<50%)' },
              ]}
            />
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={loading || !shipmentItemId}
                className="w-full"
              >
                <Search size={20} className="mr-2" />
                {loading ? 'Searching...' : 'Search Logs'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <Loading text="Loading verification logs..." />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>Shipment Item</TableHead>
                  <TableHead>Expected SKU</TableHead>
                  <TableHead>Detected SKU</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">#{log.id}</TableCell>
                    <TableCell>Item #{log.shipmentItemId}</TableCell>
                    <TableCell>{log.expectedSku || '-'}</TableCell>
                    <TableCell>{log.detectedSku || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getConfidenceColor(log.confidence)}>
                        {log.confidence ? `${log.confidence}%` : 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.mismatch ? 'red' : 'green'}>
                        {log.mismatch ? 'Mismatch' : 'Match'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredLogs.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle size={48} className="mx-auto mb-4 text-gray-400" />
                <p>No verification logs found. Enter a shipment item ID to search.</p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

