import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';

export async function generateImages(prompt: string): Promise<string[]> {
  try {
    const generateImagesFn = httpsCallable(functions, 'generateImages');
    const result = await generateImagesFn({ prompt });
    const urls = (result.data as { urls: string[] }).urls;

    if (!urls || urls.length === 0) {
      throw new Error('No valid images were generated. Please try again.');
    }
    
    return urls;
  } catch (error: any) {
    console.error('Image generation error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate images. Please try again.');
  }
}