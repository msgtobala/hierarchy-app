import React, { useState, useEffect } from 'react';
import { HierarchyView } from '../components/HierarchyView';
import { getMaxLevel } from '../lib/maxLevelService';
import { ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

export function ViewLevels() {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(3);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const fetchMaxLevel = async () => {
      const level = await getMaxLevel();
      setMaxLevel(level);
    };
    fetchMaxLevel();
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        setDropdownPosition({
          top: rect.bottom + scrollTop,
          left: rect.left,
          width: rect.width
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">View Levels</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Level</label>
        <div ref={containerRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white px-4 py-2.5 text-left rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
          >
            <div className="flex items-center justify-between">
              <span className="block truncate text-gray-700">Level {selectedLevel}</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </div>
          </button>

          {isOpen && (
            createPortal((
              <div 
                style={{
                  position: 'absolute',
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  zIndex: 9999,
                }}
                className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-auto max-h-[300px]"
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
              </div>),
              document.body
            )
          )}
        </div>
      </div>

      <HierarchyView currentLevel={selectedLevel} />
    </div>
  );
}