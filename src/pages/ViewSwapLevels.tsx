import React, { useState, useEffect } from 'react';
import { SwapHierarchyView } from '../components/swap/SwapHierarchyView';
import { getMaxLevel } from '../lib/maxLevelService';
import { ChevronDown, Check, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLevel } from '../contexts/LevelContext';

export function ViewSwapLevels() {
  const [maxLevel, setMaxLevel] = useState(3);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { selectedLevel, setSelectedLevel } = useLevel();
  const [dropdownStyle, setDropdownStyle] = useState({
    top: 0,
    left: 0,
    width: 'auto',
  });

  useEffect(() => {
    const fetchMaxLevel = async () => {
      const level = await getMaxLevel();
      setMaxLevel(level);
    };
    fetchMaxLevel();
  }, []);

  const handleNavigateToView = () => {
    navigate('/view');
  };

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


  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">View Swap Levels</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Level
        </label>
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white px-4 py-2.5 text-left rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
          >
            <div className="flex items-center justify-between">
              <span className="block truncate text-gray-700">
                Level {selectedLevel}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute z-[100] mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1"
            >
              {Array.from({ length: maxLevel - 1 }, (_, i) => i + 1).map(
                (level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setSelectedLevel(level);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0 w-4 h-4 mr-3">
                      {level === selectedLevel && (
                        <Check className="w-4 h-4 text-coral-600" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        level === selectedLevel
                          ? 'text-coral-600 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      Level {level}
                    </span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end mt-2">
          <button
            onClick={handleNavigateToView}
            className="text-sm text-coral-600 hover:text-coral-700 font-medium"
          >
            View level
          </button>
        </div>
      </div>

      <div className="text-lg font-semibold text-gray-500 mb-4">
        Showing L{selectedLevel} to L{selectedLevel + 1} relationships
      </div>

      <SwapHierarchyView currentLevel={selectedLevel} />
    </div>
  );
}
