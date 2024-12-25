import React, { useState, useEffect } from 'react';
import { addDoc, collection, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileInput } from './FileInput';
import { Level } from '../types';
import { useLevelData } from '../hooks/useLevelData';
import { findExistingLevel } from '../lib/levelUtils';

interface LevelFormProps {
  level: number;
}

export function LevelForm({ level }: LevelFormProps) {
  const [name, setName] = useState('');
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const { parentLevels } = useLevelData(level);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if an item with this name already exists
      const existingLevel = await findExistingLevel(level, name);

      if (existingLevel) {
        // Update existing level with additional parentIds
        const updatedParentIds = [...new Set([...existingLevel.parentIds, ...selectedParents])];
        await updateDoc(doc(db, `level${level}`, existingLevel.id), {
          parentIds: updatedParentIds
        });
      } else {
        // Create new level
        const levelData = {
          name,
          parentIds: selectedParents,
          isVerified: false, // Set initial verification status to false
          image: '',
          level,
        };

        const docRef = await addDoc(collection(db, `level${level}`), levelData);
        await updateDoc(docRef, {
          id: docRef.id
        });
      }
      
      setName('');
      setSelectedParents([]);
    } catch (error) {
      console.error(`Error adding L${level}:`, error);
      alert('Error adding level. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name <span className="text-coral-500">(required)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-coral-300 shadow-sm focus:border-coral-500 focus:ring-coral-500"
          required
        />
      </div>

      <FileInput label="Upload Icon" required />

      {level > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            L{level - 1} Levels
          </label>
          <select
            multiple
            value={selectedParents}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedParents(selected);
            }}
            className="mt-1 block w-full rounded-md border-coral-300 shadow-sm focus:border-coral-500 focus:ring-coral-500"
          >
            {parentLevels.map((parent) => (
              <option key={`parent-${parent.id}`} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-coral-600 hover:bg-coral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-500"
      >
        Add L{level}
      </button>
    </form>
  );
}