import React from 'react';
import { Bot, Edit2, Trash2 } from 'lucide-react';
import { Level } from '../../types';

interface SwapLevelCardProps {
  level: Level & { children: Level[] };
  onEdit: () => void;
  onDelete: () => void;
  onToggleVerification: () => void;
}

export function SwapLevelCard({ level, onEdit, onDelete, onToggleVerification }: SwapLevelCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        {level.image ? (
          <img 
            src={level.image} 
            alt={level.name}
            className="w-8 h-8 object-cover rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMiAyMmM1LjUyMyAwIDEwLTQuNDc3IDEwLTEwUzE3LjUyMyAyIDEyIDIgMiA2LjQ3NyAyIDEyczQuNDc3IDEwIDEwIDEweiIvPjxwYXRoIGQ9Ik0xMiAxNmEzIDMgMCAxIDAgMC02IDMgMyAwIDAgMCAwIDZ6Ii8+PC9zdmc+';
            }}
          />
        ) : (
          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
            <Bot className="w-5 h-5 text-gray-600" />
          </div>
        )}
        <div>
          <h3 className="font-medium">{level.name}</h3>
          <p className="text-sm text-gray-500">Level {level.level}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {level.children.map((child) => (
          <div key={child.id} className="inline-flex items-center px-3 py-1 bg-[rgb(255,127,80)] text-white rounded-full">
            <span className="text-sm font-medium">{child.name}</span>
          </div>
        ))}
        {level.children.length === 0 && (
          <p className="text-sm text-gray-500">No child levels</p>
        )}
      </div>

      <div className="flex items-center justify-end mt-4 space-x-2">
        <button
          onClick={onToggleVerification}
          className={`inline-flex items-center p-1.5 hover:bg-gray-100 rounded-full transition-colors mr-2 ${
            level.isVerified ? 'text-coral-600' : 'text-gray-400'
          }`}
          title="Verify"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            {level.isVerified && <path d="m9 12 2 2 4-4"/>}
          </svg>
          <span className="ml-1 text-sm">{level.isVerified ? 'Verified' : 'Verify'}</span>
        </button>

        <button
          onClick={onEdit}
          className={`p-1.5 rounded-full transition-colors ${
            level.isVerified 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          disabled={level.isVerified}
          title={level.isVerified ? 'Cannot edit verified records' : 'Edit'}
        >
          <Edit2 className={`w-5 h-5 ${level.isVerified ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>

        <button
          onClick={onDelete}
          className={`p-1.5 rounded-full transition-colors ${
            level.isVerified 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          disabled={level.isVerified}
          title={level.isVerified ? 'Cannot delete verified records' : 'Delete'}
        >
          <Trash2 className={`w-5 h-5 ${level.isVerified ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
      </div>
    </div>
  );
}