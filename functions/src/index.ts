import * as functions from 'firebase-functions';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';
import { type ClientOptions } from 'openai';

admin.initializeApp();

const getOpenAIConfig = (): ClientOptions => {
  const key = functions.config().openai?.key;
  if (!key) {
    throw new HttpsError(
      'failed-precondition',
      'OpenAI API key is not configured. Please set up the API key in Firebase Functions config.'
    );
  }
  return { apiKey: key };
};

// Initialize OpenAI with validated config
let openaiClient: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (!openaiClient) {
    const config = getOpenAIConfig();
    openaiClient = new OpenAI(config);
  }
  return openaiClient;
};

export const generateImages = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { prompt } = data;
  if (!prompt) {
    throw new HttpsError(
      'invalid-argument',
      'The function must be called with a prompt.'
    );
  }

  try {
    const openai = getOpenAIClient();
    const response = await openai.images.generate({
      prompt: `Help me to create an high quality image for an online course thumbnail. The image should feature abstract symbols or simplified icons representing education, learning, and growth, such as stylized books, lightbulbs, graduation caps, or gears I want you create course thumbnail for subject:${prompt}, Do not include subject name in the image.`,
      model: "dall-e-2",
      n: 4,
      size: "512x512",
      response_format: "b64_json"
    });

    const urls = response.data.map(
      (imageData) => `data:image/png;base64,${imageData.b64_json}`
    );

    return { urls, prompt };
  } catch (error: any) {
    console.error('DALL-E API Error:', error);

    if (error instanceof Error && error.message.includes('429')) {
      throw new HttpsError(
        'resource-exhausted',
        'Rate limit exceeded. Please try again later.'
      );
    }

    if (error instanceof Error && error.message.includes('400')) {
      throw new HttpsError(
        'invalid-argument',
        'Invalid prompt or request. Please try with a different prompt.'
      );
    }

    throw new HttpsError(
      'internal',
      'Failed to generate images. Please try again later.'
    );
  }
});