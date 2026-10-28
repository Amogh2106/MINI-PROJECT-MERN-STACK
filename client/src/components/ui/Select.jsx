import React, { forwardRef } from 'react';

const Select = forwardRef(
  ({ label, id, error, options = [], placeholder, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`block w-full px-3 py-1.5 text-sm bg-white border rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 disabled:bg-gray-100 disabled:text-gray-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
