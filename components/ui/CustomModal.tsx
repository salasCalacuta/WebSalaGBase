
import React, { useState, useEffect } from 'react';

interface CustomModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'prompt' | 'confirm' | 'alert';
  defaultValue?: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  title,
  message,
  type,
  defaultValue = '',
  onConfirm,
  onCancel
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-black border-2 border-green-400 p-6 rounded-none shadow-[0_0_20px_rgba(74,222,128,0.2)] animate-in zoom-in duration-300">
        <h3 className="text-green-400 font-black uppercase tracking-[0.2em] mb-4 border-b border-green-400/30 pb-2">
          {title}
        </h3>
        
        <p className="text-white text-sm uppercase tracking-widest mb-6 leading-relaxed">
          {message}
        </p>

        {type === 'prompt' && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-black border border-green-400/50 text-white p-3 mb-6 focus:outline-none focus:border-green-400 transition-colors uppercase text-xs tracking-widest"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm(inputValue);
              if (e.key === 'Escape') onCancel();
            }}
          />
        )}

        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 border-2 border-red-600 text-blue-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-600/10 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(type === 'prompt' ? inputValue : undefined)}
            className="px-6 py-2 border-2 border-red-600 text-blue-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-600/10 transition-all"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
