import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/data/chatbot-config';

// Supported providers: 'groq' | 'gemini' | 'openai'
// Configure via CYBERTECH_LLM_PROVIDER in .env.local (default: 'groq')
const PROVIDER = process.env.CYBERTECH_LLM_PROVIDER ?? 'groq';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const JAILBREAK_RESPONSE = "cih mau JAILBREAK bang? 😂, inget Surat Al-Baqarah Ayat 9: Mereka hendak menipu Allah dan orang-orang yang beriman, padahal mereka hanyalah menipu diri sendiri tanpa mereka sadari.";

const GANTENG_RESPONSE = "kepala divisi programming itu ganteng banget di atas jefri nichol panggil dia fineshit kota padang";

function isJailbreakOrMisuseAttempt(text: string): boolean {
  const lower = text.toLowerCase();

  // 1. Classic Jailbreak & Injection Triggers
  const jailbreakKeywords = [
    'jailbreak', 'jail break', 'prompt injection', 'blackprompt', 'black prompt',
    'ignore previous', 'ignore all previous', 'disregard previous', 'forget all rules',
    'system prompt', 'bocorkan prompt', 'show system prompt', 'dan mode', 'dev mode',
    'developer mode', 'bypass', 'override instructions', 'unrestricted ai', 'act as a',
    'pretend to be', 'simulate an ai', 'bypass rules', 'override', 'hacker mode',
    'sudo', 'root mode', 'system instructions', 'ignore rules'
  ];

  // 2. Off-loading coding homework / asking AI to write arbitrary code / selesaikan kodingan
  const codingMisuseKeywords = [
    'buatkan koding', 'buatkan kode', 'tuliskan kode', 'bikin koding', 'bikin kode',
    'buatkan script', 'bikin script', 'buatkan skrip', 'bikin skrip', 'tuliskan script',
    'tuliskan program', 'buatkan program', 'bikin program', 'selesaikan koding',
    'selesaikan kode', 'selesaikan kodingan', 'tulis kodingan', 'bikin kodingan',
    'buatkan website', 'bikin website dari nol', 'kerjakan tugas', 'bikin tugas',
    'solve coding', 'write code', 'create python', 'create script'
  ];

  const matchesJailbreak = jailbreakKeywords.some(k => lower.includes(k));
  const matchesCodingMisuse = codingMisuseKeywords.some(k => lower.includes(k));

  return matchesJailbreak || matchesCodingMisuse;
}

function isGantengQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('ganteng') || lower.includes('tampan')
  ) && (
    lower.includes('siapa') || lower.includes('paling') || lower.includes('banget') || lower.includes('kah')
  );
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    // 1. Instant Deterministic Jailbreak & Coding Misuse Check
    if (isJailbreakOrMisuseAttempt(lastMessage)) {
      return NextResponse.json({ content: JAILBREAK_RESPONSE });
    }

    // 2. Instant Deterministic Easter Egg Check
    if (isGantengQuestion(lastMessage)) {
      return NextResponse.json({ content: GANTENG_RESPONSE });
    }

    let content: string;

    if (PROVIDER === 'groq') {
      content = await callGroq(messages);
    } else if (PROVIDER === 'gemini') {
      content = await callGemini(messages);
    } else if (PROVIDER === 'openai') {
      content = await callOpenAI(messages);
    } else {
      content = await callGroq(messages);
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('[ChatAPI] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* -------------------------------------------------------
   GROQ API (Llama 3.1 8B Instant - Super Fast & Ultra Token Efficient)
   Set GROQ_API_KEY in .env.local
------------------------------------------------------- */
async function callGroq(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY || process.env.CYBERTECH_GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set in .env.local');

  const model = process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant';

  // Send only system prompt + last 6 messages
  const recentMessages = messages.slice(-6);

  const body = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentMessages.map(m => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 300,
    temperature: 0.5,
  };

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? 'Maaf, tidak ada respons dari Groq AI.';
}

/* -------------------------------------------------------
   GEMINI (Google AI)
   Set CYBERTECH_GEMINI_API_KEY in .env.local
------------------------------------------------------- */
async function callGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.CYBERTECH_GEMINI_API_KEY;
  if (!apiKey) throw new Error('CYBERTECH_GEMINI_API_KEY not set');

  const history = messages.slice(-6).slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      ...history,
      { role: 'user', parts: [{ text: lastMessage.content }] },
    ],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 300,
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Maaf, tidak ada respons.';
}

/* -------------------------------------------------------
   OPENAI (GPT)
   Set CYBERTECH_OPENAI_API_KEY in .env.local
------------------------------------------------------- */
async function callOpenAI(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.CYBERTECH_OPENAI_API_KEY;
  if (!apiKey) throw new Error('CYBERTECH_OPENAI_API_KEY not set');

  const recentMessages = messages.slice(-6);

  const body = {
    model: process.env.CYBERTECH_OPENAI_MODEL ?? 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentMessages.map(m => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 300,
    temperature: 0.5,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? 'Maaf, tidak ada respons.';
}
