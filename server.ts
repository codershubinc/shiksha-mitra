import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Initialize Google Gemini SDK if API key is provided
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// ==========================================
// In-Memory Database & Auth Store
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'student' | 'teacher' | 'parent';
  grade?: string;
  rollNo?: string;
  streakDays: number;
  xp: number;
  avatarUrl: string;
  language: 'EN' | 'HI' | 'MR';
  createdAt: string;
}

const usersDb = new Map<string, User>();
const sessions = new Map<string, { userId: string; expiresAt: number }>();

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function createUserRecord(
  name: string,
  email: string,
  pass: string,
  role: 'student' | 'teacher' | 'parent',
  grade: string = 'Class 8',
  rollNo?: string,
  avatar?: string,
  streak: number = 7,
  xp: number = 450
): User {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(pass, salt);
  const user: User = {
    id: `usr_${crypto.randomUUID().slice(0, 8)}`,
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    salt,
    role,
    grade,
    rollNo,
    streakDays: streak,
    xp,
    avatarUrl:
      avatar ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCK0-0JwP88HWKu6oQUjNCgb05unct8XMYddUw_uJdbLA0udACQT_FFuVSr1d5XjNIOslLrb6GEB48SK31UfdAcXtHCCJs_HYunCs3RvJhaIjgvn0JafTdn1Xb2gOzOhPMu-i423Gq716dY930KOuTNgm-J15PqGdJfd3NFMlTdAi0j_IKIOAfFxd77CAJUlH2GCMydp8pHzKBCW3tXWhy5Oj6nk8XJrIwC0E2V2FyRGY0uulK_ckKD',
    language: 'EN',
    createdAt: new Date().toISOString(),
  };
  usersDb.set(user.email, user);
  return user;
}

// Seed default accounts matching the uploaded design system screens
createUserRecord(
  'Pranav Sharma',
  'pranav@shikshamitra.edu',
  'password123',
  'student',
  'Class 8',
  '07',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAac4hS2E8jjJnEOnz6z-JIJPHEVeubY-O1J--MpU7zQ9fjm7QZciJTqBTX32AtY9p93QInAdmVO80Wg_9MGiVPhw8kXGgA0i0ldnLHO0YLDK_mSGBvaUY9qTBtwIpgk5hL1r8VZQ01Jgi9SLiRZlL0jgOkr1dsaTCy8uN00mzdd5hM1Vm0QVqSQb_35XCCXwrcQpqPQGSYSqxWYud3-I0PiA9h8Oe3C52K4YUgx0bfxYIuBBkyjt5K',
  12,
  1240
);

createUserRecord(
  'Rahul Verma',
  'rahul@shikshamitra.edu',
  'password123',
  'student',
  'Class 8',
  '12',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCofhvp6W0pcY4JgW4XcGXjMh1X3s2zl2wQN0GBsPAM7-VrtJY97wm3Diz7KRv-OnKenEeh7iZAMXm2lTPNyXti5r-KZU7ASU45IDR4D6XLBMo7ZWaCujekzCSvgSAzIOJRpRHVTcu_FA8eTRem9lOf0ejN2NsVY16Kfzbkd0Dh0LqCVDTcvMfMl1DkKC8uI5n9tvSqPcq8LaqkGrX30-yLftlUlV0GEW4Is4AONzvxjQn3dAifdL0o',
  5,
  820
);

createUserRecord(
  'Anita Deshmukh',
  'anita@shikshamitra.edu',
  'password123',
  'teacher',
  'Grade 8 Math & Science',
  undefined,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuArQo7uLrplNf5RxigElyfquxORgDVwRiffuHJLlp8TO0VBqan1Pd2RJ0ZM5dhdFpN_me1a7GTtlyN_0jXgZ34yw8j8M30zHK1PlUlR2LgCG1AODsYRBaUp9E9n1aMGByMRuNPigKPjhw9T--SYAjFwKaPOkNzt6KlG7BipfkvCL4hFtcNQiIOFFOHq1frIxTXoHhyRnHxTzfnBxMBQeeT1qB-Gb9EoYA0u-301NUCrmI-bRFqS9erg',
  45,
  4800
);

createUserRecord(
  'Sunita Sharma',
  'parent@shikshamitra.edu',
  'password123',
  'parent',
  'Parent of Pranav',
  undefined,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAtHLXQYqI7hyCHVSXlNxy7sxxmE9dr4Hlf-KWrqorgj2jIc9PS0_8UKd9VCC965F3vnPA3U-zhh3bQmTn-X6LggGFNGmFJ6buDMdHoLBRw4EWAQdsZYrIBQNDsKCUyik_ryA7w4HvX_Dabv_Tckc-MRca3ZNpdLDxqP4sXA5lHMRiL04XhskEmYKpvDA2ecPQGdyKdYqUimDJhPZI9oPZd-CFs1MuAj2Y_Mf5NuY4wOs7GkjLUYvYS',
  12,
  950
);

// Helper to authenticate request
function getAuthenticatedUser(req: Request): User | null {
  const token = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  for (const user of usersDb.values()) {
    if (user.id === session.userId) {
      return user;
    }
  }
  return null;
}

function sanitizeUser(user: User) {
  const { passwordHash, salt, ...safe } = user;
  return safe;
}

// ==========================================
// Authentication Endpoints
// ==========================================

app.post('/api/auth/signup', (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'student', grade = 'Class 8' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (usersDb.has(normalizedEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const newUser = createUserRecord(name, normalizedEmail, password, role, grade);
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    sessions.set(token, { userId: newUser.id, expiresAt });

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Signup successful',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = usersDb.get(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const testHash = hashPassword(password, user.salt);
    if (testHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    sessions.set(token, { userId: user.id, expiresAt });

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Login successful',
      user: sanitizeUser(user),
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    sessions.delete(token);
  }
  res.clearCookie('session_token');
  return res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    // If not logged in, return default Pranav demo profile as fallback for immediate preview
    const defaultUser = usersDb.get('pranav@shikshamitra.edu')!;
    return res.json({ user: sanitizeUser(defaultUser), isAuthenticated: false });
  }
  return res.json({ user: sanitizeUser(user), isAuthenticated: true });
});

app.post('/api/auth/switch-demo', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = usersDb.get(email?.toLowerCase()?.trim());
  if (!user) {
    return res.status(404).json({ error: 'Demo user not found' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  sessions.set(token, { userId: user.id, expiresAt });

  res.cookie('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    message: `Switched to demo persona: ${user.name}`,
    user: sanitizeUser(user),
    token,
  });
});

// ==========================================
// Gemini AI Endpoints (Socratic & Diagnostics)
// ==========================================

async function generateGeminiWithFallback(params: {
  contents: any;
  config?: any;
}): Promise<string | null> {
  if (!ai) return null;
  // Use lite model as requested for rapid response & minimal latency under high demand
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Gemini call to ${model} encountered error, trying next fallback:`, err?.message || err);
    }
  }
  return null;
}

app.post('/api/ai/teacher-chat', async (req: Request, res: Response) => {
  const { message, history = [], subject = 'General Science & Math', language = 'English' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const systemInstruction = `You are Anita Ma'am, a warm, highly encouraging, and empathetic Indian school teacher and AI Socratic tutor for students in Classes 6 through 10. 
Your goal is to help students learn with genuine confidence and joy.
- Subject Focus: ${subject}
- Language Preference: ${language} (comfortably understand and respond in English, Hindi, or natural Hinglish).
- Teaching Style: Socratic, structured, step-by-step. Use vivid, relatable Indian examples (e.g. cricket batting averages, kitchen recipes, chai boiling, farm irrigation, cycle gears, local bazaar transactions).
- Encouragement: Praise good curiosity, acknowledge partial steps, and never make the student feel intimidated.
- Keep answers accessible, formatted with bullet points or bold keys when explaining multi-step derivations.`;

  if (ai) {
    try {
      // Build conversation contents from history
      const formattedContents = [];

      for (const item of history) {
        if (item.sender === 'user') {
          formattedContents.push({
            role: 'user',
            parts: [{ text: item.text }],
          });
        } else if (item.sender === 'teacher') {
          formattedContents.push({
            role: 'model',
            parts: [{ text: item.text }],
          });
        }
      }

      // Append current message
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const reply = await generateGeminiWithFallback({
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (reply) {
        return res.json({ reply });
      }
    } catch (error: any) {
      console.warn('Teacher Chat error, using heuristic fallback:', error?.message);
    }
  }

  // Fallback heuristic responses if API key is not configured or in offline mode
  const lower = message.toLowerCase();
  let fallbackReply = `Namaste beta! I am Anita Ma'am, your learning mentor. That is a wonderful question! Let's break it down:

1. First, identify what values are given and what the problem is asking you to solve.
2. Remember that science and math are all about patterns—like balancing ingredients in a recipe.
3. Try isolating the unknown variable or identifying the chemical reactants first.

What is the very first step you feel confident trying here?`;

  if (lower.includes('quadratic') || lower.includes('2x^2') || lower.includes('equation')) {
    fallbackReply = `Namaste beta! Let's look at quadratic equations like 2x² + 5x = 0 with ease!

💡 **Key Concept**: Factoring out common terms.
- Look at both terms: **2x²** and **5x**.
- Both have 'x' in common! 
- So we factor out 'x': **x(2x + 5) = 0**.

Now apply the zero-product rule: either **x = 0** or **2x + 5 = 0** (which means x = -5/2).
See how simple it becomes once we factor? How does that feel to you?`;
  } else if (lower.includes('zinc') || lower.includes('acid') || lower.includes('gas') || lower.includes('chemistry')) {
    fallbackReply = `Namaste! Great observation from our science lab experiment!

🔬 When solid **Zinc granules (Zn)** are dropped into dilute **Hydrochloric Acid (HCl)**:
- Chemical Reaction: **Zn + 2HCl → ZnCl₂ + H₂↑**
- The Zinc is more reactive than Hydrogen, so it displaces it!
- The gas bubbles you see collecting in the trough are pure **Hydrogen Gas (H₂)**.
- If you bring a burning splinter near it, it burns with a joyful little **'pop' sound**!

Isn't that exciting? Would you like to know how we test for other gases like Oxygen or Carbon Dioxide too?`;
  } else if (lower.includes('pythagoras') || lower.includes('triangle') || lower.includes('hypotenuse')) {
    fallbackReply = `Namaste! The Pythagorean theorem (a² + b² = c²) is one of my favorite geometry discoveries!

📐 Think of a right-angled triangle like a ladder leaning against a wall:
- Ground distance is **a**
- Wall height is **b**
- The ladder itself is the hypotenuse **c**

The square of the ladder's length is always equal to the sum of the squares of the wall and ground: **a² + b² = c²**.
For instance, if a = 3 and b = 4, then:
3² + 4² = 9 + 16 = 25, and √25 = **5**!`;
  } else if (lower.includes('division') || lower.includes('456')) {
    fallbackReply = `Namaste! Dividing 456 by 12 is like distributing 456 mangoes into boxes of 12!

Let's do it in 2 simple steps:
1. Look at the first two digits **45**:
   12 × 3 = 36. (3 times).
   45 - 36 = **9**.
2. Bring down the next digit **6** to make **96**:
   12 × 8 = 96 exactly!
   96 - 96 = **0**.

So 456 ÷ 12 = **38** with zero remainder! Did that step make sense?`;
  }

  return res.json({ reply: fallbackReply });
});

app.post('/api/ai/socratic-hint', async (req: Request, res: Response) => {
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
      console.warn('Gemini API call failed, using heuristic fallback:', error?.message);
    }
  }

  // Fallback domain-tuned response
  const fallbackHints: Record<string, string> = {
    chemistry:
      "When metals like Zinc react with an acid like dilute Hydrochloric Acid (HCl), think about what element from HCl is displaced and forms diatomic bubbles! *क्या आपको याद है कि धातु जब अम्ल से क्रिया करती है तो कौन सी ज्वलनशील गैस निकलती है?*",
    division:
      "Look closely at the standard divisor 12 and the first two digits '45'. How many full times can 12 go into 45 without exceeding it? *भाजक 12 को देखें और पहले दो अंकों '45' पर ध्यान दें।*",
    algebra:
      "Notice that both terms in 2x² + 5x = 0 share a common factor 'x'. What happens if you factor 'x' out to set each product to zero? *दोनों पदों में उभयनिष्ठ 'x' को बाहर निकालकर देखें।*",
  };

  const key = question?.toLowerCase().includes('zinc')
    ? 'chemistry'
    : question?.toLowerCase().includes('division')
    ? 'division'
    : 'algebra';

  return res.json({
    hint: fallbackHints[key] || "Take a step back and examine the given terms. Which basic rule can simplify this first step?",
  });
});

app.post('/api/ai/diagnose-loophole', async (req: Request, res: Response) => {
  const { topic, incorrectAnswer, stepDetails } = req.body;

  if (ai) {
    try {
      const prompt = `Analyze this student error in ${topic || 'Class 8 Mathematics'}.
Equation: ${incorrectAnswer || '2x^2 + 5x = 0 or factoring step error'}.
Observed mistake: ${stepDetails || 'Student failed variable isolation and fraction equivalence'}.

Format the diagnostic as:
1. Root cause concept (e.g. Class 4 Fractions or Class 6 Variable isolation).
2. Why this happened.
3. 1 Remediation step.
Keep it concise, encouraging, and under 80 words.`;

      const analysis = await generateGeminiWithFallback({
        contents: prompt,
      });

      if (analysis) {
        return res.json({ analysis });
      }
    } catch (e: any) {
      console.warn('Gemini diagnostic fallback:', e?.message);
    }
  }

  return res.json({
    analysis:
      'Rahul repeatedly struggled with isolating variables when fractions are present. The AI traces this foundation loophole to 6th-grade basic balance equations and Class 4 equal-denominator rules. Master Class 4 fractions to unlock Class 8 Algebra.',
    foundationalGrade: 'Class 4 & 6',
    severity: 'High',
  });
});

app.post('/api/ai/evaluate-batch', (req: Request, res: Response) => {
  // Simulates instant AI processing of the 14 scanned exam papers
  const { batchId = 'batch_term1_math', totalPapers = 14 } = req.body;

  const results = [
    { studentName: 'Rahul Verma', rollNo: '12', score: 68, status: 'Needs Review', loophole: 'Variable Isolation' },
    { studentName: 'Pranav Sharma', rollNo: '07', score: 82, status: 'Good Progress', loophole: 'Minor Step Check' },
    { studentName: 'Aarav Patel', rollNo: '02', score: 94, status: 'Mastered', loophole: 'None' },
    { studentName: 'Diya Kulkarni', rollNo: '19', score: 74, status: 'Steady', loophole: 'Exponent Rules' },
    { studentName: 'Sneha Jadhav', rollNo: '24', score: 58, status: 'Needs Support', loophole: 'Fraction Operations' },
  ];

  return res.json({
    batchId,
    totalPapers,
    evaluatedCount: 14,
    classAverage: 75.2,
    loopholesIdentified: 3,
    topGap: 'Fraction Operations (60% of class)',
    students: results,
    completedAt: new Date().toISOString(),
  });
});

// ==========================================
// Vite Dev Server Integration
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shiksha Mitra AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
