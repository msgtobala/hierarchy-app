import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

export async function generateImages(prompt: string): Promise<string[]> {
  try {
    const generateImagesFn = httpsCallable(functions, 'generateImages');
    const result = await generateImagesFn({ prompt });
    
    return (result.data as { urls: string[] }).urls;
  } catch (error: any) {
    console.error('Image generation error:', error);
    throw new Error(error.message || 'Failed to generate images');
  }
}