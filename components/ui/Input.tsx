import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-xs font-bold uppercase tracking-wider text-[#D2B48C] opacity-80">{label}</label>}
      <input 
        className={`bg-black border-2 border-white/10 rounded-none p-3 text-white focus:outline-none focus:border-[#D2B48C] placeholder-gray-700 transition-all font-medium text-sm ${className}`}
        {...props}
      />
    </div>
  );
};

interface CurrencyInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: number | string;
  onChange: (val: number) => void;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ label, value, onChange, className = '', ...props }) => {
  // Format for display: 1500 -> 1.500
  const displayValue = value !== '' ? Number(value).toLocaleString('es-AR') : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove dots to get raw number
    const rawValue = e.target.value.replace(/\./g, '');
    
    // Allow empty
    if (rawValue === '') {
        onChange(0);
        return;
    }

    if (!isNaN(Number(rawValue))) {
        onChange(Number(rawValue));
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-xs font-bold uppercase tracking-wider text-[#D2B48C] opacity-80">{label}</label>}
      <input 
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={`bg-black border-2 border-white/10 rounded-none p-3 text-white focus:outline-none focus:border-[#D2B48C] placeholder-gray-700 transition-all font-medium text-sm ${className}`}
        placeholder="0"
        {...props}
      />
    </div>
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, children, className = '', ...props }) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-xs font-bold uppercase tracking-wider text-[#D2B48C] opacity-80">{label}</label>}
        <select 
          className={`bg-black border-2 border-white/10 rounded-none p-3 text-white focus:outline-none focus:border-[#D2B48C] transition-all font-medium text-sm appearance-none cursor-pointer ${className}`}
          {...props}
        >
            {children}
        </select>
      </div>
    );
  };