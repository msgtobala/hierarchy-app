import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Level } from '../types';

export async function hasParentLevelData(level: number): Promise<boolean> {
  if (level <= 1) return true;
  
  const parentCollection = collection(db, `level${level - 1}`);
  const snapshot = await getDocs(parentCollection);
  return !snapshot.empty;
}

export async function findExistingLevel(level: number, name: string): Promise<Level | null> {
  const q = query(
    collection(db, `level${level}`),
    where('name', '==', name)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Level;
}