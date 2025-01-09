import { useState } from 'react';

interface SelectControlProps {
  label: string;
  options: { value: string; label: string; }[];
  value: string;
  onChange: (value: string) => void;
}

export function SelectControl({ label, options, value, onChange }: SelectControlProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          Failed to load {label.toLowerCase()} options
          <button
            onClick={() => setHasError(false)}
            className="ml-2 text-red-700 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <select
          className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none cursor-pointer"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  } catch (error) {
    setHasError(true);
    return null;
  }
} 