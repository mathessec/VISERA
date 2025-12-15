import { MapPin, CheckCircle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function PutawayItemCard({ item, onStartPutaway }) {
  const statusVariant = item.status === 'IN_PROGRESS' ? 'blue' : 'yellow';
  const statusText = item.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Task #{item.id}</CardTitle>
          <Badge variant={statusVariant}>{statusText}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-900">{item.productName}</p>
          <p className="text-xs text-gray-500 mt-1">SKU: {item.skuCode}</p>
          <p className="text-xs text-gray-500">Category: {item.category}</p>
          <p className="text-sm text-gray-700 mt-2">
            <span className="font-medium">Quantity:</span> {item.quantity} units
          </p>
        </div>

        {item.suggestedLocation && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">Suggested Location</p>
                <p className="text-sm font-semibold text-gray-900">
                  {item.suggestedBinCode || 'N/A'}
                </p>
                {item.suggestedZoneName && (
                  <p className="text-xs text-gray-600 mt-1">{item.suggestedZoneName}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {item.hasOverflow && item.allocationPlan && item.allocationPlan.length > 1 && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            <p className="font-medium mb-1">Multiple bins required:</p>
            <ul className="list-disc list-inside space-y-1">
              {item.allocationPlan.map((alloc, idx) => (
                <li key={idx}>
                  {alloc.quantity} units in {alloc.binCode || `Bin ${alloc.binId}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          variant="primary"
          className="w-full"
          onClick={() => onStartPutaway(item)}
        >
          <MapPin size={20} className="mr-2" />
          Start Putaway
        </Button>
      </CardContent>
    </Card>
  );
}
