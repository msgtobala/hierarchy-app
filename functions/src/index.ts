import * as functions from 'firebase-functions';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';

admin.initializeApp();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateImages = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { prompt } = data;
  if (!prompt) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with a prompt.'
    );
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a professional, modern icon for ${prompt}. The icon should be simple, memorable, and suitable for a user interface. Use a clean, minimalist style with a single primary color.`,
      n: 4,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    return { 
      urls: response.data.map(image => image.url),
      prompt: prompt 
    };
  } catch (error: any) {
    console.error('DALL-E API Error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate images. Please try again later.'
    );
  }
});