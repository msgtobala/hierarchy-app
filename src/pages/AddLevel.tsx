import React, { useState, useEffect } from 'react';
import { LevelForm } from '../components/LevelForm';
import { AddLevelButton } from '../components/AddLevelButton';
import { getMaxLevel } from '../lib/maxLevelService';
import { ChevronDown } from 'lucide-react';

export function AddLevel() {
  const [maxLevel, setMaxLevel] = useState(3);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

  const fetchMaxLevel = async () => {
    const level = await getMaxLevel();
    setMaxLevel(level);
  };

  useEffect(() => {
    fetchMaxLevel();
  }, []);

  const handleLevelClick = (level: number) => {
    setExpandedLevel(expandedLevel === level ? null : level);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Add Levels</h1>
        <AddLevelButton
          currentMaxLevel={maxLevel}
          onLevelAdded={fetchMaxLevel}
        />
      </div>

      <div className="space-y-4">
        {Array.from({ length: maxLevel }, (_, i) => maxLevel - i).map((level) => (
          <section 
            key={`level-${level}`} 
            className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
          >
            <button
              onClick={() => handleLevelClick(level)}
              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium text-gray-900">L{level} Level</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(255,127,80)] text-white">
                  Level {level}
                </span>
              </div>
              <ChevronDown 
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  expandedLevel === level ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            
            <div 
              className={`transition-all duration-200 ease-in-out ${
                expandedLevel === level 
                  ? 'max-h-[1000px] opacity-100' 
                  : 'max-h-0 opacity-0 overflow-hidden'
              }`}
            >
              <div className="px-6 py-4 border-t border-gray-100">
                <LevelForm level={level} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}