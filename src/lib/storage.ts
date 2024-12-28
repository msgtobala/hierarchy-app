import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase';
import { auth } from './auth';

const storage = getStorage(app);

export async function uploadImage(file: Blob | File | null, path: string): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to upload images');
  }

  if (!file) {
    throw new Error('No file provided for upload');
  }

  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Storage upload error:', error);
    throw new Error('Failed to upload image to storage. Please try again.');
  }
}