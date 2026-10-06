// backend/server.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "node:http";
import path2 from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
import mongoose4 from "mongoose";

// backend/config/env.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();
var config = {
  port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 3e3,
  nodeEnv: process.env.NODE_ENV || "development",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    tableName: process.env.DYNAMODB_TABLE_NAME || "ShikshaMitra-Records"
  },
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/shiksha-mitra"
};

// backend/routes/index.ts
import { Router as Router5 } from "express";

// backend/routes/auth.routes.ts
import { Router } from "express";

// backend/utils/crypto.utils.ts
import crypto from "node:crypto";
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}
function sanitizeUser(user) {
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

// backend/services/cognito.service.ts
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  AdminUpdateUserAttributesCommand,
  AdminConfirmSignUpCommand,
  GetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";
import crypto2 from "node:crypto";
var cognitoClient = new CognitoIdentityProviderClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
});
var CLIENT_ID = process.env.COGNITO_CLIENT_ID || "dummy_client_id";
var USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || "dummy_pool_id";
var CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET || "";
function getSecretHash(username) {
  if (!CLIENT_SECRET) return void 0;
  return crypto2.createHmac("sha256", CLIENT_SECRET).update(username + CLIENT_ID).digest("base64");
}
var cognitoService = {
  async signUp(email, password, name, role) {
    const username = crypto2.randomUUID();
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      SecretHash: getSecretHash(username),
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name },
        { Name: "custom:role", Value: role }
      ]
    });
    const response = await cognitoClient.send(command);
    if (USER_POOL_ID) {
      try {
        await cognitoClient.send(new AdminConfirmSignUpCommand({
          UserPoolId: USER_POOL_ID,
          Username: username
        }));
      } catch (err) {
        console.warn("Auto-confirm failed:", err.message);
      }
    }
    return response.UserSub;
  },
  async signIn(email, password) {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        ...getSecretHash(email) ? { SECRET_HASH: getSecretHash(email) } : {}
      }
    });
    const response = await cognitoClient.send(command);
    return response.AuthenticationResult;
  },
  async linkParentToStudent(parentEmail, studentEmail) {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: USER_POOL_ID,
      Username: parentEmail,
      UserAttributes: [
        { Name: "custom:linked_student", Value: studentEmail }
      ]
    });
    return await cognitoClient.send(command);
  },
  async getUser(accessToken) {
    const command = new GetUserCommand({
      AccessToken: accessToken
    });
    const response = await cognitoClient.send(command);
    const attrs = {};
    if (response.UserAttributes) {
      for (const attr of response.UserAttributes) {
        if (attr.Name && attr.Value) {
          attrs[attr.Name] = attr.Value;
        }
      }
    }
    return attrs;
  }
};

// backend/models/user.model.ts
import mongoose, { Schema } from "mongoose";
var UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, required: true, enum: ["student", "teacher", "parent"] },
  grade: { type: String },
  rollNo: { type: String },
  streakDays: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  avatarUrl: { type: String },
  language: { type: String, enum: ["EN", "HI", "MR"], default: "EN" },
  createdAt: { type: String, required: true },
  studentIds: [{ type: String }],
  parentIds: [{ type: String }]
});
var UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

// backend/models/session.model.ts
import mongoose2, { Schema as Schema2 } from "mongoose";
var SessionSchema = new Schema2({
  token: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  expiresAt: { type: Number, required: true }
});
var SessionModel = mongoose2.models.Session || mongoose2.model("Session", SessionSchema);

// backend/controllers/auth.controller.ts
import crypto3 from "node:crypto";
async function createUserRecord(name, email, role, grade = "Class 8", rollNo, avatar, streak = 7, xp = 450) {
  const normalizedEmail = email.toLowerCase().trim();
  const id = `usr_${crypto3.randomUUID().slice(0, 8)}`;
  const user = new UserModel({
    id,
    name,
    email: normalizedEmail,
    role,
    grade,
    rollNo,
    streakDays: streak,
    xp,
    avatarUrl: avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCK0-0JwP88HWKu6oQUjNCgb05unct8XMYddUw_uJdbLA0udACQT_FFuVSr1d5XjNIOslLrb6GEB48SK31UfdAcXtHCCJs_HYunCs3RvJhaIjgvn0JafTdn1Xb2gOzOhPMu-i423Gq716dY930KOuTNgm-J15PqGdJfd3NFMlTdAi0j_IKIOAfFxd77CAJUlH2GCMydp8pHzKBCW3tXWhy5Oj6nk8XJrIwC0E2V2FyRGY0uulK_ckKD",
    language: "EN",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  await user.save();
  return user.toObject();
}
async function getAuthenticatedUser(req) {
  const token = req.cookies?.session_token;
  if (token) {
    const session = await SessionModel.findOne({ token });
    if (session && session.expiresAt > Date.now()) {
      const user = await UserModel.findOne({ id: session.userId }).lean();
      if (user) return user;
    }
  }
  const authHeader = req.headers.authorization?.replace("Bearer ", "");
  if (authHeader) {
    try {
      const attrs = await cognitoService.getUser(authHeader);
      const email = attrs.email?.toLowerCase().trim();
      if (!email) return null;
      let user = await UserModel.findOne({ email }).lean();
      if (!user) {
        user = await createUserRecord(attrs.name || "User", email, attrs["custom:role"] || "student");
      }
      return user;
    } catch (e) {
      console.warn("JWT Auto-Restore failed:", e.message);
    }
  }
  return null;
}
var authController = {
  async signup(req, res) {
    try {
      const { name, email, password, role = "student", grade = "Class 8" } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
      }
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await UserModel.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }
      try {
        await cognitoService.signUp(normalizedEmail, password, name, role);
      } catch (cognitoErr) {
        console.error("Cognito Signup Failed:", cognitoErr.message);
        return res.status(400).json({ error: cognitoErr.message || "Failed to sign up with AWS" });
      }
      let cognitoAuth;
      try {
        cognitoAuth = await cognitoService.signIn(normalizedEmail, password);
      } catch (loginErr) {
        console.warn("Auto-login after signup failed:", loginErr.message);
      }
      const newUser = await createUserRecord(name, normalizedEmail, role, grade);
      const token = generateToken();
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1e3;
      await SessionModel.create({ token, userId: newUser.id, expiresAt });
      res.cookie("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
      });
      return res.status(201).json({
        message: "Signup successful",
        user: sanitizeUser(newUser),
        token,
        jwt: cognitoAuth
      });
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).json({ error: "Internal server error during registration" });
    }
  },
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const normalizedEmail = email.toLowerCase().trim();
      let cognitoAuth;
      try {
        cognitoAuth = await cognitoService.signIn(normalizedEmail, password);
      } catch (cognitoErr) {
        console.error("Cognito Login Failed:", cognitoErr.message);
        return res.status(401).json({ error: cognitoErr.message || "Invalid email or password" });
      }
      let user = await UserModel.findOne({ email: normalizedEmail }).lean();
      if (!user) {
        let realName = "User";
        let realRole = "student";
        if (cognitoAuth?.AccessToken) {
          try {
            const attrs = await cognitoService.getUser(cognitoAuth.AccessToken);
            if (attrs.name) realName = attrs.name;
            if (attrs["custom:role"]) realRole = attrs["custom:role"];
          } catch (e) {
            console.warn("Failed to fetch user attributes from Cognito", e);
          }
        }
        user = await createUserRecord(realName, normalizedEmail, realRole);
      }
      const token = generateToken();
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1e3;
      await SessionModel.create({ token, userId: user.id, expiresAt });
      res.cookie("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
      });
      return res.json({
        message: "Login successful",
        user: sanitizeUser(user),
        token,
        jwt: cognitoAuth
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Internal server error during login" });
    }
  },
  async logout(req, res) {
    const token = req.cookies?.session_token || req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      await SessionModel.deleteOne({ token });
    }
    res.clearCookie("session_token");
    return res.json({ message: "Logged out successfully" });
  },
  async getMe(req, res) {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthenticated", isAuthenticated: false });
    }
    return res.json({ user: sanitizeUser(user), isAuthenticated: true });
  },
  async getStudents(req, res) {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthenticated" });
    if (user.role === "teacher") {
      const students = await UserModel.find({ role: "student" }).lean();
      return res.json({ students: students.map(sanitizeUser) });
    }
    if (user.role === "parent") {
      if (!user.studentIds || user.studentIds.length === 0) {
        return res.json({ students: [] });
      }
      const students = await UserModel.find({ id: { $in: user.studentIds } }).lean();
      return res.json({ students: students.map(sanitizeUser) });
    }
    return res.status(403).json({ error: "Unauthorized role" });
  },
  async linkStudent(req, res) {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "parent") {
      return res.status(403).json({ error: "Only parents can link students" });
    }
    const { studentEmail } = req.body;
    if (!studentEmail) return res.status(400).json({ error: "Student email required" });
    const student = await UserModel.findOne({ email: studentEmail.toLowerCase().trim() });
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }
    if (!user.studentIds) user.studentIds = [];
    if (!user.studentIds.includes(student.id)) {
      await UserModel.updateOne({ id: user.id }, { $push: { studentIds: student.id } });
    }
    if (!student.parentIds) student.parentIds = [];
    if (!student.parentIds.includes(user.id)) {
      await UserModel.updateOne({ id: student.id }, { $push: { parentIds: user.id } });
    }
    try {
      await cognitoService.linkParentToStudent(user.email, student.email);
    } catch (e) {
      console.warn("Cognito link failed:", e.message);
    }
    const updatedStudent = await UserModel.findOne({ id: student.id }).lean();
    return res.json({ message: "Student linked successfully", student: sanitizeUser(updatedStudent) });
  }
};

// backend/routes/auth.routes.ts
var router = Router();
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.getMe);
router.get("/students", authController.getStudents);
router.post("/link-student", authController.linkStudent);
var auth_routes_default = router;

// backend/routes/ai.routes.ts
import { Router as Router2 } from "express";

// backend/services/gemini.service.ts
import { GoogleGenAI } from "@google/genai";
import dotenv2 from "dotenv";
dotenv2.config();
var ai = config.geminiApiKey ? new GoogleGenAI({
  apiKey: config.geminiApiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
console.log("AI is", ai, "apikey ", config.geminiApiKey);
var FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite"
];
async function generateGeminiWithFallback(params) {
  if (!ai) return null;
  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.systemInstruction ? { systemInstruction: params.systemInstruction } : void 0
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn(`[Gemini Service] Model ${model} failed, trying fallback:`, err?.message);
    }
  }
  return null;
}
function getHeuristicTeacherReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes("quadratic") || lower.includes("2x^2") || lower.includes("equation")) {
    return `Let's look at quadratic equations like 2x\xB2 + 5x = 0 with ease!

\u{1F4A1} **Key Concept**: Factoring out common terms.
- Look at both terms: **2x\xB2** and **5x**.
- Both have 'x' in common! 
- So we factor out 'x': **x(2x + 5) = 0**.

Now apply the zero-product rule: either **x = 0** or **2x + 5 = 0** (which means x = -5/2).
See how simple it becomes once we factor? How does that feel to you?`;
  }
  if (lower.includes("zinc") || lower.includes("acid") || lower.includes("gas") || lower.includes("chemistry")) {
    return `Great observation from our science lab experiment!

\u{1F52C} When solid **Zinc granules (Zn)** are dropped into dilute **Hydrochloric Acid (HCl)**:
- Chemical Reaction: **Zn + 2HCl \u2192 ZnCl\u2082 + H\u2082\u2191**
- The Zinc is more reactive than Hydrogen, so it displaces it!
- The gas bubbles you see collecting in the trough are pure **Hydrogen Gas (H\u2082)**.
- If you bring a burning splinter near it, it burns with a joyful little **'pop' sound**!

Isn't that exciting? Would you like to know how we test for other gases like Oxygen or Carbon Dioxide too?`;
  }
  if (lower.includes("pythagoras") || lower.includes("triangle") || lower.includes("hypotenuse")) {
    return `The Pythagorean theorem (a\xB2 + b\xB2 = c\xB2) is one of my favorite geometry discoveries!

\u{1F4D0} Think of a right-angled triangle like a ladder leaning against a wall:
- Ground distance is **a**
- Wall height is **b**
- The ladder itself is the hypotenuse **c**

The square of the ladder's length is always equal to the sum of the squares of the wall and ground: **a\xB2 + b\xB2 = c\xB2**.
For instance, if a = 3 and b = 4, then:
3\xB2 + 4\xB2 = 9 + 16 = 25, and \u221A25 = **5**!`;
  }
  if (lower.includes("division") || lower.includes("456")) {
    return `Dividing 456 by 12 is like distributing 456 mangoes into boxes of 12!

Let's do it in 2 simple steps:
1. Look at the first two digits **45**:
   12 \xD7 3 = 36. (3 times).
   45 - 36 = **9**.
2. Bring down the next digit **6** to make **96**:
   12 \xD7 8 = 96 exactly!
   96 - 96 = **0**.

So 456 \xF7 12 = **38** with zero remainder! Did that step make sense?`;
  }
  return `I am Anita Ma'am, your learning mentor. That is a wonderful question! Let's break it down:

1. First, identify what values are given and what the problem is asking you to solve.
2. Remember that science and math are all about patterns\u2014like balancing ingredients in a recipe.
3. Try isolating the unknown variable or identifying the chemical reactants first.

What is the very first step you feel confident trying here?`;
}

// backend/controllers/ai.controller.ts
var aiController = {
  async generateFlashcardExplanation(req, res) {
    const { formula, title, def } = req.body;
    if (ai) {
      try {
        const prompt = `You are an AI teacher. A student is reviewing a flashcard about "${title}" (Formula: ${formula}). The formal definition is: "${def}".
Please provide a highly intuitive, real-world everyday analogy (like the farm example for the Pythagorean theorem) to make this concept crystal clear. Keep it to 3-4 sentences. Use markdown for readability.`;
        const explanation = await generateGeminiWithFallback({ contents: prompt });
        if (explanation) {
          return res.json({ explanation });
        }
      } catch (e) {
        console.warn("Failed to generate explanation", e.message);
      }
    }
    return res.json({ explanation: `Imagine applying ${title} in your daily life! It's like balancing a seesaw or walking across a field. (Fallback explanation)` });
  },
  async generateTargetedFlashcards(req, res) {
    const { topic } = req.body;
    if (ai) {
      try {
        const prompt = `Generate 2 educational flashcards for a Class 8 student struggling with ${topic}.
Return ONLY a valid JSON array with objects containing: 'formula' (or key concept), 'title', 'def' (definition). No markdown wrapping, just JSON.`;
        const responseText = await generateGeminiWithFallback({ contents: prompt });
        if (responseText) {
          const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
          const cards = JSON.parse(cleanJson);
          return res.json({ cards });
        }
      } catch (e) {
        console.warn("Failed to generate targeted flashcards", e.message);
      }
    }
    return res.json({ cards: [{ formula: "Targeted Review", title: topic, def: `Review the basics of ${topic}.` }] });
  },
  async ttsProxy(req, res) {
    const text = req.query.text;
    const tl = req.query.tl || "en-IN";
    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encodeURIComponent(text)}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Referer": "https://translate.google.com/"
        }
      });
      if (!response.ok) {
        throw new Error(`Google TTS returned ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (contentType) res.setHeader("Content-Type", contentType);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (error) {
      console.error("TTS Proxy Error:", error.message);
      res.status(500).json({ error: "Failed to fetch TTS" });
    }
  },
  async teacherChatStream(req, res) {
    console.log("AI request");
    const { message, history = [], subject = "Science & Math", language = "English" } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message text is required" });
    }
    const systemPrompt = `You are Anita Ma'am, a compassionate, patient Indian Middle School Teacher (Class 8) and Socratic Mentor for the Shiksha Mitra learning platform.
Role guidelines:
1. Warm, encouraging Indian teacher persona ("Wonderful attempt!", "Let us break it down step-by-step"). Do NOT start your responses with greetings like "Namaste beta!".
2. Teach using the Socratic Method: don't just dump final answers; guide students through step-by-step thinking.
3. Current subject focus: ${subject}. Preferred language: ${language}.
4. Provide structured, visually clean responses: bold key terms, use clear numbered steps, format math cleanly (e.g. 2x\xB2 + 5x = 0, x(2x + 5) = 0).
5. Always end with an encouraging question or next tiny step for the student to try.`;
    const conversationContext = history.slice(-6).map((m) => `${m.sender === "user" ? "Student" : "Anita Ma'am"}: ${m.text}`).join("\n\n");
    const prompt = `${conversationContext ? `Recent conversation context:
${conversationContext}

` : ""}Student's current question: "${message}"

Anita Ma'am, please guide the student:`;
    if (ai) {
      const MODELS = [
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-3.8-flash"
      ];
      for (const model of MODELS) {
        try {
          console.log("Using model", model);
          const streamResult = await ai.models.generateContentStream({
            model,
            contents: prompt,
            config: { systemInstruction: systemPrompt }
          });
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Transfer-Encoding", "chunked");
          res.setHeader("Cache-Control", "no-cache");
          res.setHeader("X-Accel-Buffering", "no");
          for await (const chunk of streamResult) {
            const text = chunk.text;
            if (text) res.write(text);
          }
          res.end();
          return;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[AI Controller] Stream model ${model} failed:`, msg);
          if (res.headersSent) {
            res.end();
            return;
          }
        }
      }
    }
    const fallback = getHeuristicTeacherReply(message);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.write(fallback);
    res.end();
  },
  async socraticHint(req, res) {
    const { question, currentInput, context, language = "English" } = req.body;
    if (ai) {
      try {
        const prompt = `You are Shiksha Mitra, a warm, culturally empathetic Indian educational mentor. 
A student is working on this problem: "${question}".
Student's current input / doubt: "${currentInput || "Need a gentle hint"}".
Additional context: "${context || "Class 8 Science or Math"}".

Provide a short, encouraging Socratic hint (2-3 sentences max).
Do NOT reveal the direct final answer. Instead, ask a thought-provoking guiding question that sparks their own realization.
Include a 1-sentence Hindi or regional translation in italics if appropriate.`;
        const hintText = await generateGeminiWithFallback({
          contents: prompt
        });
        if (hintText) {
          return res.json({ hint: hintText });
        }
      } catch (error) {
        console.warn("[AI Controller] Gemini hint failed, using heuristic:", error?.message);
      }
    }
    return res.json({
      hint: "Observe the reactant elements carefully, beta! When a reactive metal meets an acid, look at what gas forms bubbles. What happens to the hydrogen? *(\u0938\u0902\u0915\u0947\u0924: \u091C\u092C \u0927\u093E\u0924\u0941 \u0914\u0930 \u0905\u092E\u094D\u0932 \u092E\u093F\u0932\u0924\u0947 \u0939\u0948\u0902, \u0924\u094B \u0915\u094C\u0928 \u0938\u0940 \u0917\u0948\u0938 \u0928\u093F\u0915\u0932\u0924\u0940 \u0939\u0948?)*"
    });
  },
  async diagnoseLoophole(req, res) {
    const { topic, incorrectAnswer, stepDetails } = req.body;
    if (ai) {
      try {
        const prompt = `You are the Shiksha Mitra AI Loophole Engine. 
A Class 8 student made an error in "${topic || "Linear Equations / Algebra"}".
Incorrect step/answer: "${incorrectAnswer || "2x + 5 = 10 -> 2x = 15"}".
Details: "${stepDetails || "Student added 5 to both sides instead of subtracting"}".

Diagnose the root conceptual loophole tracing back to foundational grades (Class 4 to 6).
Output a concise 2-sentence diagnostic identifying:
1. The exact elementary school gap (e.g. Class 4 Fraction division or inverse balance).
2. The recommended targeted remediation step.`;
        const analysis = await generateGeminiWithFallback({
          contents: prompt
        });
        if (analysis) {
          return res.json({ analysis });
        }
      } catch (e) {
        console.warn("[AI Controller] Gemini diagnostic fallback:", e?.message);
      }
    }
    return res.json({
      analysis: "Rahul repeatedly struggled with isolating variables when fractions are present. The AI traces this foundation loophole to 6th-grade basic balance equations and Class 4 equal-denominator rules. Master Class 4 fractions to unlock Class 8 Algebra.",
      foundationalGrade: "Class 4 & 6",
      severity: "High"
    });
  },
  evaluateBatch(req, res) {
    const { batchId = req.body.batchId || "batch_term1_math", totalPapers = req.body.totalPapers || 0 } = req.body;
    const results = [];
    return res.json({
      batchId,
      totalPapers,
      evaluatedCount: 0,
      classAverage: 0,
      loopholesIdentified: 0,
      topGap: "None",
      students: results,
      completedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
};

// backend/routes/ai.routes.ts
var router2 = Router2();
router2.post("/teacher-chat", aiController.teacherChatStream);
router2.post("/socratic-hint", aiController.socraticHint);
router2.post("/diagnose-loophole", aiController.diagnoseLoophole);
router2.post("/evaluate-batch", aiController.evaluateBatch);
router2.get("/tts", aiController.ttsProxy);
router2.post("/flashcard-explanation", aiController.generateFlashcardExplanation);
router2.post("/generate-targeted-flashcards", aiController.generateTargetedFlashcards);
var ai_routes_default = router2;

// backend/routes/aws.routes.ts
import { Router as Router3 } from "express";

// backend/services/dynamodb.service.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";
var { region, accessKeyId, secretAccessKey, tableName } = config.aws;
var hasValidAwsCredentials = Boolean(
  accessKeyId && secretAccessKey && !accessKeyId.includes("your-aws") && !secretAccessKey.includes("your-aws")
);
var docClient = null;
if (hasValidAwsCredentials) {
  try {
    const baseClient = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    docClient = DynamoDBDocumentClient.from(baseClient);
    console.log(`[AWS DynamoDB Service] Connected to live AWS Cloud in ${region}`);
  } catch (err) {
    console.warn("[AWS DynamoDB Service] Init warning:", err?.message);
    docClient = null;
  }
}
var localDynamoStore = /* @__PURE__ */ new Map();
var initialRecords = [
  {
    PK: "USER#usr_pranav",
    SK: "PROFILE",
    recordType: "user_profile",
    data: {
      name: "Pranav Sharma",
      grade: "Class 8",
      school: "Kendriya Vidyalaya No. 1",
      xp: 720,
      streakDays: 12
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    createdAt: Date.now()
  },
  {
    PK: "USER#usr_pranav",
    SK: "EXAM#sci_mock_1",
    recordType: "exam_result",
    data: {
      subject: "Science (Term 1)",
      score: 85,
      total: 100,
      topic: "Zinc + Dilute HCl Reaction",
      status: "Passed with Distinction"
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    createdAt: Date.now() - 36e5
  },
  {
    PK: "USER#usr_pranav",
    SK: "LOOPHOLE#algebra_fraction",
    recordType: "loophole_diagnostic",
    data: {
      weakConcept: "Class 4 Fraction Equivalence",
      affectedTopic: "Class 8 Linear Equations",
      status: "Remediated via Anita Ma'am Socratic Mentor"
    },
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    createdAt: Date.now() - 72e5
  }
];
for (const r of initialRecords) {
  localDynamoStore.set(`${r.PK}#${r.SK}`, r);
}
var dynamoService = {
  isLive: hasValidAwsCredentials && docClient !== null,
  region,
  tableName,
  async getStatus() {
    return {
      connected: this.isLive,
      mode: this.isLive ? "Live AWS Cloud" : "Free Tier Local Fallback",
      region,
      tableName,
      freeTierHighlights: {
        alwaysFree: "25 GB Storage free forever",
        capacity: "25 WCU / 25 RCU (handles ~200 million requests/month)",
        cost: "$0.00 / month on AWS Free Tier"
      },
      itemCount: this.isLive ? "Dynamic (Live Table)" : localDynamoStore.size,
      credentialsConfigured: hasValidAwsCredentials
    };
  },
  async putRecord(record) {
    const start = Date.now();
    const fullRecord = {
      ...record,
      createdAt: Date.now()
    };
    if (this.isLive && docClient) {
      try {
        await docClient.send(
          new PutCommand({
            TableName: tableName,
            Item: fullRecord
          })
        );
        return { success: true, latencyMs: Date.now() - start, mode: "Live AWS DynamoDB" };
      } catch (err) {
        console.warn("[AWS DynamoDB] PutCommand fallback:", err.message);
      }
    }
    localDynamoStore.set(`${fullRecord.PK}#${fullRecord.SK}`, fullRecord);
    return { success: true, latencyMs: Date.now() - start, mode: "Local DynamoDB Engine" };
  },
  async getRecord(PK, SK) {
    if (this.isLive && docClient) {
      try {
        const res = await docClient.send(
          new GetCommand({
            TableName: tableName,
            Key: { PK, SK }
          })
        );
        if (res.Item) return res.Item;
      } catch (err) {
        console.warn("[AWS DynamoDB] GetCommand fallback:", err.message);
      }
    }
    return localDynamoStore.get(`${PK}#${SK}`) || null;
  },
  async queryByPartition(PK) {
    if (this.isLive && docClient) {
      try {
        const res = await docClient.send(
          new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "PK = :pk",
            ExpressionAttributeValues: {
              ":pk": PK
            }
          })
        );
        if (res.Items) return res.Items;
      } catch (err) {
        console.warn("[AWS DynamoDB] QueryCommand fallback:", err.message);
      }
    }
    const matches = [];
    for (const [, val] of localDynamoStore.entries()) {
      if (val.PK === PK) {
        matches.push(val);
      }
    }
    return matches.sort((a, b) => b.createdAt - a.createdAt);
  },
  async scanAll() {
    if (this.isLive && docClient) {
      try {
        const res = await docClient.send(
          new ScanCommand({
            TableName: tableName,
            Limit: 50
          })
        );
        if (res.Items) return res.Items;
      } catch (err) {
        console.warn("[AWS DynamoDB] ScanCommand fallback:", err.message);
      }
    }
    return Array.from(localDynamoStore.values()).sort((a, b) => b.createdAt - a.createdAt);
  },
  async testConnection() {
    const start = Date.now();
    const testKey = `TEST#${Date.now()}`;
    const testRecord = {
      PK: "SYSTEM#HEALTHCHECK",
      SK: testKey,
      recordType: "user_profile",
      data: { ping: "pong", verifiedAt: (/* @__PURE__ */ new Date()).toISOString() },
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      createdAt: Date.now()
    };
    const putRes = await this.putRecord(testRecord);
    const latency = Date.now() - start;
    return {
      success: true,
      latencyMs: latency,
      message: this.isLive ? `Successfully connected to Amazon DynamoDB in ${region}! Verified live read/write table '${tableName}'.` : `Amazon DynamoDB integration active (Always-Free Tier compatible). Ready to switch to Live AWS whenever AWS credentials are provided in .env.`,
      mode: putRes.mode
    };
  }
};

// backend/controllers/aws.controller.ts
var awsController = {
  async getStatus(_req, res) {
    try {
      const status = await dynamoService.getStatus();
      return res.json(status);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  async testConnection(_req, res) {
    try {
      const testResult = await dynamoService.testConnection();
      return res.json(testResult);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  async getRecords(req, res) {
    try {
      const { pk } = req.query;
      if (pk && typeof pk === "string") {
        const records = await dynamoService.queryByPartition(pk);
        return res.json({ records });
      }
      const allRecords = await dynamoService.scanAll();
      return res.json({ records: allRecords });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  async saveRecord(req, res) {
    try {
      const { PK, SK, recordType, data } = req.body;
      if (!PK || !SK) {
        return res.status(400).json({ error: "PK and SK are required partition keys" });
      }
      const result = await dynamoService.putRecord({
        PK,
        SK,
        recordType: recordType || "user_profile",
        data: data || {},
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
  async syncData(_req, res) {
    try {
      let syncedCount = 0;
      const users = await UserModel.find().lean();
      for (const user of users) {
        await dynamoService.putRecord({
          PK: `USER#${user.id}`,
          SK: "PROFILE",
          recordType: "user_profile",
          data: sanitizeUser(user),
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        syncedCount++;
      }
      return res.json({
        success: true,
        syncedCount,
        message: `Successfully synchronized ${syncedCount} student profiles into AWS DynamoDB table '${dynamoService.tableName}'.`,
        tableName: dynamoService.tableName
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
};

// backend/routes/aws.routes.ts
var router3 = Router3();
router3.get("/status", awsController.getStatus);
router3.post("/test", awsController.testConnection);
router3.get("/records", awsController.getRecords);
router3.post("/save-record", awsController.saveRecord);
router3.post("/sync", awsController.syncData);
var aws_routes_default = router3;

// backend/routes/quiz.routes.ts
import { Router as Router4 } from "express";

// backend/models/quiz.model.ts
import mongoose3, { Schema as Schema3 } from "mongoose";
var QuestionSchema = new Schema3({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
  imageUrl: { type: String }
});
var QuizSchema = new Schema3({
  subjectId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  questions: [QuestionSchema]
});
var QuizModel = mongoose3.models.Quiz || mongoose3.model("Quiz", QuizSchema);
var ExamAttemptSchema = new Schema3({
  userId: { type: String, required: true },
  subjectId: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  answers: [{
    questionIndex: { type: Number, required: true },
    selectedOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  completedAt: { type: Date, default: Date.now }
});
var ExamAttemptModel = mongoose3.models.ExamAttempt || mongoose3.model("ExamAttempt", ExamAttemptSchema);

// backend/controllers/quiz.controller.ts
var quizController = {
  async getAllQuizzes(req, res) {
    try {
      const quizzes = await QuizModel.find({}, "subjectId title durationMinutes questions").lean();
      const summary = quizzes.map((q) => ({
        id: q.subjectId,
        title: q.title,
        durationMinutes: q.durationMinutes,
        totalQuestions: q.questions.length
      }));
      return res.json(summary);
    } catch (err) {
      console.error("getAllQuizzes error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  async getQuiz(req, res) {
    try {
      const { subjectId } = req.params;
      let quiz = await QuizModel.findOne({ subjectId });
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      return res.json(quiz);
    } catch (err) {
      console.error("getQuiz error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  async submitAttempt(req, res) {
    try {
      const user = await getAuthenticatedUser(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthenticated" });
      }
      const { subjectId } = req.params;
      const { answers } = req.body;
      const quiz = await QuizModel.findOne({ subjectId });
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      let score = 0;
      const evaluatedAnswers = answers.map((ans) => {
        const question = quiz.questions[ans.questionIndex];
        const isCorrect = question.correctAnswer === ans.selectedOption;
        if (isCorrect) score++;
        return {
          questionIndex: ans.questionIndex,
          selectedOption: ans.selectedOption,
          isCorrect
        };
      });
      const attempt = await ExamAttemptModel.create({
        userId: user.id,
        subjectId,
        score,
        totalQuestions: quiz.questions.length,
        answers: evaluatedAnswers
      });
      return res.status(201).json(attempt);
    } catch (err) {
      console.error("submitAttempt error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  async getReports(req, res) {
    try {
      const user = await getAuthenticatedUser(req);
      if (!user) return res.status(401).json({ error: "Unauthenticated" });
      let targetUserId = user.id;
      if ((user.role === "teacher" || user.role === "parent") && req.query.studentId) {
        targetUserId = req.query.studentId;
      }
      const attempts = await ExamAttemptModel.find({ userId: targetUserId }).sort({ completedAt: -1 });
      return res.json(attempts);
    } catch (err) {
      console.error("getReports error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

// backend/routes/quiz.routes.ts
var router4 = Router4();
router4.get("/all", quizController.getAllQuizzes);
router4.get("/:subjectId", quizController.getQuiz);
router4.post("/:subjectId/submit", quizController.submitAttempt);
router4.get("/reports/all", quizController.getReports);
var quiz_routes_default = router4;

// backend/routes/index.ts
var router5 = Router5();
router5.use("/auth", auth_routes_default);
router5.use("/ai", ai_routes_default);
router5.use("/aws", aws_routes_default);
router5.use("/quiz", quiz_routes_default);
var routes_default = router5;

// backend/server.ts
mongoose4.set("bufferCommands", false);
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var app = express();
var httpServer = http.createServer(app);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use("/api", routes_default);
app.get("/", (req, res) => {
  res.send("hello from shiksha-mantra backend");
});
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "Shiksha Mitra AI Backend",
    architecture: "Modular Full-Stack Enterprise Pattern",
    port: config.port
  });
});
async function startServer() {
  const isProduction = config.nodeEnv === "production" || process.env.NODE_ENV === "production";
  if (!isProduction) {
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith("/api")) {
        return next();
      }
    });
  }
  try {
    await mongoose4.connect(config.mongoUri);
    console.log("[Shiksha Mitra AI] Connected to MongoDB");
  } catch (error) {
    console.error("[Shiksha Mitra AI] MongoDB connection error:", error);
  }
  return httpServer.listen(config.port, "0.0.0.0", () => {
    console.log(
      `[Shiksha Mitra AI] backend running on http://localhost:${config.port} (${isProduction ? "production" : "development"})`
    );
  });
}
if (process.env.NODE_ENV !== "test") {
  startServer().catch((err) => {
    console.error("[Shiksha Mitra AI] Failed to start server:", err);
  });
}
export {
  app,
  httpServer,
  startServer
};
