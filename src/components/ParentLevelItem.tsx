import React from 'react';
import { Bot } from 'lucide-react';
import { Level } from '../types';

interface ParentLevelItemProps {
  level: Level;
  isSelected: boolean;
  onClick: () => void;
  levelNumber: number;
}

export function ParentLevelItem({ level, isSelected, onClick, levelNumber }: ParentLevelItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 cursor-pointer ${
        isSelected
          ? 'bg-gray-100'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
          <Bot className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{level.name}</span>
          <span className="text-xs text-gray-500">Level {levelNumber}</span>
        </div>
      </div>
    </div>
  );
}