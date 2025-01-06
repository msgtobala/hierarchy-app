import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Level } from '../types';

export function useSwapLevelData(currentLevel: number) {
  const [groupedLevels, setGroupedLevels] = useState<(Level & { children: Level[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableChildren, setAvailableChildren] = useState<Level[]>([]);
  const [levelItems, setLevelItems] = useState<Record<number, Level[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all levels up to current level + 1
        const levelData: Record<number, Level[]> = {};
        
        // Create array of levels to fetch: [1, 2, ..., currentLevel, currentLevel + 1]
        const levelsToFetch = Array.from(
          { length: currentLevel + 1 }, 
          (_, i) => i + 1
        );

        // Fetch all levels in parallel
        const levelSnapshots = await Promise.all(
          levelsToFetch.map(level => 
            getDocs(collection(db, `level${level}`))
          )
        );

        // Process snapshots
        levelSnapshots.forEach((snapshot, index) => {
          const level = levelsToFetch[index];
          levelData[level] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            level
          })) as Level[];
        });

        setLevelItems(levelData);
        setAvailableChildren(levelData[currentLevel + 1] || []);

        // Group items by parent
        const groupedItems = levelData[currentLevel]?.map(parent => {
          const children = levelData[currentLevel + 1]?.filter(child => 
            child.parentIds?.includes(parent.id)
          ) || [];

          return {
            ...parent,
            children
          };
        }) || [];

        setGroupedLevels(groupedItems);
      } catch (error) {
        console.error('Error fetching swap level data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLevel]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, `level${currentLevel}`, id));
      setGroupedLevels(prev => prev.filter(level => level.id !== id));
    } catch (error) {
      console.error('Error deleting level:', error);
      throw new Error('Failed to delete level');
    }
  };

  const handleSaveEdit = async (levelId: string, newName: string, childIds: string[]) => {
    try {
      // Update the current level's name
      const docRef = doc(db, `level${currentLevel}`, levelId);
      await updateDoc(docRef, { 
        name: newName
      });

      // Update child levels to point to this parent
      const childUpdates = childIds.map(childId => {
        const childRef = doc(db, `level${currentLevel + 1}`, childId);
        return updateDoc(childRef, {
          parentIds: [levelId] // Set this as the only parent
        });
      });

      await Promise.all(childUpdates);

      // Update local state
      setGroupedLevels(prev =>
        prev.map(level =>
          level.id === levelId ? { 
            ...level, 
            name: newName,
            children: availableChildren.filter(c => childIds.includes(c.id))
          } : level
        )
      );
    } catch (error) {
      console.error('Error updating level:', error);
      throw error;
    }
  };

  const handleToggleVerification = async (level: Level) => {
    try {
      const docRef = doc(db, `level${currentLevel}`, level.id);
      await updateDoc(docRef, {
        isVerified: !level.isVerified
      });
      
      setGroupedLevels(prev => 
        prev.map(l => 
          l.id === level.id ? { ...l, isVerified: !l.isVerified } : l
        )
      );
    } catch (error) {
      console.error('Error toggling verification:', error);
      throw new Error('Failed to update verification status');
    }
  };

  return {
    groupedLevels,
    loading,
    availableChildren,
    levelItems,
    handleDelete,
    handleSaveEdit,
    handleToggleVerification
  };
}