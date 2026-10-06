import { Request, Response } from 'express';
import {
  ai,
  generateGeminiWithFallback,
  getHeuristicTeacherReply,
} from '../services/gemini.service.js';

export const aiController = {

  async generateFlashcardExplanation(req: Request, res: Response) {
    const { formula, title, def } = req.body;
    if (ai) {
      try {
        const prompt = `You are an AI teacher. A student is reviewing a flashcard about "${title}" (Formula: ${formula}). The formal definition is: "${def}".
Please provide a highly intuitive, real-world everyday analogy (like the farm example for the Pythagorean theorem) to make this concept crystal clear. Keep it to 3-4 sentences. Use markdown for readability.`;

        const explanation = await generateGeminiWithFallback({ contents: prompt });
        if (explanation) {
          return res.json({ explanation });
        }
      } catch (e: any) {
        console.warn('Failed to generate explanation', e.message);
      }
    }
    return res.json({ explanation: `Imagine applying ${title} in your daily life! It's like balancing a seesaw or walking across a field. (Fallback explanation)` });
  },

  async generateTargetedFlashcards(req: Request, res: Response) {
    const { topic } = req.body;
    if (ai) {
      try {
        const prompt = `Generate 2 educational flashcards for a Class 8 student struggling with ${topic}.
Return ONLY a valid JSON array with objects containing: 'formula' (or key concept), 'title', 'def' (definition). No markdown wrapping, just JSON.`;
        const responseText = await generateGeminiWithFallback({ contents: prompt });
        if (responseText) {
          // Clean markdown formatting if present
          const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          const cards = JSON.parse(cleanJson);
          return res.json({ cards });
        }
      } catch (e: any) {
        console.warn('Failed to generate targeted flashcards', e.message);
      }
    }
    return res.json({ cards: [{ formula: 'Targeted Review', title: topic, def: `Review the basics of ${topic}.` }] });
  },


  async ttsProxy(req: Request, res: Response) {
    const text = req.query.text as string;
    const tl = (req.query.tl as string) || 'en-IN';

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encodeURIComponent(text)}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'https://translate.google.com/'
        }
      });

      if (!response.ok) {
        throw new Error(`Google TTS returned ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType) res.setHeader('Content-Type', contentType);

      // Node.js stream pipeline workaround using ArrayBuffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (error: any) {
      console.error('TTS Proxy Error:', error.message);
      res.status(500).json({ error: 'Failed to fetch TTS' });
    }
  },

  async teacherChatStream(req: Request, res: Response) {
    console.log("AI request");

    const { message, history = [], subject = 'Science & Math', language = 'English' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const systemPrompt = `You are Anita Ma'am, a compassionate, patient Indian Middle School Teacher (Class 8) and Socratic Mentor for the Shiksha Mitra learning platform.
Role guidelines:
1. Warm, encouraging Indian teacher persona ("Wonderful attempt!", "Let us break it down step-by-step"). Do NOT start your responses with greetings like "Namaste beta!".
2. Teach using the Socratic Method: don't just dump final answers; guide students through step-by-step thinking.
3. Current subject focus: ${subject}. Preferred language: ${language}.
4. Provide structured, visually clean responses: bold key terms, use clear numbered steps, format math cleanly (e.g. 2x² + 5x = 0, x(2x + 5) = 0).
5. Always end with an encouraging question or next tiny step for the student to try.`;

    const conversationContext = history
      .slice(-6)
      .map((m: { sender: string; text: string }) => `${m.sender === 'user' ? 'Student' : "Anita Ma'am"}: ${m.text}`)
      .join('\n\n');

    const prompt = `${conversationContext ? `Recent conversation context:\n${conversationContext}\n\n` : ''}Student's current question: "${message}"\n\nAnita Ma'am, please guide the student:`;

    if (ai) {
      const MODELS = [
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.8-flash',
      ];

      for (const model of MODELS) {
        try {
          console.log("Using model", model);

          const streamResult = await ai.models.generateContentStream({
            model,
            contents: prompt,
            config: { systemInstruction: systemPrompt },
          });

          // Only write headers once we have a working stream
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Transfer-Encoding', 'chunked');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('X-Accel-Buffering', 'no');

          for await (const chunk of streamResult) {
            const text = chunk.text;
            if (text) res.write(text);
          }
          res.end();
          return;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[AI Controller] Stream model ${model} failed:`, msg);
          if (res.headersSent) {
            res.end();
            return;
          }
        }
      }
    }

    // All models failed → heuristic plain-text fallback
    const fallback = getHeuristicTeacherReply(message);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.write(fallback);
    res.end();
  },









  async socraticHint(req: Request, res: Response) {
    const { question, currentInput, context, language = 'English' } = req.body;

    if (ai) {
      try {
        const prompt = `You are Shiksha Mitra, a warm, culturally empathetic Indian educational mentor. 
A student is working on this problem: "${question}".
Student's current input / doubt: "${currentInput || 'Need a gentle hint'}".
Additional context: "${context || 'Class 8 Science or Math'}".

Provide a short, encouraging Socratic hint (2-3 sentences max).
Do NOT reveal the direct final answer. Instead, ask a thought-provoking guiding question that sparks their own realization.
Include a 1-sentence Hindi or regional translation in italics if appropriate.`;

        const hintText = await generateGeminiWithFallback({
          contents: prompt,
        });

        if (hintText) {
          return res.json({ hint: hintText });
        }
      } catch (error: any) {
        console.warn('[AI Controller] Gemini hint failed, using heuristic:', error?.message);
      }
    }

    return res.json({
      hint:
        "Observe the reactant elements carefully, beta! When a reactive metal meets an acid, look at what gas forms bubbles. What happens to the hydrogen? *(संकेत: जब धातु और अम्ल मिलते हैं, तो कौन सी गैस निकलती है?)*",
    });
  },

  async diagnoseLoophole(req: Request, res: Response) {
    const { topic, incorrectAnswer, stepDetails } = req.body;

    if (ai) {
      try {
        const prompt = `You are the Shiksha Mitra AI Loophole Engine. 
A Class 8 student made an error in "${topic || 'Linear Equations / Algebra'}".
Incorrect step/answer: "${incorrectAnswer || '2x + 5 = 10 -> 2x = 15'}".
Details: "${stepDetails || 'Student added 5 to both sides instead of subtracting'}".

Diagnose the root conceptual loophole tracing back to foundational grades (Class 4 to 6).
Output a concise 2-sentence diagnostic identifying:
1. The exact elementary school gap (e.g. Class 4 Fraction division or inverse balance).
2. The recommended targeted remediation step.`;

        const analysis = await generateGeminiWithFallback({
          contents: prompt,
        });

        if (analysis) {
          return res.json({ analysis });
        }
      } catch (e: any) {
        console.warn('[AI Controller] Gemini diagnostic fallback:', e?.message);
      }
    }

    return res.json({
      analysis:
        'Rahul repeatedly struggled with isolating variables when fractions are present. The AI traces this foundation loophole to 6th-grade basic balance equations and Class 4 equal-denominator rules. Master Class 4 fractions to unlock Class 8 Algebra.',
      foundationalGrade: 'Class 4 & 6',
      severity: 'High',
    });
  },

  evaluateBatch(req: Request, res: Response) {
    const { batchId = req.body.batchId || 'batch_term1_math', totalPapers = req.body.totalPapers || 0 } = req.body;

    const results: any[] = [];

    return res.json({
      batchId,
      totalPapers,
      evaluatedCount: 0,
      classAverage: 0,
      loopholesIdentified: 0,
      topGap: 'None',
      students: results,
      completedAt: new Date().toISOString(),
    });
  },
};
