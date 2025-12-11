import * as React from "react";
import { cn } from '../../utils/helpers';

function Input({ className, type, error, label, multiline, rows = 3, ...props }) {
  const baseClassName = cn(
    "placeholder:text-gray-400 selection:bg-primary selection:text-white border-gray-300 flex w-full min-w-0 rounded-md border px-3 py-1 text-base bg-gray-50 transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    "focus-visible:border-primary focus-visible:ring-primary/50 focus-visible:ring-[3px]",
    error && "border-red-500 ring-red-500/20",
    !multiline && "h-9",
    className,
  );

  const inputElement = multiline ? (
    <textarea
      data-slot="textarea"
      rows={rows}
      className={baseClassName}
      {...props}
    />
  ) : (
    <input
      type={type}
      data-slot="input"
      className={baseClassName}
      {...props}
    />
  );

  if (label) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {inputElement}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return inputElement;
}

export default Input;
export { Input };
