import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
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
      const batch = writeBatch(db);

      // Update the current level's name
      const parentRef = doc(db, `level${currentLevel}`, levelId);
      batch.update(parentRef, { name: newName });

      // Get all current children for this level
      const currentChildren = availableChildren.filter(child => 
        child.parentIds?.includes(levelId)
      );

      // Update child levels
      const nextLevelRef = collection(db, `level${currentLevel + 1}`);

      // Remove this parent from children that are no longer selected
      for (const child of currentChildren) {
        if (!childIds.includes(child.id)) {
          const childRef = doc(nextLevelRef, child.id);
          const newParentIds = (child.parentIds || []).filter(id => id !== levelId);
          batch.update(childRef, { parentIds: newParentIds });
        }
      }

      // Add this parent to newly selected children
      for (const childId of childIds) {
        const child = availableChildren.find(c => c.id === childId);
        if (child) {
          const childRef = doc(nextLevelRef, childId);
          const newParentIds = Array.from(new Set([...(child.parentIds || []), levelId]));
          batch.update(childRef, { parentIds: newParentIds });
        }
      }

      // Commit all changes
      await batch.commit();

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