import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/data/chatbot-config';

// Supported providers: 'gemini' | 'openai'
// Configure via CYBERTECH_LLM_PROVIDER in .env.local (default: 'gemini')
const PROVIDER = process.env.CYBERTECH_LLM_PROVIDER ?? 'gemini';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    let content: string;

    if (PROVIDER === 'gemini') {
      content = await callGemini(messages);
    } else if (PROVIDER === 'openai') {
      content = await callOpenAI(messages);
    } else {
      return NextResponse.json({ error: 'Unknown LLM provider' }, { status: 500 });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('[ChatAPI] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* -------------------------------------------------------
   GEMINI (Google AI)
   Set CYBERTECH_GEMINI_API_KEY in .env.local
------------------------------------------------------- */
async function callGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.CYBERTECH_GEMINI_API_KEY;
  if (!apiKey) throw new Error('CYBERTECH_GEMINI_API_KEY not set');

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map(m => ({
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
      temperature: 0.7,
      maxOutputTokens: 512,
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

  const body = {
    model: process.env.CYBERTECH_OPENAI_MODEL ?? 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 512,
    temperature: 0.7,
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
