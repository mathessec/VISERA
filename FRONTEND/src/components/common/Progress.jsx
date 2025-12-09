import { cn } from '../../utils/helpers';

export default function Progress({ value = 0, max = 100, className, showLabel }) {
  const percentage = (value / max) * 100;
  
  return (
    <div className="w-full">
      <div className={cn('w-full bg-gray-200 rounded-full h-2', className)}>
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-gray-600">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}

