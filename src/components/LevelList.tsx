import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Edit2, Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { Level } from '../types';

interface LevelListProps {
  level: number;
  parentLevels: Level[];
}

export function LevelList({ level, parentLevels }: LevelListProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, `level${level}`), (snapshot) => {
      const levelsData = snapshot.docs.map((doc) => ({
        ...doc.data(),
      })) as Level[];
      setLevels(levelsData);
    });

    return () => unsubscribe();
  }, [level]);

  const handleEdit = async (level: Level) => {
    if (!editingLevel) {
      setEditingLevel(level);
    } else {
      try {
        await updateDoc(doc(db, `level${level.level}`, level.id), {
          name: editingLevel.name,
          parentIds: editingLevel.parentIds,
        });
        setEditingLevel(null);
      } catch (error) {
        console.error('Error updating level:', error);
      }
    }
  };

  const handleDelete = async (levelId: string) => {
    try {
      await deleteDoc(doc(db, `level${level}`, levelId));
    } catch (error) {
      console.error('Error deleting level:', error);
    }
  };

  return (
    <div className="space-y-4">
      {levels.map((level) => (
        <div 
          key={`level-${level.id}`}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          {editingLevel?.id === level.id ? (
            <input
              type="text"
              value={editingLevel.name}
              onChange={(e) =>
                setEditingLevel({ ...editingLevel, name: e.target.value })
              }
              className="border rounded px-2 py-1"
            />
          ) : (
            <span>{level.name}</span>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(level)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(level.id)}
              className="p-1 hover:bg-gray-100 rounded text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}