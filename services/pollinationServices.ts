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
    console.warn("POLLINATION_API_KEY not set - using public API");
    return url;
  }

  try {
    const response = await axios.request({
      method: "GET",
      url,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 400,
      timeout: 30000,
    });

    return url;
  } catch (error) {
    console.error("Error with authenticated Pollination API:", error);
    console.log("Falling back to public URL");
    return url;
  }
}
