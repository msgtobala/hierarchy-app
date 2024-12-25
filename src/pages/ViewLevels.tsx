import React, { useState, useEffect } from 'react';
import { HierarchyView } from '../components/HierarchyView';
import { getMaxLevel } from '../lib/maxLevelService';
import { ChevronDown } from 'lucide-react';

export function ViewLevels() {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(3);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchMaxLevel = async () => {
      const level = await getMaxLevel();
      setMaxLevel(level);
    };
    fetchMaxLevel();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">View Levels</h1>
      
      <div className="relative mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Level</label>
        <div
          className="relative"
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        >
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
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-auto">
              <div className="py-1">
                {Array.from({ length: maxLevel }, (_, i) => i + 1).map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setSelectedLevel(level);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      level === selectedLevel
                        ? 'bg-coral-50 text-coral-600'
                        : 'text-gray-700'
                    }`}
                  >
                    Level {level}
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