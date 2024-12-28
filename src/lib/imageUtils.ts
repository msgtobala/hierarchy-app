import { uploadImage } from './storage';

interface ImageSource {
  file: File | null;
  preview: string;
}

export async function processAndUploadImage(
  source: ImageSource | null,
  path: string
): Promise<string> {
  if (!source) {
    throw new Error('No image source provided');
  }

  try {
    const { file, preview } = source;

    // For manually uploaded files
    if (file) {
      return await uploadImage(file, path);
    }

    // For AI-generated images, fetch through our proxy
    const response = await fetch(preview);
    if (!response.ok) {
      throw new Error('Failed to load image');
    }

    const blob = await response.blob();
    return await uploadImage(blob, path);
  } catch (error) {
    console.error('Image processing error:', error);
    throw error instanceof Error ? error : new Error('Failed to process image');
  }
}