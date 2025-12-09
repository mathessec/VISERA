import { cn } from '../../utils/helpers';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  success: 'bg-success text-white hover:bg-success-600',
  danger: 'bg-danger text-white hover:bg-danger-600',
  warning: 'bg-warning text-white hover:bg-warning-600',
  ghost: 'bg-transparent hover:bg-gray-100',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

