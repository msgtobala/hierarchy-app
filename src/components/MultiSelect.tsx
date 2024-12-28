import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Level } from '../types';
import { createPortal } from 'react-dom';

const DROPDOWN_Z_INDEX = 9999;

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 300
  });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Determine if dropdown should appear above or below
      const showAbove = spaceBelow < 300 && spaceAbove > spaceBelow;
      const maxHeight = Math.min(300, showAbove ? spaceAbove - 10 : spaceBelow - 10);

      setDropdownStyle({
        top: showAbove ? rect.top - maxHeight - 5 : rect.bottom + 5,
        left: rect.left,
        width: rect.width,
        maxHeight
      });
    }
  }, [isOpen, options.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node) &&
        containerRef.current && 
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsOpen(false);
    const handleResize = () => setIsOpen(false);

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  const renderDropdown = () => {
    if (!isOpen) return null;

    return createPortal(
      <div
        className={`fixed bg-white rounded-lg shadow-lg border border-gray-200 transition-opacity duration-150 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{
          top: `${dropdownStyle.top}px`,
          left: `${dropdownStyle.left}px`,
          width: `${dropdownStyle.width}px`,
          maxHeight: `${dropdownStyle.maxHeight}px`,
          overflow: 'auto',
          zIndex: DROPDOWN_Z_INDEX
        }}
        ref={containerRef}
      >
        <div className="py-1">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleOption(option.id);
              }}
              className="flex items-center px-3 py-2.5 cursor-pointer hover:bg-gray-50 select-none"
            >
              <div className="flex-shrink-0 w-4 h-4 border rounded mr-3 flex items-center justify-center border-gray-300">
                {value.includes(option.id) && <Check className="w-3 h-3 text-coral-600" />}
              </div>
              <span className="text-sm text-gray-700">{option.name}</span>
            </div>
          ))}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-coral-500">(required)</span>}
      </label>
      
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white flex items-center justify-between rounded-lg border border-gray-300 px-4 py-2.5 text-left shadow-sm focus:border-coral-500 focus:outline-none focus:ring-1 focus:ring-coral-500 ${isOpen ? 'z-[10000]' : ''}`}
      >
        <span className="block truncate text-gray-700">{getDisplayText()}</span>
        <ChevronDown 
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {renderDropdown()}
    </div>
  );
}