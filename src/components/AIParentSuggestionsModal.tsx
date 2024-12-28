import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Level } from '../types';

interface AIParentSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedParentIds: string[]) => void;
  suggestedParents: Level[];
  loading: boolean;
  error: string | null;
}

export function AIParentSuggestionsModal({
  isOpen,
  onClose,
  onSave,
  suggestedParents,
  loading,
  error
}: AIParentSuggestionsModalProps) {
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedParentIds([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                AI Suggested Parent Levels
              </h3>

              {error && (
                <div className="mb-4 p-4 bg-red-50 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[rgb(255,127,80)]" />
                    <p className="text-sm text-gray-500">Getting suggestions...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestedParents.map((parent) => (
                    <label
                      key={parent.id}
                      className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedParentIds.includes(parent.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParentIds([...selectedParentIds, parent.id]);
                          } else {
                            setSelectedParentIds(selectedParentIds.filter(id => id !== parent.id));
                          }
                        }}
                        className="h-4 w-4 text-[rgb(255,127,80)] rounded border-gray-300 focus:ring-[rgb(255,127,80)]"
                      />
                      <span className="ml-3 text-gray-700">{parent.name}</span>
                    </label>
                  ))}

                  {suggestedParents.length === 0 && !loading && !error && (
                    <p className="text-center text-gray-500 py-8">
                      No additional parent levels suggested
                    </p>
                  )}
                </div>
              )}

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => onSave(selectedParentIds)}
                  disabled={selectedParentIds.length === 0}
                  className="inline-flex w-full justify-center rounded-md bg-[rgb(255,127,80)] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[rgb(255,100,50)] sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Selected Parents
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}