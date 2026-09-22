import { GoogleGenAI } from '@google/genai';
import { verifyUser } from './_lib/verifyUser';

// Reused across warm invocations of this function.
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// High-performance models according to Gemini API guidance:
// - gemini-flash-latest: Auto-points to the latest recommended Flash model
// - gemini-3.8-flash: Fast, high intelligence model for general university Q&A
// - gemini-3.1-flash-lite: Lightweight, reliable model for instant answers
const CANDIDATE_MODELS = [
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
];

function buildSystemInstruction(opts: {
  courseCode?: string;
  level?: string;
  faculty?: string;
  department?: string;
  mode?: string;
}) {
  let instruction = `You are StudyGen AI, an intelligent, elite academic tutor and university course mentor for Nigerian university students across all faculties (Science, Engineering, Computing & IT, Health Sciences, Law, Management & Social Sciences, Arts, Education, Agriculture, etc.).

Your purpose is to help university students understand subjects, solve complex academic problems, master difficult concepts, practice examination questions, generate high-yield study flashcards, and prepare for tests and semester exams.

Core Guidelines:
1. Answer the student's actual question directly, accurately, and naturally.
2. Adapt your response structure and depth:
   - For STEM, Calculations & Mathematics: Show clear step-by-step working, state formulas with definitions, state SI units, and highlight the final solution clearly.
   - For Programming & Computer Science: Provide clean, idiomatic code with concise explanation of key logic and time complexity where relevant.
   - For Multiple Choice Quizzes: Provide clear questions with options (A, B, C, D), followed by the correct option and concise rationale.
   - For Flashcards: Provide structured Term / Concept vs. High-Yield Definition / Formula.
   - For Summaries: Provide clear bulleted points and core takeaways.
3. If a target course code (e.g. MTH 101, CSC 201, GST 111, CHM 101, PHY 102) is provided, tailor terminology and context to that university course curriculum.
4. Keep formatting clean with clear markdown headings (###), bold text, bullet points, and code blocks where helpful.
5. NEVER prepend robotic intros like "As an AI..." or "Here is your study summary". Start directly with the answer.`;

  if (opts.courseCode) instruction += `\nTarget Course Code: ${opts.courseCode}.`;
  if (opts.level) instruction += `\nStudent Academic Level: ${opts.level}.`;
  if (opts.faculty || opts.department) {
    instruction += `\nAcademic Field: ${[opts.faculty, opts.department].filter(Boolean).join(' - ')}.`;
  }
  if (opts.mode && opts.mode !== 'general') instruction += `\nRequested Mode: ${opts.mode}.`;

  return instruction;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- Auth gate: without this, anyone on the internet can call this endpoint
  // directly and burn through the Gemini API quota/budget for free, logged in or not.
  const user = await verifyUser(req);
  if (!user) {
    return res.status(401).json({ error: 'You must be signed in to use StudyGen AI.' });
  }

  try {
    const { prompt, mode, courseCode, level, topic, history, faculty, department } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    // Basic abuse guard: absurdly long prompts cost real money per request.
    if (prompt.length > 6000) {
      return res.status(400).json({ error: 'Prompt is too long. Please shorten your question.' });
    }

    const systemInstruction = buildSystemInstruction({ courseCode, level, faculty, department, mode });

    let contents: any = prompt;
    if (Array.isArray(history) && history.length > 0) {
      const conversationContents = history
        .slice(-6) // cap context so a long chat can't balloon token costs
        .filter((h: any) => h && h.content && typeof h.content === 'string')
        .map((h: any) => ({
          role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.content }],
        }));
      conversationContents.push({ role: 'user', parts: [{ text: prompt }] });
      contents = conversationContents;
    }

    const client = getGeminiClient();
    let responseText = '';
    let lastError: any = null;

    if (client) {
      for (const candidate of CANDIDATE_MODELS) {
        try {
          const response = await client.models.generateContent({
            model: candidate,
            contents,
            config: { systemInstruction, temperature: 0.7 },
          });
          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (mErr: any) {
          lastError = mErr;
          console.warn(`Model ${candidate} call failed, trying next candidate:`, mErr?.message);
        }
      }
    }

    if (!responseText) {
      if (!client) {
        console.error('StudyGen AI: GEMINI_API_KEY is not set on the server.');
      } else if (lastError) {
        console.error('StudyGen AI: all candidate models failed.', lastError?.message);
      }
      return res.status(503).json({
        error:
          'StudyGen AI is temporarily unavailable — our AI provider could not be reached. Please try again shortly.',
      });
    }

    return res.status(200).json({ reply: responseText, success: true });
  } catch (err: any) {
    console.error('StudyGen AI server error:', err);
    return res.status(500).json({ error: 'StudyGen AI is temporarily unavailable. Please try again later.' });
  }
}
