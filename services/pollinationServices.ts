import axios from "axios";

export interface ImageOptions {
  prompt: string;
  model: string;
  seed?: number;
}

export async function generateImage(options: ImageOptions): Promise<string> {
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
    const dataUrl = `data:${contentType};base64,${base64}`;

    console.log("Image generated successfully");
    return dataUrl;

  } catch (error: any) {
    console.error("Error generating image with Pollination API:", error.message);

    if (error.response?.status === 401) {
      throw new Error("Invalid API key. Please check your POLLINATION_API_KEY.");
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error("Image generation timed out. Please try again.");
    }

    throw new Error("Failed to generate image. Please try again.");
  }
}
