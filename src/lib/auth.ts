import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from './firebase';

const ADMIN_EMAIL = 'rslbalaji@gmail.com';

export const auth = getAuth(app);

export const login = async (email: string, password: string) => {
  try {
    if (email !== ADMIN_EMAIL) {
      throw new Error('Access denied. Only admin can login.');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};