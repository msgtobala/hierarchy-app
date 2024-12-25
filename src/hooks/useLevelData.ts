import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Level } from '../types';

export function useLevelData(level: number) {
  const [parentLevels, setParentLevels] = useState<Level[]>([]);

  useEffect(() => {
    if (level === 1) {
      setParentLevels([]);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, `level${level - 1}`),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as Level[];
        setParentLevels(data);
      }
    );

    return () => unsubscribe();
  }, [level]);

  return { parentLevels };
}