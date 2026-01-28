import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

export async function generateImage(prompt: string): Promise<string> {
    try {
        const image = await client.textToImage({
            provider: 'nscale',
            model: 'black-forest-labs/FLUX.1-schnell',
            inputs: prompt,
            parameters: { num_inference_steps: 5 },
        })

        return image;

    } catch (error) {
        console.log('Error generating Image: ', error);
        throw new Error('Failed to generate image');
    }
}