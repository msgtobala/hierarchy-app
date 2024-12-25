import React from 'react';
import { PlusCircle } from 'lucide-react';
import { incrementMaxLevel } from '../lib/maxLevelService';
import { hasParentLevelData } from '../lib/levelUtils';

interface AddLevelButtonProps {
  currentMaxLevel: number;
  onLevelAdded: () => void;
}

export function AddLevelButton({ currentMaxLevel, onLevelAdded }: AddLevelButtonProps) {
  const handleAddLevel = async () => {
    try {
      const hasParentData = await hasParentLevelData(currentMaxLevel);
      
      if (!hasParentData) {
        alert(`Cannot add level ${currentMaxLevel + 1} because level ${currentMaxLevel} has no data yet.`);
        return;
      }

      await incrementMaxLevel();
      onLevelAdded();
    } catch (error) {
      console.error('Error adding new level:', error);
      alert('Failed to add new level. Please try again.');
    }
  };

  return (
    <button
      onClick={handleAddLevel}
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-coral-600 hover:bg-coral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-500"
    >
      <PlusCircle className="w-5 h-5 mr-2" />
      Add Level {currentMaxLevel + 1}
    </button>
  );
}