import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

const MAX_LEVEL_DOC = 'maxLevel';
const SETTINGS_COLLECTION = 'settings';

export async function getMaxLevel(): Promise<number> {
  const docRef = doc(db, SETTINGS_COLLECTION, MAX_LEVEL_DOC);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    // Initialize with 3 levels if not exists
    await setDoc(docRef, { value: 3 });
    return 3;
  }
  
  return docSnap.data().value;
}

export async function incrementMaxLevel(): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, MAX_LEVEL_DOC);
  await setDoc(docRef, { value: increment(1) }, { merge: true });
}