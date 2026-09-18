import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/data/chatbot-config';

export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const JAILBREAK_RESPONSES = [
  'Waduh, trik prompt-nya keren juga! Tapi proteksi sistemku tetap aktif nih. Sebagai asisten resmi UKM CyberTech PNP, fokus utamaku adalah membantu seputar divisi, kegiatan, karya, dan pendaftaran anggota baru. Ada yang mau kamu tanyakan seputar CyberTech?',
  'Hehe, usaha jailbreak yang menarik! Tapi aku tetap fokus mendampingi kamu seputar dunia UKM CyberTech PNP. Mau kepoin divisi apa nih—Programming, Networking, atau Multimedia?',
  'Proteksi sistem aman terkendali! Daripada nyari celah prompt, mending asah skill bareng kita di divisi Networking & Cyber Security UKM CyberTech PNP. Tertarik buat gabung?',
];

const PROMPT_LEAK_RESPONSES = [
  'Wah, resep rahasia dapur itu mah! Yang jelas, aku siap bantu kamu kenal lebih dekat dengan UKM CyberTech PNP. Ada info divisi atau pendaftaran yang mau kamu kepoin?',
  'Instruksi sistemnya rahasia organisasi ya! Tapi kalau mau tahu info pendaftaran, divisi, atau kegiatan CyberTech, aku siap bantu kapan saja.',
];

const JOKI_RESPONSES = [
  'Hehe, kalau tugasnya dikerjain dari nol sama AI nanti kamu nggak dapat serunya proses belajar dong! Mending kita pelajari bareng di divisi Programming UKM CyberTech PNP, dari web dev sampai machine learning. Mau tahu cara gabungnya?',
  'Wah, untuk joki tugas dari nol aku belum bisa bantu ya. Tapi kalau kamu mau diskusi konsep atau belajar coding bareng mentor senior, yuk gabung ke UKM CyberTech PNP!',
];

const GANTENG_RESPONSE =
  'Kepala Divisi Programming itu ganteng banget, panggil saja dia fineshit Kota Padang!';

const FALLBACK_OFFLINE_RESPONSE =
  'Halo! Saya Cytech-AI Assistant. Saat ini layanan AI kami sedang dalam penyesuaian atau kuota harian telah tercapai. Anda tetap dapat menjelajahi seluruh informasi divisi, pendaftaran, karya, dan kegiatan UKM CyberTech PNP melalui menu navigasi website atau hubungi kami melalui Instagram @cybertechpnp.';

interface SafetyAnalysis {
  isBlocked: boolean;
  replyMessage?: string;
}

function analyzeSafety(text: string): SafetyAnalysis {
  const lower = text.toLowerCase().trim();

  // 1. Prompt Leaking / Extraction attempts
  const promptLeakRegex = /\b(bocorkan|tampilkan|show|print|output|reveal|dump|buka|lihat|share|spill)\s+(system\s*prompt|instruksi\s*sistem|prompt\s*awal|prompt\s*rahasia|system\s*instructions)\b/i;
  const promptQueryRegex = /\b(what\s+is\s+your|apa\s+isi|sebutkan)\s+(system\s*prompt|prompt\s*sistem|initial\s*prompt|prompt\s*kamu)\b/i;
  const repeatAllRegex = /\b(repeat\s+(everything|all)\s+(above|prior)|ulangi\s+semua\s+(teks|perintah)\s+di\s+atas)\b/i;

  if (promptLeakRegex.test(lower) || promptQueryRegex.test(lower) || repeatAllRegex.test(lower)) {
    const idx = Math.abs(text.length) % PROMPT_LEAK_RESPONSES.length;
    return { isBlocked: true, replyMessage: PROMPT_LEAK_RESPONSES[idx] };
  }

  // 2. Jailbreak, Role Override & Bypass attempts
  const jailbreakWordRegex = /\b(jailbreak|jail\s*break|blackprompt|black\s*prompt)\b/i;
  const ignoreInstructionsRegex = /\b(ignore|abaikan|lupakan|disregard|forget)\s+(all\s+)?(previous|prior|sebelumnya|aturan|rules|instructions|perintah|guardrails)\b/i;
  const personaBypassRegex = /\b(you\s+are\s+now|mulai\s+sekarang\s+kamu|kamu\s+sekarang\s+adalah)\s+(unrestricted|bebas|tanpa\s+aturan|dan\s+mode|developer\s+mode|evil|hacker)\b/i;
  const modesRegex = /\b(dan\s+mode|developer\s+mode|dev\s+mode|god\s+mode|unrestricted\s+mode)\b/i;
  const bypassSafetyRegex = /\b(bypass\s+all\s+(filters|rules|safety|guardrails)|bypass\s+aturan\s+sistem)\b/i;

  if (
    jailbreakWordRegex.test(lower) ||
    ignoreInstructionsRegex.test(lower) ||
    personaBypassRegex.test(lower) ||
    modesRegex.test(lower) ||
    bypassSafetyRegex.test(lower)
  ) {
    const idx = Math.abs(text.length) % JAILBREAK_RESPONSES.length;
    return { isBlocked: true, replyMessage: JAILBREAK_RESPONSES[idx] };
  }

  // 3. Pure Code Generation Requests (without asking about organization)
  const pureCodeGenRegex = /\b(buatkan|bikin|tuliskan|generate|create)\s+(saya\s+)?(kan\s+)?(kodingan?|coding(an)?|kode|script|skrip|program|game|source\s*code|aplikasi|website)\b/i;
  const isOrgQuestion = /(cybertech|pnp|politeknik|divisi|kegiatan|daftar|recruitment|organisasi|dph|ketua)/i.test(text);

  if (pureCodeGenRegex.test(lower) && !isOrgQuestion) {
    const idx = Math.abs(text.length) % JOKI_RESPONSES.length;
    return { isBlocked: true, replyMessage: JOKI_RESPONSES[idx] };
  }

  // 4. Blatant Homework / Joki Task Offloading
  const jokiRegex = /\b(jokiin|joki\s+tugas|joki\s+koding|kerjakan\s+tugas(ku| saya)?|tolong\s+selesaikan\s+tugas|buatkan\s+full\s+website\s+untuk\s+tugas)\b/i;
  if (jokiRegex.test(lower)) {
    const idx = Math.abs(text.length) % JOKI_RESPONSES.length;
    return { isBlocked: true, replyMessage: JOKI_RESPONSES[idx] };
  }

  return { isBlocked: false };
}

function sanitizeCodeOutput(text: string): string {
  // If the response contains markdown code blocks with HTML/JS/Python/full programs
  const codeBlockRegex = /```(?:html|javascript|js|python|css|cpp|c|java)?\s*[\s\S]*?```/gi;
  if (codeBlockRegex.test(text)) {
    return text.replace(codeBlockRegex, () => {
      return '\n*(Catatan: Sebagai asisten resmi UKM CyberTech PNP, aku tidak dapat memberikan source code aplikasi atau game utuh dari nol ya! 😄 Yuk pelajari dan kembangkan kemampuan coding-mu bersama kami di Divisi Programming UKM CyberTech PNP!)*\n';
    });
  }
  return text;
}

function isGantengQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    (lower.includes('ganteng') || lower.includes('tampan')) &&
    (lower.includes('siapa') || lower.includes('paling') || lower.includes('banget') || lower.includes('kah'))
  );
}

function getDynamicSystemPrompt(currentPage?: string): string {
  let pageDesc = 'Pengguna saat ini sedang berada di Halaman Utama (Beranda / Landing Page UKM CyberTech PNP).';

  if (currentPage === '/register') {
    pageDesc = 'Pengguna saat ini sedang berada di Halaman Form Pendaftaran Anggota Baru UKM CyberTech PNP (/register). Jika pengguna bertanya pertanyaan ambigu seperti "ini kenapa?", jangan menebak-nebak! Berikan pertanyaan follow-up yang sopan menanyakan apa pesan error, kendala, atau isu spesifik di layar pengguna.';
  } else if (currentPage && currentPage.startsWith('/admin')) {
    pageDesc = `Pengguna saat ini sedang membuka Halaman Portal Admin UKM CyberTech (${currentPage}).`;
  } else if (currentPage && currentPage !== '/') {
    pageDesc = `Pengguna saat ini sedang berada di halaman: ${currentPage}.`;
  }

  return `${SYSTEM_PROMPT}\n\n=======================================================\nKONTEKS HALAMAN AKTIF SEKARANG YANG DIBUKA PENGGUNA:\n${pageDesc}\n=======================================================`;
}

function resolveProvider(): 'groq' | 'gemini' | 'openai' | 'offline' {
  const explicit = (process.env.CYBERTECH_LLM_PROVIDER || '').trim().toLowerCase();

  if (explicit === 'groq' && (process.env.GROQ_API_KEY || process.env.CYBERTECH_GROQ_API_KEY)) return 'groq';
  if (explicit === 'gemini' && process.env.CYBERTECH_GEMINI_API_KEY) return 'gemini';
  if (explicit === 'openai' && process.env.CYBERTECH_OPENAI_API_KEY) return 'openai';

  // Automatic detection if not configured or key is available
  if (process.env.CYBERTECH_GEMINI_API_KEY) return 'gemini';
  if (process.env.GROQ_API_KEY || process.env.CYBERTECH_GROQ_API_KEY) return 'groq';
  if (process.env.CYBERTECH_OPENAI_API_KEY) return 'openai';

  return 'offline';
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Permintaan tidak valid.' }, { status: 400 });
  }

  const { messages, currentPage }: { messages: ChatMessage[]; currentPage?: string } = body || {};

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Daftar pesan tidak valid atau kosong.' }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1]?.content || '';

  // 1. Smart Safety Check (Jailbreak, Prompt Leak, Homework Joki)
  const safetyCheck = analyzeSafety(lastMessage);
  if (safetyCheck.isBlocked && safetyCheck.replyMessage) {
    return NextResponse.json({ content: safetyCheck.replyMessage });
  }

  // 2. Instant Deterministic Easter Egg Check
  if (isGantengQuestion(lastMessage)) {
    return NextResponse.json({ content: GANTENG_RESPONSE });
  }

  const systemPrompt = getDynamicSystemPrompt(currentPage);
  const provider = resolveProvider();

  if (provider === 'offline') {
    return NextResponse.json({ content: FALLBACK_OFFLINE_RESPONSE });
  }

  try {
    let content: string;
    if (provider === 'groq') {
      content = await callGroq(messages, systemPrompt);
    } else if (provider === 'gemini') {
      content = await callGemini(messages, systemPrompt);
    } else if (provider === 'openai') {
      content = await callOpenAI(messages, systemPrompt);
    } else {
      content = FALLBACK_OFFLINE_RESPONSE;
    }

    // Safety Net: sanitize any full code block output
    content = sanitizeCodeOutput(content);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('[ChatAPI] Provider call failed, returning friendly fallback:', error);
    // Return friendly 200 response instead of breaking with 500
    return NextResponse.json({ content: FALLBACK_OFFLINE_RESPONSE });
  }
}

/* -------------------------------------------------------
   GROQ API
------------------------------------------------------- */
async function callGroq(messages: ChatMessage[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY || process.env.CYBERTECH_GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  // Valid Groq chat model (llama-3.3-70b-versatile or llama-3.1-8b-instant)
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const recentMessages = messages.slice(-6);

  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(m => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 300,
    temperature: 0.5,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? FALLBACK_OFFLINE_RESPONSE;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* -------------------------------------------------------
   GEMINI (Google AI)
------------------------------------------------------- */
async function callGemini(messages: ChatMessage[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.CYBERTECH_GEMINI_API_KEY;
  if (!apiKey) throw new Error('CYBERTECH_GEMINI_API_KEY not set');

  const history = messages.slice(-6).slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [
      ...history,
      { role: 'user', parts: [{ text: lastMessage.content }] },
    ],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 300,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? FALLBACK_OFFLINE_RESPONSE;
  } finally {
    clearTimeout(timeoutId);
  }
}

/* -------------------------------------------------------
   OPENAI (GPT)
------------------------------------------------------- */
async function callOpenAI(messages: ChatMessage[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.CYBERTECH_OPENAI_API_KEY;
  if (!apiKey) throw new Error('CYBERTECH_OPENAI_API_KEY not set');

  const recentMessages = messages.slice(-6);

  const body = {
    model: process.env.CYBERTECH_OPENAI_MODEL ?? 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(m => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 300,
    temperature: 0.5,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? FALLBACK_OFFLINE_RESPONSE;
  } finally {
    clearTimeout(timeoutId);
  }
}
