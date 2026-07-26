# ⚡ CyberTech PNP — Web Portal Resmi v1.0

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-Llama_3.1-f05023?style=for-the-badge)](https://groq.com/)
[![Lisensi](https://img.shields.io/badge/Lisensi-MIT-green.style=for-the-badge)]()

Aplikasi web resmi **UKM CyberTech Politeknik Negeri Padang (PNP)**. Dibangun menggunakan Next.js App Router, desain visual Vanilla CSS futuristik, sistem transisi tema GPU-accelerated, serta Asisten AI Virtual pintar berbasis Groq Llama 3.1 8B Instant.

> 📖 **Ingin mengenal lebih dekat tentang UKM CyberTech PNP?**  
> Baca profil lengkap, divisi, pengurus, dan program kerja di file **[UKM_CYBERTECH.md](UKM_CYBERTECH.md)**.

> *"Technology Can Unite Anything"* — UKM CyberTech PNP (Berdiri 14 Mei 2009)

---

## 🌟 Fitur-Fitur Utama

### 🎨 1. Desain Visual Premium & Sistem Transisi Tema (*Dark/Light Mode*)
- **Default Dark Mode**: Menggunakan sistem warna cyber dark (`#050d1a`) khas organisasi teknologi modern.
- **Transisi Tema GPU-Accelerated (View Transitions API)**: Mengubah tema dengan efek **gelombang melingkar (*circular ripple*)** yang mengembang secara mulus (60 FPS) dari titik koordinat klik kursor mouse.
- **Mikro-Animasi**: Tombol ikon matahari/bulan berputar 180° (*spring rotation*) saat diklik atau di-hover.

### 🤖 2. CytechAI — Asisten Virtual Pintar
- **Ditenagai Groq LLM (`llama-3.1-8b-instant`)**: Respons instan (~1.000 token/detik) dan super hemat kuota.
- **Proteksi Anti-Jailbreak Deterministik**: Memicu balasan pengingat secara otomatis apabila ada upaya peretasan prompt (*prompt injection/jailbreak*).
- **Filter Topik**: Menolak pertanyaan di luar topik CyberTech/IT secara ramah.
- **UI Form Input Melayang**: Input berbentuk *floating pill* dengan pendaran neon cyan serta *custom slim scrollbar*.

### 🏛️ 3. Bagan Struktur Organisasi Interaktif (DPH 2026/2027)
- **Hierarki 3 Tingkat**: Menampilkan Pembina, Pengurus Harian (DPH), serta Kepala Departemen & Divisi.
- **Animasi Ekspansi Kartu DPH**: Saat kursor diarahkan (*hover*) ke kartu anggota DPH, foto profil bulat secara organik mengembang menjadi kartu persegi melengkung besar sambil menyembunyikan teks.
- **Container Drag-Scroll**: Dapat digeser secara mulus baik pada desktop maupun perangkat seluler.

### 🚀 4. Kartu 3D Flip Divisi & Portofolio Karya
- **Animasi Flip 3D Kartu Divisi**: Menampilkan detail divisi **Programming**, **Networking**, dan **Multimedia**.
- **Portofolio & Galeri Bento Grid**: Filter kategori proyek (Web, Mobile, Security, Cloud, UI/UX) lengkap dengan tampilan modal gambar.

### 🌐 5. Dukungan Dwi-Bahasa (*Bilingual ID/EN*)
- Sakelar bahasa satu-klik untuk mengubah seluruh navigasi, konten utama, dan balasan chatbot antara Bahasa Indonesia dan Bahasa Inggris.

---

## 🛠️ Teknologi yang Digunakan

- **Framework Utama**: Next.js 15 (App Router)
- **Bahasa & UI**: React 19, TypeScript
- **Styling**: Vanilla CSS Modules (Design Tokens, Glassmorphism, Variabel CSS)
- **Integrasi AI**: Groq API (`llama-3.1-8b-instant`), Google Gemini, OpenAI Fallbacks
- **Animasi**: CSS View Transitions API, Keyframe Animations, Canvas Particle Matrix

---

## 🚀 Panduan Memulai (*Quick Start*)

### 1. Prasyarat
Pastikan Node.js versi 18.x atau yang lebih baru sudah terinstal di komputer Anda.

### 2. Kloning Repository
```bash
git clone https://github.com/git-bjoand/CyberTech.git
cd CyberTech
```

### 3. Instalasi Dependency
```bash
npm install
```

### 4. Konfigurasi Variable Environment
Buat file `.env.local` pada folder root proyek:
```env
# Penyedia AI LLM ('groq' | 'gemini' | 'openai')
CYBERTECH_LLM_PROVIDER=groq

# Groq API Key (Dapatkan gratis di console.groq.com)
GROQ_API_KEY=gsk_masukkan_api_key_groq_anda_di_sini
GROQ_MODEL=llama-3.1-8b-instant
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda untuk melihat hasilnya.

---

## 📁 Struktur Folder Proyek

```
cybertech/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Endpoint Chatbot AI Groq & Proteksi Jailbreak
│   ├── globals.css               # Variabel CSS Global & View Transitions
│   ├── layout.tsx                # Root Layout (Provider Theme & Lang)
│   └── page.tsx                  # Halaman Utama (Landing Page Single Page)
├── components/
│   ├── Navbar.tsx / .module.css  # Header Melayang & Tombol Transisi Tema
│   ├── Hero.tsx / .module.css    # Animasi Canvas Particle & Tombol Daftar Tahap 2
│   ├── About.tsx / .module.css   # Tab Visi, Misi & Sejarah UKM
│   ├── Division.tsx / .module.css# Kartu Flip 3D Divisi Spesialisasi
│   ├── Portfolio.tsx / .module.css# Showcase Proyek Interaktif
│   ├── Events.tsx / .module.css  # Timeline Hackathon & Agenda Utama
│   ├── Structure.tsx / .module.css# Bagan Struktur DPH & Ekspansi Kartu Hover
│   ├── Gallery.tsx / .module.css # Bento Grid Foto & Lightbox Modal
│   ├── Footer.tsx / .module.css  # Kontak Kampus & Tautan Cepat
│   └── Chatbot.tsx / .module.css # Widget Chatbot AI CytechAI & Custom Scrollbar
├── lib/
│   ├── context/                  # Context Provider (Theme & Lang)
│   └── data/                     # Data Struktur Pengurus & Konfigurasi AI
├── UKM_CYBERTECH.md              # Profil Lengkap & Sejarah UKM CyberTech PNP
└── public/
    └── images/                   # Asset Foto & Logo Resmi CyberTech
```

---

## 🧪 Pengujian & Build Produksi

Untuk mengecek tipe TypeScript dan melakukan build produksi:

```bash
# Cek Tipe TypeScript
npx tsc --noEmit

# Build Produksi
npm run build
```

---

## 🤝 Lisensi & Hak Cipta

Dibuat dengan ❤️ untuk **UKM CyberTech Politeknik Negeri Padang**.

Lisensi di bawah [MIT License](LICENSE).
