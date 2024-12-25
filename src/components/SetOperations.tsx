import React from 'react';
import { X } from 'lucide-react';

interface SetOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOperation: 'union' | 'intersection' | 'difference' | null;
  onOperationChange: (operation: 'union' | 'intersection' | 'difference' | null) => void;
}

export function SetOperationsModal({ 
  isOpen, 
  onClose, 
  selectedOperation,
  onOperationChange 
}: SetOperationsModalProps) {
  if (!isOpen) return null;

  const handleOperationSelect = (operation: 'union' | 'intersection' | 'difference') => {
    onOperationChange(operation === selectedOperation ? null : operation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              Set Operations
            </h3>
            
            <div className="space-y-2">
              <button 
                onClick={() => handleOperationSelect('union')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedOperation === 'union' 
                    ? 'bg-coral-50 text-coral-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">Union</div>
                <div className="text-sm text-gray-500">Show items that match any selected filter</div>
              </button>
              
              <button 
                onClick={() => handleOperationSelect('intersection')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedOperation === 'intersection' 
                    ? 'bg-coral-50 text-coral-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">Intersection</div>
                <div className="text-sm text-gray-500">Show items that match all selected filters</div>
              </button>
              
              <button 
                onClick={() => handleOperationSelect('difference')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedOperation === 'difference' 
                    ? 'bg-coral-50 text-coral-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">Difference</div>
                <div className="text-sm text-gray-500">Show items that don't match selected filters</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}