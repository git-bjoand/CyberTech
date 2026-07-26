# ⚡ CyberTech PNP — Official Website v1.0

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-Llama_3.1-f05023?style=for-the-badge)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)]()

Official web portal of **UKM CyberTech Politeknik Negeri Padang (PNP)**. A high-end, modern, ultra-responsive web application crafted with Next.js App Router, custom Vanilla CSS design tokens, GPU-accelerated View Transitions, and an integrated AI Virtual Assistant powered by Groq Llama 3.1 8B Instant.

> *"Technology Can Unite Anything"* — UKM CyberTech PNP (Est. 14 Mei 2009)

---

## 🌟 Key Features

### 🎨 1. High-End Visual Design & Dark/Light Mode System
- **Strict Dark Mode Default**: Custom dark cyber palette (`#050d1a`) tailored for futuristic tech aesthetics.
- **GPU-Accelerated View Transitions API**: Theme toggle features a smooth **circular ripple animation (`clip-path: circle()`)** expanding outward directly from the user's mouse click coordinates at 60 FPS.
- **Micro-Animations**: Spring-loaded 180° icon rotation on theme buttons and interactive UI badges.

### 🤖 2. CytechAI — Virtual Assistant Chatbot
- **Powered by Groq LLM (`llama-3.1-8b-instant`)**: Ultra-fast (~1,000 tokens/sec) and token-efficient AI chatbot.
- **Deterministic Anti-Jailbreak Defense**: Built-in prompt injection pre-processor that detects exploit attempts and instantly responds with Surat Al-Baqarah Ayat 9.
- **Easter Eggs & Out-Of-Scope Filtering**: Responds to fun internal easter eggs and gracefully filters out off-topic requests.
- **Sleek Floating Input UI**: Custom rounded pill input area with neon focus rings and a custom slim cyan scrollbar.

### 🏛️ 3. Interactive Organizational Chart (Struktur DPH 2026/2027)
- **3-Tier Hierarchy Tree**: Visual tree showing Pembina, Pengurus Harian (DPH), and Kepala Departemen / Divisi.
- **Organic Avatar Expansion**: Hovering over DPH member cards organically expands the avatar circle into a large rounded image card while dynamically hiding text.
- **Drag-to-Scroll Canvas**: Smooth horizontal touch & drag scrolling designed for desktop and mobile viewports.

### 🚀 4. Division 3D Flip Cards & Portfolio Showcase
- **3D Card Flip Motion**: Interactive 3D flip animation showcasing **Programming**, **Networking**, and **Multimedia** divisions.
- **Portfolio & Gallery Bento Grid**: Categorized filter tabs (Web, Mobile, Security, Cloud, UI/UX) with lightbox image modals.

### 🌐 5. Instant Bilingual Support (ID / EN)
- One-click seamless language switcher across all sections, navigation links, and chatbot prompts.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI & Logic**: React 19, TypeScript
- **Styling**: Vanilla CSS Modules (Design Tokens, Glassmorphism, CSS Variables)
- **AI Integration**: Groq API (`llama-3.1-8b-instant`), Google Gemini, OpenAI Fallbacks
- **Animations**: CSS View Transitions API, Keyframe Animations, Canvas Particle Matrix

---

## 🚀 Quick Start

### 1. Prerequisites
Make sure you have Node.js 18.x or higher installed.

### 2. Clone Repository
```bash
git clone https://github.com/git-bjoand/CyberTech.git
cd CyberTech
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# AI LLM Provider Configuration ('groq' | 'gemini' | 'openai')
CYBERTECH_LLM_PROVIDER=groq

# Groq API Key (Get free key at console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant

# Optional Gemini Fallback
# CYBERTECH_GEMINI_API_KEY=your_gemini_key_here
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📁 Project Structure

```
cybertech/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Groq AI Chatbot API Endpoint with Jailbreak Defense
│   ├── globals.css               # Global CSS Variables, Tokens & View Transitions
│   ├── layout.tsx                # Root Layout with Theme & Language Providers
│   └── page.tsx                  # Single Page Landing Architecture
├── components/
│   ├── Navbar.tsx / .module.css  # Fixed Blur Header with Circular Ripple Theme Toggle
│   ├── Hero.tsx / .module.css    # Matrix Particle Canvas & Primary CTA
│   ├── About.tsx / .module.css   # Interactive Visi, Misi & History Tabs
│   ├── Division.tsx / .module.css# 3D Flip Specialty Cards
│   ├── Portfolio.tsx / .module.css# Filterable Project Showcase
│   ├── Events.tsx / .module.css  # UKM Timeline & Hackathon Highlights
│   ├── Structure.tsx / .module.css# DPH Organizational Chart & Organic Card Expand
│   ├── Gallery.tsx / .module.css # Bento Photo Grid & Lightbox
│   ├── Footer.tsx / .module.css  # Campus Contacts & Quick Links
│   └── Chatbot.tsx / .module.css # CytechAI Floating Widget & Custom Scrollbar
├── lib/
│   ├── context/                  # ThemeContext & LangContext Providers
│   └── data/                     # Organization Structure Data & Chatbot Config
└── public/
    └── images/                   # High-res Team & Division Assets
```

---

## 🧪 Build & Verification

To verify TypeScript types and build for production:

```bash
# Typecheck
npx tsc --noEmit

# Production Build
npm run build
```

---

## 🤝 Contributing & License

Developed with ❤️ for **UKM CyberTech Politeknik Negeri Padang**.

Distributed under the [MIT License](LICENSE).
