import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-2.5 rounded-none font-bold uppercase tracking-widest transition-all duration-300 border-2 text-[10px] md:text-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "border-[#D2B48C] text-[#D2B48C] hover:bg-[#D2B48C] hover:text-black shadow-[4px_4px_0px_rgba(210,180,140,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
    secondary: "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 shadow-[4px_4px_0px_rgba(55,65,81,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
    danger: "border-red-900/50 text-red-500 hover:bg-red-900/20 shadow-[4px_4px_0px_rgba(127,29,29,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
    success: "border-green-900/50 text-green-500 hover:bg-green-900/20 shadow-[4px_4px_0px_rgba(20,83,45,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};