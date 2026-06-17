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

// Selectable models, in fallback priority order. If the chosen model is
// rate-limited we transparently retry on the next one.
export const FALLBACK_ORDER = [
  'googleai/gemini-3.5-flash',
  'googleai/gemini-3.1-flash-lite',
];

function isRateLimitError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('too many requests')
  );
}

/**
 * Runs an ai.generate-style call for `model`; if it fails with a rate-limit
 * error, retries once per remaining model in FALLBACK_ORDER. `run` receives the
 * model id actually being attempted.
 */
export async function generateWithFallback<T>(
  model: string,
  run: (model: string) => Promise<T>
): Promise<T> {
  const order = [model, ...FALLBACK_ORDER.filter(m => m !== model)];
  let lastErr: unknown;
  for (const m of order) {
    try {
      return await run(m);
    } catch (err) {
      lastErr = err;
      if (!isRateLimitError(err)) throw err;
    }
  }
  throw lastErr;
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
