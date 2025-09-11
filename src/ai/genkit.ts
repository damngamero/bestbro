import {genkit, Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {Plugin} from 'genkit/plugin';

const pluginMap = new Map<string, Plugin<any>>();

export async function getAi(apiKey?: string | null): Promise<Genkit> {
  const key = apiKey || process.env.GEMINI_API_KEY || '';

  if (pluginMap.has(key)) {
    return genkit({
      plugins: [pluginMap.get(key)!],
    });
  }

  const newPlugin = googleAI({apiKey: key});
  pluginMap.set(key, newPlugin);

  return genkit({
    plugins: [newPlugin],
  });
}
