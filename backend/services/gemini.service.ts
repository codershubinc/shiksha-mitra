import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';
import dotenv from 'dotenv';
dotenv.config();

export const ai = config.geminiApiKey
  ? new GoogleGenAI({
    apiKey: config.geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  })
  : null;
console.log("AI is", ai, "apikey ", config.geminiApiKey);


export const FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
];

export async function generateGeminiWithFallback(params: {
  contents: string;
  systemInstruction?: string;
}): Promise<string | null> {
  if (!ai) return null;

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.systemInstruction
          ? { systemInstruction: params.systemInstruction }
          : undefined,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[Gemini Service] Model ${model} failed, trying fallback:`, err?.message);
    }
  }

  return null;
}

export function getHeuristicTeacherReply(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('quadratic') || lower.includes('2x^2') || lower.includes('equation')) {
    return `Let's look at quadratic equations like 2x² + 5x = 0 with ease!

💡 **Key Concept**: Factoring out common terms.
- Look at both terms: **2x²** and **5x**.
- Both have 'x' in common! 
- So we factor out 'x': **x(2x + 5) = 0**.

Now apply the zero-product rule: either **x = 0** or **2x + 5 = 0** (which means x = -5/2).
See how simple it becomes once we factor? How does that feel to you?`;
  }

  if (lower.includes('zinc') || lower.includes('acid') || lower.includes('gas') || lower.includes('chemistry')) {
    return `Great observation from our science lab experiment!

🔬 When solid **Zinc granules (Zn)** are dropped into dilute **Hydrochloric Acid (HCl)**:
- Chemical Reaction: **Zn + 2HCl → ZnCl₂ + H₂↑**
- The Zinc is more reactive than Hydrogen, so it displaces it!
- The gas bubbles you see collecting in the trough are pure **Hydrogen Gas (H₂)**.
- If you bring a burning splinter near it, it burns with a joyful little **'pop' sound**!

Isn't that exciting? Would you like to know how we test for other gases like Oxygen or Carbon Dioxide too?`;
  }

  if (lower.includes('pythagoras') || lower.includes('triangle') || lower.includes('hypotenuse')) {
    return `The Pythagorean theorem (a² + b² = c²) is one of my favorite geometry discoveries!

📐 Think of a right-angled triangle like a ladder leaning against a wall:
- Ground distance is **a**
- Wall height is **b**
- The ladder itself is the hypotenuse **c**

The square of the ladder's length is always equal to the sum of the squares of the wall and ground: **a² + b² = c²**.
For instance, if a = 3 and b = 4, then:
3² + 4² = 9 + 16 = 25, and √25 = **5**!`;
  }

  if (lower.includes('division') || lower.includes('456')) {
    return `Dividing 456 by 12 is like distributing 456 mangoes into boxes of 12!

Let's do it in 2 simple steps:
1. Look at the first two digits **45**:
   12 × 3 = 36. (3 times).
   45 - 36 = **9**.
2. Bring down the next digit **6** to make **96**:
   12 × 8 = 96 exactly!
   96 - 96 = **0**.

So 456 ÷ 12 = **38** with zero remainder! Did that step make sense?`;
  }

  return `I am Anita Ma'am, your learning mentor. That is a wonderful question! Let's break it down:

1. First, identify what values are given and what the problem is asking you to solve.
2. Remember that science and math are all about patterns—like balancing ingredients in a recipe.
3. Try isolating the unknown variable or identifying the chemical reactants first.

What is the very first step you feel confident trying here?`;
}
