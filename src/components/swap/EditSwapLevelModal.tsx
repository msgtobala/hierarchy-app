import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Level } from '../../types';

interface EditSwapLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (levelId: string, newName: string, childIds: string[]) => Promise<void>;
  levelId: string;
  currentName: string;
  children: Level[];
  availableChildren: Level[];
}

export function EditSwapLevelModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentName, 
  levelId,
  children = [], 
  availableChildren = []
}: EditSwapLevelModalProps) {
  const [name, setName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState<Level[]>(children);
  const [showChildSelector, setShowChildSelector] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(levelId, name, selectedChildren.map(c => c.id));
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveChild = (childId: string) => {
    setSelectedChildren(prev => prev.filter(c => c.id !== childId));
  };

  const handleAddChild = (child: Level) => {
    if (!selectedChildren.find(c => c.id === child.id)) {
      setSelectedChildren(prev => [...prev, child]);
    }
    setShowChildSelector(false);
  };

  const availableChildrenToAdd = Array.isArray(availableChildren) 
    ? availableChildren.filter(child => 
        !selectedChildren.some(c => c.id === child.id)
      )
    : [];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-visible rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Edit Level
              </h3>
              <form onSubmit={handleSubmit} className="mt-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child Levels
                  </label>
                  <div className="space-y-2">
                    {selectedChildren.map((child) => (
                      <div 
                        key={child.id} 
                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                      >
                        <span className="text-sm text-gray-700">{child.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChild(child.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowChildSelector(!showChildSelector)}
                        className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Child Level
                      </button>

                      {showChildSelector && availableChildrenToAdd.length > 0 && (
                        <div className="absolute z-[150] mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 py-1 max-h-48 overflow-auto">
                          {availableChildrenToAdd.map((child) => (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => handleAddChild(child)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {child.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full justify-center rounded-md bg-coral-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-coral-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}