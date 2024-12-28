import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SnackbarProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Snackbar({ message, onClose, duration = 3000 }: SnackbarProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-50 text-green-800 rounded-lg shadow-lg p-4 flex items-center space-x-3">
        <CheckCircle className="h-5 w-5 text-green-400" />
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-green-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-green-500" />
        </button>
      </div>
    </div>
  );
}