import axios from "axios";

export interface ImageOptions {
  prompt: string;
  model: string;
  seed?: number;
}

export interface RemixImageOptions {
  prompt: string;
  originalImageUrl: string;
  seed: number;
}

export interface GeneratedImageResult {
  base64DataUrl: string;
  pollinationUrl: string;
}

export async function generateImage(options: ImageOptions): Promise<GeneratedImageResult> {
  const { prompt, model, seed } = options;

  const encodedPrompt = encodeURIComponent(prompt);

  let url = `https://gen.pollinations.ai/image/${encodedPrompt}`;

  const params = new URLSearchParams({
    model,
    width: "1024",
    height: "1024",
    nologo: "true",
  });

  if (seed) {
    params.append("seed", seed.toString());
  }

  url += `?${params.toString()}`;

  const apiKey = process.env.POLLINATION_API_KEY;

  if (!apiKey) {
    throw new Error("POLLINATION_API_KEY is not set. Please add it to your .env file.");
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      responseType: 'arraybuffer',
      timeout: 120000,
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const contentType = response.headers['content-type'] || 'image/png';
    const base64DataUrl = `data:${contentType};base64,${base64}`;

    console.log("Image generated successfully");
    return {
      base64DataUrl,
      pollinationUrl: url,
    };

  } catch (error: any) {
    console.error("Error generating image with Pollination API:", error.message);

    // Log detailed error information for debugging
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      console.error("Request URL:", url);
    }

    if (error.response?.status === 400) {
      throw new Error("Bad request to Pollinations API. Check your prompt or parameters.");
    }

    if (error.response?.status === 401) {
      throw new Error("Invalid API key. Please check your POLLINATION_API_KEY.");
    }

    if (error.response?.status === 402) {
      throw new Error("Insufficient pollen balance. Please check your account at enter.pollinations.ai");
    }

    if (error.response?.status === 403) {
      throw new Error("Access denied. You don't have permission to use this model.");
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error("Image generation timed out. Please try again.");
    }

    throw new Error(`Failed to generate image: ${error.message}`);
  }
}

export async function generateRemixImage(options: RemixImageOptions): Promise<GeneratedImageResult> {
  const { prompt, originalImageUrl, seed } = options;

  const encodedPrompt = encodeURIComponent(prompt);
  const encodedImageUrl = encodeURIComponent(originalImageUrl);

  // Build the remix URL with nanobanana model
  let url = `https://gen.pollinations.ai/image/${encodedPrompt}`;

  const params = new URLSearchParams({
    model: "nanobanana",
    seed: seed.toString(),
    image: originalImageUrl,
    nologo: "true",
  });

  url += `?${params.toString()}`;

  const apiKey = process.env.POLLINATION_API_KEY;

  if (!apiKey) {
    throw new Error("POLLINATION_API_KEY is not set. Please add it to your .env file.");
  }

  try {
    console.log("Generating remix with URL:", url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      responseType: 'arraybuffer',
      timeout: 180000, // 3 minutes for remix as it may take longer
    });

    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const contentType = response.headers['content-type'] || 'image/png';
    const base64DataUrl = `data:${contentType};base64,${base64}`;

    console.log("Remix image generated successfully");
    return {
      base64DataUrl,
      pollinationUrl: url,
    };

  } catch (error: any) {
    console.error("Error generating remix image with Pollination API:", error.message);

    // Log detailed error information for debugging
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      console.error("Request URL:", url);
    }

    if (error.response?.status === 400) {
      throw new Error("Bad request to Pollinations API. Check your prompt or parameters.");
    }

    if (error.response?.status === 401) {
      throw new Error("Invalid API key. Please check your POLLINATION_API_KEY.");
    }

    if (error.response?.status === 402) {
      throw new Error("Insufficient pollen balance. Please check your account at enter.pollinations.ai");
    }

    if (error.response?.status === 403) {
      throw new Error("Access denied. You don't have permission to use this model.");
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error("Remix generation timed out. Please try again.");
    }

    throw new Error(`Failed to generate remix: ${error.message}`);
  }
}
