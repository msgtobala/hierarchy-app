import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Level } from '../types';

interface MultiSelectProps {
  options: Level[];
  value: string[];
  onChange: (selected: string[]) => void;
  label: string;
  required?: boolean;
}

export function MultiSelect({ options, value, onChange, label, required }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({
    top: 0,
    left: 0,
    width: 'auto'
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      setDropdownStyle({
        top: rect.bottom + scrollTop,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  const handleToggleOption = (optionId: string) => {
    const newValue = value.includes(optionId)
      ? value.filter(id => id !== optionId)
      : [...value, optionId];
    onChange(newValue);
  };

  const getDisplayText = () => {
    if (value.length === 0) return 'Select options...';
    if (value.length === 1) {
      return options.find(opt => opt.id === value[0])?.name || 'Select options...';
    }
    return `${value.length} items selected`;
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-coral-500">(required)</span>}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white relative flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-left shadow-sm focus:border-coral-500 focus:outline-none focus:ring-1 focus:ring-coral-500"
      >
        <span className="block truncate text-gray-700">{getDisplayText()}</span>
        <ChevronDown 
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div 
          className="fixed z-[100] rounded-md bg-white shadow-lg border border-gray-200"
          style={{
          maxHeight: '300px', 
          overflowY: 'auto',
          ...dropdownStyle,
          marginTop: '4px'
        }}
        >
          <div className="py-1">
            {options.map((option) => (
              <div
                key={option.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleOption(option.id);
                }}
                className="flex items-center px-3 py-2.5 cursor-pointer hover:bg-gray-50 select-none relative"
              >
                <div className="flex-shrink-0 w-4 h-4 border rounded mr-3 flex items-center justify-center border-gray-300">
                  {value.includes(option.id) && (
                    <Check className="w-3 h-3 text-coral-600" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{option.name}</span>
              </div>
            ))}
            
            {options.length === 0 && (
              <div className="px-3 py-2.5 text-sm text-gray-500">
                No options available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}