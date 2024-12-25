import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Level } from '../types';

interface LevelCapsuleProps {
  level: Level;
  onEdit: (level: Level) => void;
  onDelete: (id: string) => void;
}

export function LevelCapsule({ level, onEdit, onDelete }: LevelCapsuleProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="inline-flex items-center px-3 py-1 bg-coral-100 text-coral-800 rounded-full">
        <span className="text-sm font-medium">{level.name}</span>
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onEdit(level)}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <Edit2 className="h-4 w-4 text-gray-400" />
        </button>
        <button
          onClick={() => onDelete(level.id)}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <Trash2 className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}