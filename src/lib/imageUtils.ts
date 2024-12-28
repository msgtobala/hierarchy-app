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

  const { file, preview } = source;

  try {
    // For manually uploaded files
    if (file) {
      const uploadedUrl = await uploadImage(file, path);
      return uploadedUrl;
    }

    // For AI-generated images
    const response = await fetch(preview, {
      mode: 'cors',
      headers: {
        'Accept': 'image/*'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to load image. Please try again.');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('Invalid image format received');
    }

    const blob = await response.blob();
    
    // Create a new blob with proper content type
    const imageBlob = new Blob([blob], {
      type: contentType
    });
    
    const imageUrl = await uploadImage(imageBlob, path);
    return imageUrl;
  } catch (error) {
    console.error('Image processing error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to process image. Please try again.');
  }
}