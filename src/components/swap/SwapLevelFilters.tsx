import React from 'react';
import { ChevronDown, Check, GitCompare } from 'lucide-react';
import { Level } from '../../types';
import { SetOperationsModal } from '../common/SetOperationsModal';

interface SwapLevelFiltersProps {
  currentLevel: number;
  showVerified: boolean;
  showUnverified: boolean;
  onVerifiedChange: (checked: boolean) => void;
  onUnverifiedChange: (checked: boolean) => void;
  levelItems: Record<number, Level[]>;
  selectedLevelItems: Record<number, string[]>;
  onLevelItemsChange: (level: number, items: string[]) => void;
  selectedOperation: 'union' | 'intersection' | 'difference' | null;
  onOperationChange: (operation: 'union' | 'intersection' | 'difference' | null) => void;
}

export function SwapLevelFilters({
  currentLevel,
  showVerified,
  showUnverified,
  onVerifiedChange,
  onUnverifiedChange,
  levelItems,
  selectedLevelItems,
  onLevelItemsChange,
  selectedOperation,
  onOperationChange,
}: SwapLevelFiltersProps) {
  const [openLevels, setOpenLevels] = React.useState<Record<number, boolean>>({});
  const dropdownRefs = React.useRef<Record<number, HTMLDivElement | null>>({});
  const buttonRefs = React.useRef<Record<number, HTMLButtonElement | null>>({});
  const [showSetOperations, setShowSetOperations] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(buttonRefs.current).forEach(([level, ref]) => {
        if (ref && !ref.contains(event.target as Node) && 
            dropdownRefs.current[parseInt(level)] && 
            !dropdownRefs.current[parseInt(level)]?.contains(event.target as Node)) {
          setOpenLevels(prev => ({ ...prev, [level]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLevelToggle = (level: number, itemId: string) => {
    const currentSelected = selectedLevelItems[level] || [];
    
    if (itemId === '') {
      // Clear selection
      onLevelItemsChange(level, []);
    } else if (currentSelected.includes(itemId)) {
      // Deselect if already selected
      onLevelItemsChange(level, []);
    } else {
      // Select new item
      onLevelItemsChange(level, [itemId]);
    }
    
    setOpenLevels(prev => ({ ...prev, [level]: false }));
  };

  const getLevelDisplayText = (level: number) => {
    const selectedItems = selectedLevelItems[level] || [];
    if (selectedItems.length === 0) return 'All';
    
    const selectedItem = levelItems[level]?.find(item => item.id === selectedItems[0]);
    return selectedItem?.name || 'All';
  };

  return (
    <div className="space-y-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showVerified}
              onChange={(e) => onVerifiedChange(e.target.checked)}
              className="form-checkbox h-4 w-4 text-coral-600 rounded border-gray-300 focus:ring-coral-500"
            />
            <span className="ml-2 text-sm text-gray-600 font-medium">
              Show Verified
            </span>
          </label>
          
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showUnverified}
              onChange={(e) => onUnverifiedChange(e.target.checked)}
              className="form-checkbox h-4 w-4 text-coral-600 rounded border-gray-300 focus:ring-coral-500"
            />
            <span className="ml-2 text-sm text-gray-600 font-medium">
              Show Unverified
            </span>
          </label>
        </div>

        <div className="flex items-center space-x-4">
          {Array.from({ length: currentLevel }, (_, i) => i + 1).map((level) => (
            <div key={level} className="relative">
              <button
                ref={el => buttonRefs.current[level] = el}
                onClick={() => setOpenLevels(prev => ({ ...prev, [level]: !prev[level] }))}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-500"
              >
                <span className="mr-2">Level {level}:</span>
                <span className="font-medium">{getLevelDisplayText(level)}</span>
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${openLevels[level] ? 'transform rotate-180' : ''}`} />
              </button>

              {openLevels[level] && levelItems[level] && (
                <div
                  ref={el => dropdownRefs.current[level] = el}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-200 py-1 max-h-48 overflow-auto"
                >
                  <div 
                    onClick={() => handleLevelToggle(level, '')}
                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="w-4 h-4 border border-gray-300 mr-3 flex items-center justify-center rounded-full">
                      {(selectedLevelItems[level]?.length || 0) === 0 && <Check className="w-3 h-3 text-coral-600" />}
                    </div>
                    <span>All</span>
                  </div>
                  
                  <div className="h-px bg-gray-200 my-1" />
                  {levelItems[level]
                    ?.sort((a, b) => a.name.localeCompare(b.name))
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleLevelToggle(level, item.id)}
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="w-4 h-4 border border-gray-300 mr-3 flex items-center justify-center rounded-full">
                          {selectedLevelItems[level]?.includes(item.id) && <Check className="w-3 h-3 text-coral-600" />}
                        </div>
                        <span>{item.name}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => setShowSetOperations(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-coral-600 hover:bg-coral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-500"
        >
          <GitCompare className="w-4 h-4 mr-2" />
          {selectedOperation ? `${selectedOperation} active` : 'Set Operations'}
        </button>
      </div>

      <SetOperationsModal 
        isOpen={showSetOperations}
        onClose={() => setShowSetOperations(false)}
        selectedOperation={selectedOperation}
        onOperationChange={onOperationChange}
      />
    </div>
  );
}