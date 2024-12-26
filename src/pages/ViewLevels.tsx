import React, { useState, useEffect } from 'react';
import { HierarchyView } from '../components/HierarchyView';
import { getMaxLevel } from '../lib/maxLevelService';
import { ChevronDown, Check } from 'lucide-react';

export function ViewLevels() {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(3);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState({
    top: 0,
    left: 0,
    width: 'auto'
  });

  useEffect(() => {
    const fetchMaxLevel = async () => {
      const level = await getMaxLevel();
      setMaxLevel(level);
    };
    fetchMaxLevel();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      setDropdownStyle({
        top: rect.bottom + scrollTop,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">View Levels</h1>
      
      <div className="relative mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Level</label>
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white px-4 py-2.5 text-left rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
          >
            <div className="flex items-center justify-between">
              <span className="block truncate text-gray-700">Level {selectedLevel}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </div>
          </button>

          {isOpen && (
            <div
              ref={dropdownRef}
              className="fixed z-[100] bg-white rounded-lg border border-gray-200 shadow-lg overflow-auto"
              style={{
                maxHeight: '300px',
                ...dropdownStyle,
                marginTop: '4px'
              }}
            >
              <div className="py-1">
                {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setSelectedLevel(level);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2.5 hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0 w-4 h-4 mr-3 flex items-center justify-center">
                      {level === selectedLevel && (
                        <Check className="w-4 h-4 text-coral-600" />
                      )}
                    </div>
                    <span className={`text-sm ${level === selectedLevel ? 'text-coral-600 font-medium' : 'text-gray-700'}`}>
                      Level {level}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <HierarchyView currentLevel={selectedLevel} />
    </div>
  );
}