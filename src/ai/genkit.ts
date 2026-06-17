import {genkit, Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {Plugin} from 'genkit/plugin';

const pluginMap = new Map<string, Plugin<any>>();

// The Gemma model has no reliable built-in knowledge freshness, so we ground
// its responses with Google Search. Gemini 3-era models allow combining
// grounding with structured (JSON schema) output.
export const GEMMA_MODEL = 'googleai/gemma-4-31b-it';

/**
 * Returns generate `config` with Google Search grounding enabled when the
 * Gemma model is selected, merged on top of any existing config. For every
 * other model it returns the config untouched.
 */
export function withGrounding(
  model: string,
  config: Record<string, any> = {}
): Record<string, any> {
  if (model === GEMMA_MODEL) {
    return {
      ...config,
      tools: [...(config.tools ?? []), {googleSearch: {}}],
    };
  }
  return config;
}

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
