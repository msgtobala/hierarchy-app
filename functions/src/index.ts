import * as functions from 'firebase-functions';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';

admin.initializeApp();

const openai = new OpenAI({
  apiKey: functions.config().openai.key
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
    console.log(functions.config().openai.key);
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: `Help me to create an high quality image for an online course thumbnail.The image should feature abstract symbols or simplified icons representing education, learning, and growth, such as stylized books, lightbulbs, graduation caps, or gears I want you create course thumbnail for subject:${prompt}, Do not include subject name  in the image.`,
      n: 4,
      size: "512x512",
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