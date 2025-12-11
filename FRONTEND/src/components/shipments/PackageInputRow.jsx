import { X } from 'lucide-react';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';

export default function PackageInputRow({
  packageNumber,
  skuOptions = [],
  selectedSku,
  quantity,
  onSkuChange,
  onQuantityChange,
  onRemove,
  error,
}) {
  return (
    <div className="grid grid-cols-12 gap-4 items-start p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="col-span-1 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-600">
          #{packageNumber}
        </span>
      </div>
      <div className="col-span-5">
        <Select
          label="SKU"
          name={`sku-${packageNumber}`}
          value={selectedSku || ''}
          onChange={(e) => onSkuChange(e.target.value)}
          options={[
            { value: '', label: 'Select SKU...' },
            ...skuOptions.map((sku) => ({
              value: sku.id.toString(),
              label: `${sku.skuCode} - ${sku.productName || 'N/A'}`,
            })),
          ]}
          error={error?.sku}
        />
      </div>
      <div className="col-span-4">
        <Input
          label="Quantity"
          type="number"
          min="1"
          value={quantity || ''}
          onChange={(e) => onQuantityChange(e.target.value)}
          placeholder="Enter quantity"
          error={error?.quantity}
        />
      </div>
      <div className="col-span-2 flex items-end pb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="w-full"
        >
          <X size={16} className="mr-1" />
          Remove
        </Button>
      </div>
    </div>
  );
}

