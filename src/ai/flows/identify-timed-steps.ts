'use server';

/**
 * @fileOverview Identifies which cooking steps have a time component.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'zod';
import {ModelId} from '@genkit-ai/googleai';

const IdentifyTimedStepsInputSchema = z.object({
  instructions: z.array(z.string()).describe('A list of cooking instructions.'),
  apiKey: z.string().optional().describe('Google AI API key.'),
  model: z.string().describe('The model to use for generation.'),
});

export type IdentifyTimedStepsInput = z.infer<typeof IdentifyTimedStepsInputSchema>;

const TimedStepSchema = z.object({
    step: z.number().describe('The 1-based index of the instruction step.'),
    durationInMinutes: z.number().describe('The duration in minutes mentioned in the step.'),
});

const IdentifyTimedStepsOutputSchema = z.object({
  timedSteps: z.array(TimedStepSchema).describe('A list of steps that have a time component.'),
});

export type IdentifyTimedStepsOutput = z.infer<typeof IdentifyTimedStepsOutputSchema>;

export async function identifyTimedSteps(
  input: IdentifyTimedStepsInput
): Promise<IdentifyTimedStepsOutput> {
  const { instructions, apiKey, model } = input;
  const ai = await getAi(apiKey);

  const prompt = `You are a recipe analysis expert. Review the following cooking instructions and identify any steps that have a specific time duration mentioned (e.g., "for 5 minutes", "about 1-2 hours"). For each timed step you find, provide its step number (1-based index) and the total duration in minutes.

Instructions:
${instructions.map((inst, index) => `${index + 1}. ${inst}`).join('\n')}

If a step has a range (e.g., 10-15 minutes), use the average. If a step mentions hours, convert it to minutes. Only include steps that have a clear, numeric time duration for a cooking or preparation action.`;

  const { output } = await ai.generate({
    prompt,
    model: model as ModelId,
    output: { schema: IdentifyTimedStepsOutputSchema },
  });

  return output!;
}
