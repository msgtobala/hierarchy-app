import React, { useState, useEffect } from 'react';
import { LevelForm } from '../components/LevelForm';
import { AddLevelButton } from '../components/AddLevelButton';
import { getMaxLevel } from '../lib/maxLevelService';

export function AddLevel() {
  const [maxLevel, setMaxLevel] = useState(3);

  const fetchMaxLevel = async () => {
    const level = await getMaxLevel();
    setMaxLevel(level);
  };

  useEffect(() => {
    fetchMaxLevel();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Add Levels</h1>
        <AddLevelButton
          currentMaxLevel={maxLevel}
          onLevelAdded={fetchMaxLevel}
        />
      </div>

      <div className="space-y-8">
        {Array.from({ length: maxLevel }, (_, i) => maxLevel - i).map((level) => (
          <section key={`level-${level}`}>
            <h2 className="text-lg font-semibold bg-coral-100 text-white px-4 py-2 rounded-t-lg">
              Add L{level} Level
            </h2>
            <div className="bg-white p-6 rounded-b-lg shadow">
              <LevelForm level={level} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}