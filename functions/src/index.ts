import * as functions from 'firebase-functions';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import fetch from 'node-fetch';
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

export const proxyImage = functions.https.onRequest(async (req, res) => {
  const corsHandler = cors({ origin: true });

  corsHandler(req, res, async () => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        res.status(400).send('URL parameter is required');
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        res.status(response.status).send('Failed to fetch image');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        res.status(400).send('Invalid image format');
        return;
      }

      // Set appropriate headers
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=3600');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');

      // Stream the image data
      response.body.pipe(res);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).send('Internal server error');
    }
  });
});

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
      model: "dall-e-2",
      prompt: `Help me to create an high quality image for an online course thumbnail.The image should feature abstract symbols or simplified icons representing education, learning, and growth, such as stylized books, lightbulbs, graduation caps, or gears I want you create course thumbnail for subject:${prompt}, Do not include subject name  in the image.`,
      n: 4,
      size: "512x512"
    });

    if (!response?.data || response.data.length === 0) {
      throw new HttpsError('internal', 'No images were generated');
    }

    // Transform URLs to use our proxy
    const proxyUrls = response.data.map(image => {
      if (!image.url) return null;
      
      const project = process.env.GCLOUD_PROJECT;
      if (!project) {
        throw new Error('GCLOUD_PROJECT environment variable is not set');
      }
      
      const region = process.env.FUNCTION_REGION || 'us-central1';
      const baseUrl = `https://${region}-${project}.cloudfunctions.net`;
      return `${baseUrl}/proxyImage?url=${encodeURIComponent(image.url)}`;
    }).filter(Boolean) as string[];

    return { urls: proxyUrls, prompt };
  } catch (error: any) {
    console.error('DALL-E API Error:', error);

    // Type guard for OpenAI API errors
    if (error?.response?.status === 429) {
      throw new HttpsError(
        'resource-exhausted',
        'Rate limit exceeded. Please try again later.'
      );
    }

    if (error?.response?.status === 400) {
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