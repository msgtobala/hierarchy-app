import React from 'react';
import { Bot, Edit2, Trash2, ToggleLeft } from 'lucide-react';
import { Level } from '../types';

interface LevelCardProps {
  level: Level;
  onEdit: (level: Level) => void;
  onDelete: (id: string) => void;
  onToggleVerification: (level: Level) => void;
}

export function LevelCard({ level, onEdit, onDelete, onToggleVerification }: LevelCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 flex items-center justify-center bg-coral-100 rounded-full">
          <Bot className="w-5 h-5 text-coral-600" />
        </div>
        <span className="font-medium">{level.name}</span>
        {level.isVerified && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-coral-100 text-coral-800">
            Verified
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onToggleVerification(level)}
          className="p-1.5 hover:bg-gray-100 rounded-full"
          title={level.isVerified ? "Unverify" : "Verify"}
        >
          <ToggleLeft className={`w-5 h-5 ${level.isVerified ? 'text-coral-600' : 'text-gray-400'}`} />
        </button>
        <button
          onClick={() => onEdit(level)}
          className="p-1.5 hover:bg-gray-100 rounded-full"
          title="Edit"
        >
          <Edit2 className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={() => onDelete(level.id)}
          className="p-1.5 hover:bg-gray-100 rounded-full"
          title="Delete"
        >
          <Trash2 className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}