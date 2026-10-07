'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './WorkshopGuide.module.css';

/* ------------------------------------------------------------------ *
 * Data
 * ------------------------------------------------------------------ */

type Tool = {
  num: string;
  name: string;
  fn: string;
  href: string;
  action: string;
  file: string;
  node?: boolean;
};

const TOOLS: Tool[] = [
  { num: '01', name: 'Akun GitHub', fn: 'Akun developer + pintu login tool lain', href: 'https://github.com/signup', action: 'Buka pendaftaran', file: '— (cukup bikin akun)' },
  { num: '02', name: 'Git', fn: 'Mencatat riwayat perubahan kode', href: 'https://git-scm.com/download/win', action: 'Unduh Git', file: 'Git-x.x.x-64-bit.exe' },
  { num: '03', name: 'Node.js 22 LTS', fn: 'Mesin untuk menjalankan JS & semua CLI di bawah', href: 'https://nodejs.org/en/download', action: 'Unduh Node.js', file: 'node-v22.x-x64.msi', node: true },
  { num: '04', name: 'VS Code', fn: 'Editor tempat menulis kode', href: 'https://code.visualstudio.com/download', action: 'Unduh VS Code', file: 'VSCodeUserSetup-x64.exe' },
  { num: '05', name: 'Docker Desktop + WSL 2', fn: 'Menjalankan aplikasi di dalam container (UTAMA)', href: 'https://www.docker.com/products/docker-desktop/', action: 'Unduh Docker', file: 'Docker Desktop Installer.exe' },
  { num: '06', name: 'Laragon', fn: 'Web server lokal pendamping (Apache/Nginx + MySQL + PHP)', href: 'https://laragon.org/download/', action: 'Unduh Laragon', file: 'laragon-wamp.exe (± 229 MB)' },
  { num: '07', name: '9Router', fn: 'Gateway token AI (proxy lokal)', href: 'https://www.npmjs.com/package/9router', action: 'Lihat paket', file: 'lewat npm (tidak unduh file)', node: true },
  { num: '08', name: 'OpenCode', fn: 'Agen koding AI di terminal', href: 'https://www.npmjs.com/package/opencode-ai', action: 'Lihat paket', file: 'lewat npm (tidak unduh file)', node: true },
  { num: '09', name: 'OpenSpec', fn: 'Menyusun spesifikasi agar kerja AI terstruktur', href: 'https://openspec.dev', action: 'Buka situs', file: 'lewat npm (tidak unduh file)', node: true },
  { num: '10', name: 'Akun Vercel', fn: 'Menerbitkan aplikasi ke internet', href: 'https://vercel.com/signup', action: 'Buka pendaftaran', file: '— (login via GitHub)' },
];

const NAV = [
  { id: 'alat', num: '—', label: 'Daftar Alat' },
  { id: 'fase0', num: '00', label: 'Akun' },
  { id: 'fase1', num: '01', label: 'Fondasi Lokal' },
  { id: 'fase2', num: '02', label: 'Server Lokal' },
  { id: 'fase3', num: '03', label: 'AI Tooling' },
  { id: 'fase4', num: '04', label: 'Verifikasi' },
  { id: 'checklist', num: '05', label: 'Checklist' },
  { id: 'gagal', num: '06', label: 'Kalau Gagal' },
  { id: 'rumah', num: '07', label: 'Rumah vs Ruangan' },
];

const CHECKLIST: React.ReactNode[] = [
  <>Akun <strong>GitHub</strong> dibuat &amp; email terverifikasi</>,
  <>Akun <strong>Vercel</strong> dibuat (login via GitHub)</>,
  <><strong>Git</strong> terpasang + <code className={styles.code}>git config</code> (nama &amp; email) sudah diisi</>,
  <><strong>Node.js 22 LTS</strong> terpasang → <code className={styles.code}>node -v</code> &amp; <code className={styles.code}>npm -v</code> keluar</>,
  <><strong>VS Code</strong> terpasang + 4 ekstensi (Tailwind, Prettier, Docker, ESLint)</>,
  <><strong>WSL 2</strong> aktif</>,
  <><strong>Docker Desktop</strong> jalan (paus hijau) + <code className={styles.code}>docker run hello-world</code> berhasil tanpa log error</>,
  <><strong>Laragon</strong> terpasang &amp; bisa dibuka (klik Start All → Apache/Nginx nyala)</>,
  <><strong>9Router</strong> terpasang → <code className={styles.code}>9router --version</code> keluar</>,
  <><strong>OpenCode</strong> terpasang → <code className={styles.code}>opencode --version</code> keluar</>,
  <><strong>OpenSpec</strong> terpasang → <code className={styles.code}>openspec --version</code> keluar</>,
  <>(Opsional) <strong>Vercel CLI</strong> terpasang</>,
];

const ERRORS: Array<[React.ReactNode, React.ReactNode]> = [
  [<><code className={styles.code}>node</code> / <code className={styles.code}>npm</code> &quot;is not recognized&quot;</>, 'Tutup & buka ulang terminal, atau restart laptop'],
  [<><code className={styles.code}>code</code> &quot;is not recognized&quot;</>, 'Pastikan centang Add to PATH saat install VS Code, lalu restart'],
  ['WSL gagal / minta BIOS', 'Aktifkan Virtualization di BIOS, atau tanya di grup WhatsApp / meja teknis saat hari-H'],
  ['Docker tidak mau jalan', 'Pastikan WSL 2 aktif dulu, baru Docker Desktop dijalankan'],
  ['Docker jalan tapi hello-world gagal', 'Restart Docker Desktop, atau restart laptop. Masih gagal → tanya grup WhatsApp (sebelum hari-H) / meja teknis'],
  [<><code className={styles.code}>npm install -g</code> error permission</>, 'Jalankan PowerShell sebagai Administrator'],
  [<><code className={styles.code}>npm install</code> error node-gyp / Python / MSBuild</>, <>Jalankan <code className={styles.code}>npm install --global windows-build-tools</code> (PowerShell Admin)</>],
  ['Paket tidak ketemu (404)', 'Cek ulang ejaan nama paket di situs resminya'],
  ['Unduhan lambat / macet', 'Ganti jaringan, atau lanjutkan langkah lain & coba lagi nanti'],
];

const SPLIT = [
  ['Instalasi semua alat', true, false],
  ['Bikin akun GitHub & Vercel', true, false],
  ['git config (nama & email)', true, false],
  ['Tes docker run hello-world', true, false],
  ['Verifikasi mandiri (health check)', true, false],
  ['Jalankan 9Router + API key', false, true],
  ['Sambungkan OpenCode → 9Router', false, true],
  ['OpenSpec hands-on', false, true],
  ['Deploy pertama ke Vercel', false, true],
] as const;

/* ------------------------------------------------------------------ *
 * Atoms
 * ------------------------------------------------------------------ */

function ActionButton({
  href,
  children,
  ghost = false,
}: {
  href: string;
  children: React.ReactNode;
  ghost?: boolean;
}) {
  return (
    <a
      className={`${styles.btn} ${ghost ? styles.btnGhost : styles.btnPrimary}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <span className={styles.btnArrow} aria-hidden="true">↗</span>
    </a>
  );
}

function Callout({
  tone,
  label,
  children,
}: {
  tone: 'info' | 'ok' | 'warn' | 'danger';
  label: string;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === 'ok'
      ? styles.calloutOk
      : tone === 'warn'
        ? styles.calloutWarn
        : tone === 'danger'
          ? styles.calloutDanger
          : styles.calloutInfo;

  return (
    <div className={`${styles.callout} ${toneClass}`}>
      <span className={styles.calloutLabel}>{label}</span>
      {children}
    </div>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeBlockHead}>
        <span className={styles.codeLabel}>{label}</span>
        <button
          type="button"
          className={`${styles.copyBtn} ${copied ? styles.copyDone : ''}`}
          onClick={copy}
        >
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </div>
      <pre className={styles.codePre}>{code}</pre>
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);
  return (
    <li>
      <button
        type="button"
        className={`${styles.checkItem} ${done ? styles.checkDone : ''}`}
        onClick={() => setDone((v) => !v)}
        aria-pressed={done}
      >
        <span className={styles.checkBox} aria-hidden="true">
          {done ? '✓' : ''}
        </span>
        <span className={styles.checkText}>{children}</span>
      </button>
    </li>
  );
}

function Step({
  num,
  name,
  action,
  hint,
  children,
}: {
  num: string;
  name: string;
  action?: { href: string; label: string };
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.step}>
      <div className={styles.stepHead}>
        <span className={styles.stepName}>
          <span className={styles.stepNum}>{num}</span>
          {name}
        </span>
        {action && <ActionButton href={action.href}>{action.label}</ActionButton>}
      </div>
      {hint && (
        <p className={styles.hint}>
          <span className={styles.hintLabel}>Cara unduh</span>
          <span className={styles.hintText}>{hint}</span>
        </p>
      )}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

export default function WorkshopGuide() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState('alat');

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      {/* ---------- Sticky bar ---------- */}
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link className={styles.brand} href="/">
            <span className={styles.brandMark}>&lt;/&gt;</span>
            <span className={styles.brandText}>
              <span className={styles.brandTitle}>Panduan Instalasi</span>
              <span className={styles.brandSub}>UKM Cybertech PNP</span>
            </span>
          </Link>
          <button type="button" className={styles.ghostBtn} onClick={() => window.print()}>
            Cetak / PDF
          </button>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ---------- Hero ---------- */}
      <header className={styles.hero}>
        <span className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroInner}>
          <span className={styles.badge}>
            <span className={styles.badgeTick} />
            Sesi 2 · Persiapan Tools &amp; Environment
          </span>
          <h1 className={styles.heroTitle}>
            Panduan Instalasi — <em>siapkan laptopmu di rumah</em>
          </h1>
          <p className={styles.heroLead}>
            Kerjakan panduan ini <strong>di rumah (H-3 s/d H-1)</strong>. Saat di ruangan, kita
            tidak menginstall lagi — kita hanya <strong>memverifikasi</strong> dan{' '}
            <strong>menyambungkan</strong>.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>10</div>
              <div className={styles.statLabel}>Alat wajib</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>5</div>
              <div className={styles.statLabel}>Fase</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>60–90</div>
              <div className={styles.statLabel}>Menit</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>Win 10/11</div>
              <div className={styles.statLabel}>Sistem</div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Layout ---------- */}
      <div className={styles.layout}>
        {/* Sidebar TOC (desktop) */}
        <aside className={styles.toc}>
          <div className={styles.tocSticky}>
            <div className={styles.tocTitle}>Isi Panduan</div>
            <nav className={styles.tocList}>
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`${styles.tocLink} ${active === item.id ? styles.tocActive : ''}`}
                >
                  <span className={styles.tocNum}>{item.num}</span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className={styles.content}>
          {/* Mobile TOC */}
          <nav className={styles.mobileToc}>
            <div className={styles.tocTitle} style={{ border: 'none', margin: 0, padding: 0 }}>
              Isi Panduan
            </div>
            <div className={styles.mobileTocList}>
              {NAV.map((item) => (
                <a key={item.id} href={`#${item.id}`} className={styles.mobileTocLink}>
                  <span>{item.num}</span>
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Baca dulu */}
          <Callout tone="warn" label="Baca ini dulu">
            <p>1. Panduan ini fokus ke <strong>instalasi alat</strong>. Di Sesi 2, pemateri akan menjelaskan <strong>kegunaan &amp; konsep</strong> tiap alat lewat presentasi. Konsep arsitektur mendalam dan cara pakai dijelaskan di sesi inti.</p>
            <p>2. <strong>Instalasi = di rumah. Menyambungkan = di ruangan.</strong> Bagian yang butuh API key dilakukan bersama di ruangan.</p>
            <p>3. Target kamu: semua alat <strong>terpasang</strong> dan <strong>bisa dijalankan</strong> (keluar nomor versi / jalan tanpa error).</p>
            <p>4. Kalau ada langkah yang gagal dan bingung → <strong>jangan buang waktu berjam-jam</strong>. Screenshot errornya, tanyakan di <strong>grup WhatsApp</strong> (dipantau TEKNISI), lalu lanjut ke langkah berikutnya.</p>
          </Callout>

          {/* ---------- Daftar alat ---------- */}
          <section id="alat" className={styles.phase}>
            <div className={styles.phaseHead}>
              <span className={styles.phaseIndex}>—</span>
              <div className={styles.phaseTitleWrap}>
                <p className={styles.phaseKicker}>Referensi</p>
                <h2 className={styles.phaseTitle}>Daftar Alat yang Wajib Dipasang</h2>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Alat</th>
                    <th>Fungsi</th>
                    <th>Berkas yang diunduh</th>
                    <th className={styles.center}>Sumber</th>
                  </tr>
                </thead>
                <tbody>
                  {TOOLS.map((t) => (
                    <tr key={t.num}>
                      <td><code className={styles.code}>{t.num}</code></td>
                      <td>
                        <strong>{t.name}</strong>
                        {t.node && <span className={styles.toolTag}> · butuh Node</span>}
                      </td>
                      <td>{t.fn}</td>
                      <td><span className={styles.fileName}>{t.file}</span></td>
                      <td className={styles.center}>
                        <ActionButton href={t.href} ghost>
                          {t.action}
                        </ActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Callout tone="info" label="Catatan">
              <p>Tool <strong>9Router, OpenCode, OpenSpec, Vercel CLI</strong> semuanya butuh <strong>Node.js</strong>. Jadi Node dipasang <strong>paling awal</strong>.</p>
            </Callout>
          </section>

          {/* ---------- Urutan ---------- */}
          <section className={styles.phase}>
            <div className={styles.phaseHead}>
              <span className={styles.phaseIndex}>↧</span>
              <div className={styles.phaseTitleWrap}>
                <p className={styles.phaseKicker}>Urutan</p>
                <h2 className={styles.phaseTitle}>Ikuti dari Atas ke Bawah</h2>
              </div>
            </div>
            <ul className={styles.list}>
              <li><strong>GitHub paling awal</strong> → emailnya dipakai buat <code className={styles.code}>git config</code> <strong>dan</strong> jadi pintu login Vercel.</li>
              <li><strong>Node sebelum semua CLI</strong> → 9Router, OpenCode, OpenSpec semuanya <code className={styles.code}>npm install</code>. Gak ada Node = gak ada apa-apa.</li>
              <li><strong>Docker di Fase 2</strong> → ini yang paling rawan (butuh WSL 2, restart, setting BIOS). Kalau macet, fondasi lain sudah aman.</li>
              <li><strong>Laragon menyusul setelah Docker</strong> → pemasangannya ringan, jadi kerjakan setelah bagian yang rawan beres.</li>
            </ul>
            <div className={styles.codeBlock}>
              <div className={styles.codeBlockHead}>
                <span className={styles.codeLabel}>Peta Perjalanan</span>
              </div>
              <pre className={styles.codePre}>{`FASE 0  AKUN          ->  GitHub, Vercel
FASE 1  FONDASI LOKAL ->  Git, Node.js 22, VS Code
FASE 2  SERVER LOKAL  ->  WSL 2, Docker Desktop, Laragon
FASE 3  AI TOOLING    ->  9Router, OpenCode, OpenSpec
FASE 4  VERIFIKASI    ->  health check`}</pre>
            </div>
          </section>

          {/* ---------- FASE 0 ---------- */}
          <section id="fase0" className={styles.phase}>
            <div className={styles.phaseHead}>
              <span className={styles.phaseIndex}>00</span>
              <div className={styles.phaseTitleWrap}>
                <p className={styles.phaseKicker}>Fase 0</p>
                <h2 className={styles.phaseTitle}>Akun</h2>
              </div>
            </div>

            <Step
              num="01"
              name="Akun GitHub"
              action={{ href: 'https://github.com/signup', label: 'Buka pendaftaran' }}
              hint={<>Tekan tombol di atas → halaman pendaftaran GitHub terbuka. Isi <strong>email</strong>, <strong>password</strong>, lalu <strong>username</strong>. Ini bukan unduh file — cukup bikin akun.</>}
            >
              <ol className={styles.list}>
                <li>Daftar pakai <strong>email aktif</strong>, lalu verifikasi lewat email.</li>
                <li><strong>Tips:</strong> pilih username yang profesional — ini bakal kelihatan orang lain (portofolio/CV).</li>
                <li>Simpan <strong>email</strong> dan <strong>password</strong>-nya. Email ini dipakai lagi di langkah <code className={styles.code}>git config</code>.</li>
              </ol>
            </Step>

            <Step
              num="02"
              name="Akun Vercel"
              action={{ href: 'https://vercel.com/signup', label: 'Buka pendaftaran' }}
              hint={<>Tekan tombol di atas → di halaman Vercel, tekan <strong>&quot;Continue with GitHub&quot;</strong>. Ini juga bukan unduh file — cukup bikin akun.</>}
            >
              <ol className={styles.list}>
                <li>Klik <strong>&quot;Continue with GitHub&quot;</strong> → login pakai akun GitHub tadi.</li>
                <li>Selesai. (Cukup punya akun; deploy-nya nanti di ruangan.)</li>
              </ol>
              <Callout tone="info" label="Info">
                <p>Karena Vercel login lewat GitHub, <strong>GitHub harus jadi dulu</strong>. Kalau GitHub belum jadi, Vercel gak bisa lanjut.</p>
              </Callout>
            </Step>
          </section>

          {/* ---------- FASE 1 ---------- */}
          <section id="fase1" className={styles.phase}>
            <div className={styles.phaseHead}>
              <span className={styles.phaseIndex}>01</span>
              <div className={styles.phaseTitleWrap}>
                <p className={styles.phaseKicker}>Fase 1</p>
                <h2 className={styles.phaseTitle}>Fondasi Lokal</h2>
              </div>
            </div>

            <Step
              num="03"
              name="Git"
              action={{ href: 'https://git-scm.com/download/win', label: 'Unduh Git' }}
              hint={<>Tekan tombol di atas → di halaman <strong>git-scm.com/download/win</strong>, unduhan <code className={styles.code}>Git-x.x.x-64-bit.exe</code> mulai otomatis. Kalau tidak, tekan tautan <strong>&quot;Click here to download&quot;</strong>.</>}
            >
              <p className={styles.body}><strong>Saat install:</strong> biarkan semua opsi <strong>default</strong>, klik Next sampai selesai.</p>
              <p className={styles.body}><strong>Setelah terpasang — buka PowerShell / CMD dan jalankan</strong> (ganti dengan nama &amp; email GitHub kamu):</p>
              <CodeBlock
                label="PowerShell"
                code={`git config --global user.name "Nama Lengkap Kamu"
git config --global user.email "email-yang-dipakai-di-github@gmail.com"
git --version`}
              />
              <Callout tone="ok" label="Berhasil kalau">
                <p><code className={styles.code}>git --version</code> menampilkan nomor versi (contoh: <code className={styles.code}>git version 2.4x.x</code>).</p>
              </Callout>
              <Callout tone="warn" label="Penting">
                <p>Dua baris <code className={styles.code}>git config</code> itu <strong>wajib</strong>. Kalau dilewat, semua catatan kode nanti akan tersimpan dengan nama yang salah.</p>
              </Callout>
            </Step>

            <Step
              num="04"
              name="Node.js 22 LTS"
              action={{ href: 'https://nodejs.org/en/download', label: 'Unduh Node.js' }}
              hint={<>Tekan tombol di atas → di halaman <strong>Node.js</strong>, buka <strong>menu versi</strong> dan pilih <strong>v22 LTS</strong>. Di bagian <strong>Windows Installer (.msi)</strong> tekan tautan <code className={styles.code}>node-v22.x-x64.msi</code> (Windows x64). File <strong>.msi</strong> itu penginstalnya.</>}
            >
              <Callout tone="info" label="Pilih versi v22 LTS">
                <p>Halaman unduhan Node.js menampilkan <strong>versi terbaru sebagai default</strong> (bisa v24). Workshop ini pakai <strong>v22 LTS</strong>, jadi buka <strong>menu versi</strong> di halaman itu dan pilih <strong>v22 LTS</strong> supaya kamu dapat versi yang sama dengan pemateri.</p>
              </Callout>
              <p className={styles.body}><strong>Saat install:</strong> klik Next sampai selesai, tapi baca peringatan di bawah dulu.</p>
              <Callout tone="danger" label="Saat install — tips krusial">
                <p><strong>JANGAN centang</strong> opsi <strong>&quot;Tools for Native Modules&quot;</strong> (atau &quot;Automatically install the necessary tools&quot;). Melewati ini menghemat unduhan <strong>3–5 GB</strong> yang bisa makan waktu berjam-jam.</p>
                <p><strong>Kenapa aman?</strong> Opsi itu cuma untuk meng-<em>compile</em> paket native (C/C++). Stack workshop ini (React + Node + Docker) umumnya <strong>tidak membutuhkannya</strong>.</p>
                <p><strong>Kalau nanti ternyata butuh</strong> (misal ada <code className={styles.code}>npm install</code> yang error soal node-gyp / Python / MSBuild), tidak perlu install ulang Node. Cukup buka <strong>PowerShell sebagai Administrator</strong> dan jalankan:</p>
                <CodeBlock label="PowerShell (Admin)" code="npm install --global windows-build-tools" />
              </Callout>
              <p className={styles.body}><strong>Setelah terpasang, cek:</strong></p>
              <CodeBlock label="PowerShell" code={`node -v\nnpm -v`} />
              <Callout tone="ok" label="Berhasil kalau">
                <p>Muncul <code className={styles.code}>v22.x.x</code> dan <code className={styles.code}>10.x.x</code> (atau angka versi apa pun).</p>
              </Callout>
              <Callout tone="info" label="Tips">
                <p>Kalau <code className={styles.code}>node -v</code> muncul <strong>&quot;is not recognized&quot;</strong> → tutup terminal, buka lagi (biar Windows memuat PATH terbaru). Kalau masih gagal, restart laptop.</p>
              </Callout>
            </Step>

            <Step
              num="05"
              name="VS Code"
              action={{ href: 'https://code.visualstudio.com/download', label: 'Unduh VS Code' }}
              hint={<>Tekan tombol di atas → di halaman <strong>code.visualstudio.com/download</strong>, di bagian <strong>Windows</strong> tekan tombol <strong>&quot;Windows&quot;</strong> (User Installer) → file <code className={styles.code}>VSCodeUserSetup-x64.exe</code> terunduh.</>}
            >
              <p className={styles.body}><strong>Saat install — WAJIB centang:</strong></p>
              <ul className={styles.list}>
                <li><strong>Add to PATH</strong></li>
                <li><strong>Open with Code</strong> (muncul di menu klik-kanan file/folder)</li>
              </ul>
              <p className={styles.body}><strong>Ekstensi yang perlu dipasang</strong> (buka VS Code → ikon Extensions / <code className={styles.code}>Ctrl+Shift+X</code>, cari &amp; Install):</p>
              <ul className={styles.list}>
                <li>Tailwind CSS IntelliSense</li>
                <li>Prettier - Code formatter</li>
                <li>Docker</li>
                <li>ESLint</li>
              </ul>
              <p className={styles.body}><strong>Cek di terminal:</strong></p>
              <CodeBlock label="PowerShell" code="code --version" />
              <Callout tone="ok" label="Berhasil kalau">
                <p>Muncul nomor versi VS Code.</p>
              </Callout>
            </Step>
          </section>

          {/* ---------- FASE 2 ---------- */}
          <section id="fase2" className={styles.phase}>
            <div className={styles.phaseHead}>
              <span className={styles.phaseIndex}>02</span>
              <div className={styles.phaseTitleWrap}>
                <p className={styles.phaseKicker}>Fase 2</p>
                <h2 className={styles.phaseTitle}>Server Lokal (Docker &amp; Laragon)</h2>
              </div>
            </div>
            <Callout tone="warn" label="Perhatian">
              <p>Bagian ini yang paling sering bikin masalah. Santai, ikuti perlahan.</p>
            </Callout>

            <Step num="06" name="Aktifkan WSL 2">
              <p className={styles.body}>Docker Desktop di Windows <strong>butuh WSL 2</strong>. Aktifkan lebih dulu:</p>
              <ol className={styles.list}>
                <li>Buka <strong>PowerShell sebagai Administrator</strong> (klik kanan → Run as administrator).</li>
                <li>Jalankan perintah di bawah.</li>
              </ol>
              <CodeBlock label="PowerShell (Admin)" code="wsl --install" />
              <p className={styles.body}><strong>Restart laptop</strong> kalau diminta.</p>
              <p className={styles.body}><strong>Prasyarat yang perlu dicek dulu (kalau WSL gagal):</strong></p>
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr><th>Cek</th><th>Cara</th><th>Target</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Versi Windows</td><td><code className={styles.code}>winver</code></td><td>Windows 10 21H2+ atau Windows 11</td></tr>
                    <tr><td>Virtualisasi BIOS</td><td>Task Manager → Performance → CPU</td><td><strong>Virtualization: Enabled</strong></td></tr>
                    <tr><td>Ruang disk C:</td><td>File Explorer</td><td>Sisa ≥ <strong>15–20 GB</strong></td></tr>
                  </tbody>
                </table>
              </div>
              <Callout tone="danger" label="Kalau Virtualization: Disabled">
                <p>Kamu perlu masuk BIOS dan mengaktifkan <strong>Intel VT-x / AMD-V</strong>. Kalau tidak berani, <strong>tanya dulu di grup WhatsApp</strong> (sebelum hari-H), atau bawa ke meja teknis saat hari-H.</p>
              </Callout>
            </Step>

            <Step
              num="07"
              name="Docker Desktop"
              action={{ href: 'https://www.docker.com/products/docker-desktop/', label: 'Unduh Docker' }}
              hint={<>Tekan tombol di atas → di halaman Docker Desktop, tekan <strong>&quot;Download for Windows – AMD64&quot;</strong> → file <code className={styles.code}>Docker Desktop Installer.exe</code> terunduh.</>}
            >
              <p className={styles.body}>Bisa juga cari <strong>Docker Desktop</strong> di Microsoft Store.</p>
              <p className={styles.body}><strong>Setelah terpasang:</strong></p>
              <ol className={styles.list}>
                <li>Jalankan Docker Desktop.</li>
                <li>Tunggu sampai ikon <strong>paus di kiri bawah berwarna HIJAU</strong> (artinya engine sudah jalan).</li>
                <li>Cek di terminal.</li>
              </ol>
              <CodeBlock label="PowerShell" code={`docker --version\ndocker compose version`} />
              <p className={styles.body}><strong>Tes sesungguhnya (jangan skip):</strong></p>
              <CodeBlock label="PowerShell" code="docker run hello-world" />
              <Callout tone="ok" label="Berhasil kalau">
                <p>Muncul tulisan <strong>&quot;Hello from Docker!&quot;</strong>, tanpa log error.</p>
              </Callout>
              <Callout tone="info" label="Inilah batas setup Docker kamu">
                <p>Sukses = Docker bisa <strong>menarik (pull) sebuah image</strong> dan <strong>menjalankannya tanpa error</strong>. <code className={styles.code}>hello-world</code> dipakai sebagai contoh image kecil. Kalau ini jalan, artinya Docker kamu sudah siap untuk image apa pun di sesi inti.</p>
                <p>Ikon paus hijau <strong>belum cukup</strong> — kadang engine nyala tapi WSL rusak. Perintah <code className={styles.code}>hello-world</code> di atas adalah bukti Docker benar-benar bisa menjalankan container.</p>
              </Callout>
              <p className={styles.body}><strong>Cek akhir Docker (tutup sesi Docker sampai di sini):</strong></p>
              <ul className={styles.list}>
                <li><code className={styles.code}>docker --version</code> &amp; <code className={styles.code}>docker compose version</code> keluar nomor versi</li>
                <li>Ikon paus <strong>HIJAU</strong></li>
                <li><code className={styles.code}>docker run hello-world</code> → muncul <strong>&quot;Hello from Docker!&quot;</strong> tanpa log error</li>
              </ul>
              <Callout tone="warn" label="Cukup sampai di sini">
                <p>Cara membuat <code className={styles.code}>Dockerfile</code>, <code className={styles.code}>docker compose</code>, build, dan deploy akan dipandu pemateri di sesi inti. Tugas kamu hanya memastikan Docker <strong>terpasang, bisa pull image, dan menjalankannya tanpa error</strong>.</p>
              </Callout>
              <Callout tone="info" label="Catatan">
                <p>Di sesi inti, aplikasi dijalankan lewat <code className={styles.code}>docker compose</code> yang menarik beberapa image sekaligus (database + frontend + backend). Karena itu <strong>wajib dicoba di rumah</strong> — supaya pas di ruangan tidak ikut mengunduh besar-besaran lewat wifi. Daftar image yang perlu disiapkan akan dibagikan panitia.</p>
              </Callout>
            </Step>

            <Step
              num="08"
              name="Laragon"
              action={{ href: 'https://laragon.org/download/', label: 'Unduh Laragon' }}
              hint={<>Tekan tombol di atas → di halaman <strong>laragon.org/download</strong>, tekan tombol <strong>&quot;Download Laragon v8.7.0 - Full (229 MB)&quot;</strong> → file <code className={styles.code}>laragon-wamp.exe</code> terunduh.</>}
            >
              <Callout tone="info" label="Posisinya di workshop ini">
                <p><strong>Docker tetap yang utama.</strong> Laragon di sini dipasang sebagai <strong>pendamping</strong> — supaya kamu punya web server lokal (Apache/Nginx) + MySQL yang bisa langsung dipakai tanpa container. Kalau di sesi inti pakai Docker, Laragon tidak mengganggu.</p>
              </Callout>
              <p className={styles.body}><strong>Saat install:</strong> buka <code className={styles.code}>laragon-wamp.exe</code>, biarkan opsi <strong>default</strong>, klik Next sampai selesai.</p>
              <p className={styles.body}><strong>Setelah terpasang:</strong></p>
              <ol className={styles.list}>
                <li>Buka <strong>Laragon</strong> dari Start Menu.</li>
                <li>Klik tombol <strong>&quot;Start All&quot;</strong> (di kanan bawah jendela Laragon).</li>
                <li>Tunggu sampai layanan <strong>Apache/Nginx</strong> &amp; <strong>MySQL</strong> berstatus jalan (indikator hijau).</li>
                <li>Uji cepat: klik kanan di area kosong → <strong>Web</strong>, atau buka <code className={styles.code}>http://localhost</code> di browser.</li>
              </ol>
              <Callout tone="warn" label="Jangan pakai Node bawaan Laragon">
                <p>Laragon <strong>Full</strong> ikut membawa Node.js versi sendiri. Untuk workshop ini <strong>tetap pakai Node.js 22</strong> dari installer resmi (langkah 04). <strong>Jangan</strong> tambahkan Node bawaan Laragon ke PATH, supaya <code className={styles.code}>node -v</code> tetap menunjuk ke Node 22 workshop. Kalau butuh menaruh Laragon di PATH, aktifkan hanya untuk PHP/Git.</p>
              </Callout>
              <Callout tone="ok" label="Berhasil kalau">
                <p>Laragon terbuka, tombol <strong>Start All</strong> ditekan, dan Apache/Nginx + MySQL <strong>nyala tanpa error</strong> (bisa buka <code className={styles.code}>http://localhost</code>).</p>
              </Callout>
            </Step>
          </section>

          {/* ---------- FASE 3 ---------- */}
          <section id="fase3" className={styles.phase}>
            <div className={styles.phaseHead}>
              <span className={styles.phaseIndex}>03</span>
              <div className={styles.phaseTitleWrap}>
                <p className={styles.phaseKicker}>Fase 3</p>
                <h2 className={styles.phaseTitle}>AI Tooling (butuh Node.js dari Fase 1)</h2>
              </div>
            </div>
            <Callout tone="info" label="Info">
              <p>Semua perintah di bawah dijalankan di <strong>PowerShell / CMD</strong>. Kalau <code className={styles.code}>npm</code> belum dikenali → balik ke langkah Node (No. 04).</p>
            </Callout>

            <Step
              num="09"
              name="9Router"
              action={{ href: 'https://www.npmjs.com/package/9router', label: 'Lihat paket' }}
              hint={<>9Router <strong>tidak punya file installer</strong>. Pemasangannya lewat <code className={styles.code}>npm</code> — jalankan perintah di bawah di PowerShell. Tombol di atas hanya untuk melihat info paketnya.</>}
            >
              <CodeBlock label="PowerShell" code={`npm install -g 9router\n9router --version`} />
              <Callout tone="ok" label="Berhasil kalau">
                <p>Muncul nomor versi.</p>
              </Callout>
              <Callout tone="info" label="Catatan">
                <p>Menjalankan + memasukkan API key dilakukan <strong>di ruangan</strong> (dipandu panitia).</p>
              </Callout>
            </Step>

            <Step
              num="10"
              name="OpenCode"
              action={{ href: 'https://www.npmjs.com/package/opencode-ai', label: 'Lihat paket' }}
              hint={<>Sama seperti 9Router — <strong>tidak ada file installer</strong>. Pasang lewat <code className={styles.code}>npm</code> dengan perintah di bawah.</>}
            >
              <CodeBlock label="PowerShell" code={`npm install -g opencode-ai\nopencode --version`} />
              <Callout tone="ok" label="Berhasil kalau">
                <p>Muncul nomor versi.</p>
              </Callout>
              <Callout tone="info" label="Catatan">
                <p>Menyambungkan OpenCode ke 9Router dilakukan <strong>di ruangan</strong>.</p>
              </Callout>
            </Step>

            <Step
              num="11"
              name="OpenSpec"
              action={{ href: 'https://openspec.dev', label: 'Buka situs' }}
              hint={<>OpenSpec <strong>tidak ada file installer</strong>. Pasang lewat <code className={styles.code}>npm</code> dengan perintah di bawah.</>}
            >
              <CodeBlock label="PowerShell" code={`npm install -g @fission-ai/openspec\nopenspec --version`} />
              <Callout tone="ok" label="Berhasil kalau">
                <p>Muncul nomor versi.</p>
              </Callout>
              <Callout tone="info" label="Info">
                <p>Nama paket resminya <code className={styles.code}>@fission-ai/openspec</code> (terverifikasi di npm). Kalau <code className={styles.code}>npm</code> bilang &quot;404 / package not found&quot;, pastikan ejaannya persis seperti di atas.</p>
              </Callout>
            </Step>

            <Step
              num="12"
              name="(Opsional) Vercel CLI"
              action={{ href: 'https://www.npmjs.com/package/vercel', label: 'Lihat paket' }}
              hint={<>Vercel CLI <strong>tidak ada file installer</strong>. Pasang lewat <code className={styles.code}>npm</code> dengan perintah di bawah.</>}
            >
              <p className={styles.body}>Kalau mau deploy dari terminal (kalau tidak, versi web sudah cukup):</p>
              <CodeBlock label="PowerShell" code={`npm install -g vercel\nvercel --version`} />
            </Step>
          </section>

          {/* ---------- FASE 4 ---------- */}
          <section id="fase4" className={styles.phase}>
            <div className={styles.phaseHead}>
              <span className={styles.phaseIndex}>04</span>
              <div className={styles.phaseTitleWrap}>
                <p className={styles.phaseKicker}>Fase 4</p>
                <h2 className={styles.phaseTitle}>Verifikasi</h2>
              </div>
            </div>
            <p className={styles.body}>Jalankan <strong>satu blok</strong> ini di PowerShell. Kalau semua mengeluarkan nomor versi, kamu <strong>SIAP</strong>.</p>
            <CodeBlock
              label="PowerShell"
              code={`node -v ; npm -v ; git --version ; code --version
docker --version ; docker compose version
9router --version ; opencode --version ; openspec --version`}
            />
            <Callout tone="ok" label="Target keberhasilan">
              <p>Semua baris menampilkan <strong>nomor versi</strong>, tanpa pesan <strong>&quot;is not recognized&quot;</strong>.</p>
            </Callout>
          </section>

          {/* ---------- Checklist ---------- */}
          <section id="checklist" className={styles.phase}>
            <div className={styles.phaseHead}>
              <span className={styles.phaseIndex}>05</span>
              <div className={styles.phaseTitleWrap}>
                <p className={styles.phaseKicker}>Sebelum Hari-H</p>
                <h2 className={styles.phaseTitle}>Checklist Akhir</h2>
              </div>
            </div>
            <ul className={styles.checklist}>
              {CHECKLIST.map((item, i) => (
                <CheckItem key={i}>{item}</CheckItem>
              ))}
            </ul>
          </section>

          {/* ---------- Troubleshooting ---------- */}
          <section id="gagal" className={styles.phase}>
            <div className={styles.phaseHead}>
              <span className={styles.phaseIndex}>06</span>
              <div className={styles.phaseTitleWrap}>
                <p className={styles.phaseKicker}>Troubleshooting</p>
                <h2 className={styles.phaseTitle}>Kalau Ada yang Gagal</h2>
              </div>
            </div>
            <p className={styles.body}><strong>Jangan panik, dan jangan buang waktu berjam-jam.</strong> Ikuti aturan ini:</p>
            <ol className={styles.list}>
              <li><strong>Screenshot</strong> pesan errornya.</li>
              <li><strong>Catat</strong> di tool mana kamu gagal.</li>
              <li><strong>Lapor ke grup WhatsApp</strong> kalau error terjadi <strong>sebelum hari-H</strong> — kirim screenshot + nama tool-nya, tunggu balasan TEKNISI.</li>
              <li><strong>Lanjut</strong> ke langkah berikutnya yang masih bisa dikerjakan.</li>
              <li>Bawa laptopmu ke <strong>meja teknis</strong> saat hari-H (jam bantuan akan diumumkan).</li>
            </ol>
            <Callout tone="info" label="Sebelum hari-H? Tanya di grup WhatsApp">
              <p>Error yang muncul saat kamu menyiapkan di rumah <strong>boleh — dan sebaiknya — ditanyakan langsung ke TEKNISI di grup WhatsApp</strong>. Jangan ditahan sampai hari-H. Sertakan <strong>screenshot + nama tool</strong> biar cepat dibantu.</p>
            </Callout>
            <p className={styles.body}><strong>Error yang paling sering muncul:</strong></p>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr><th>Gejala</th><th>Solusi cepat</th></tr>
                </thead>
                <tbody>
                  {ERRORS.map(([sym, fix], i) => (
                    <tr key={i}>
                      <td>{sym}</td>
                      <td>{fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Callout tone="warn" label="Aturan penting">
              <p>Kalau satu langkah gagal, <strong>jangan buang waktu berjam-jam di situ</strong>. <strong>Error sebelum hari-H → tanya di grup WhatsApp</strong> (sertakan screenshot + nama tool). Saat hari-H, bawa laptop ke <strong>meja teknis</strong>. Satu laptop yang nyangkut jangan sampai menghabiskan waktumu.</p>
            </Callout>
          </section>

          {/* ---------- Rumah vs Ruangan ---------- */}
          <section id="rumah" className={styles.phase}>
            <div className={styles.phaseHead}>
              <span className={styles.phaseIndex}>07</span>
              <div className={styles.phaseTitleWrap}>
                <p className={styles.phaseKicker}>Pembagian Tugas</p>
                <h2 className={styles.phaseTitle}>Rumah vs Ruangan</h2>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Kegiatan</th>
                    <th className={styles.center}>Rumah</th>
                    <th className={styles.center}>Ruangan</th>
                  </tr>
                </thead>
                <tbody>
                  {SPLIT.map(([label, home, room], i) => (
                    <tr key={i}>
                      <td>{label}</td>
                      <td className={`${styles.center} ${home ? styles.yes : ''}`}>{home ? 'Ya' : ''}</td>
                      <td className={`${styles.center} ${room ? styles.yes : ''}`}>{room ? 'Ya' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Callout tone="warn" label="Penting">
              <p><strong>API key AI disiapkan oleh panitia</strong> dan dibagikan <strong>di ruangan</strong>. Jangan pernah menampilkan atau menyimpan API key di tempat publik.</p>
            </Callout>
          </section>

          <p className={styles.endNote}>
            Selamat menyiapkan! Sampai jumpa di hari-H dengan laptop yang siap tempur.
          </p>
        </article>
      </div>
    </div>
  );
}
