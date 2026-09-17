'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/context/ThemeContext';
import styles from './AdminLayout.module.css';
import {
  ChartBar,
  ClipboardText,
  TreeStructure,
  Article,
  UsersThree,
  Sun,
  Moon,
  List,
  X,
  SignOut,
  ArrowSquareOut,
} from '@phosphor-icons/react';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const navItems = [
  { href: '/admin', label: 'Overview', icon: <ChartBar size={18} weight="duotone" /> },
  { href: '/admin/pendaftaran', label: 'Data Pendaftaran', icon: <ClipboardText size={18} weight="duotone" /> },
  { href: '/admin/struktur', label: 'Struktur DPH & Org', icon: <TreeStructure size={18} weight="duotone" /> },
  { href: '/admin/konten', label: 'Konten Landing', icon: <Article size={18} weight="duotone" /> },
  { href: '/admin/akun', label: 'Kelola Akun Admin', icon: <UsersThree size={18} weight="duotone" /> },
];

export default function AdminLayout({ children, pageTitle }: AdminLayoutProps) {
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; fullName: string; role: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const sessionStr = sessionStorage.getItem('cybertech_admin_user');
    if (sessionStr) {
      try {
        const u = JSON.parse(sessionStr);
        if (u && u.username) {
          setCurrentUser(u);
          setIsAuthenticated(true);
        }
      } catch (e) {}
    }

    const checkSession = async () => {
      try {
        const token = sessionStorage.getItem('cybertech_admin_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Verify session against server (cookie or Bearer token)
        const res = await fetch('/api/admin/verify-session', {
          method: 'GET',
          headers,
        });
        const data = await res.json();

        if (res.ok && data.success && data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          sessionStorage.setItem('cybertech_admin_user', JSON.stringify(data.user));
        } else if (res.status === 401) {
          // Account deleted or session expired
          sessionStorage.removeItem('cybertech_admin_user');
          sessionStorage.removeItem('cybertech_admin_token');
          sessionStorage.removeItem('cybertech_admin_secret');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } catch (e) {
        // Network error - keep current state if valid user present
      }
    };

    checkSession();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        sessionStorage.setItem('cybertech_admin_user', JSON.stringify(data.user));
        if (data.token) {
          sessionStorage.setItem('cybertech_admin_token', data.token);
        }
        setErrorMsg(null);
      } else {
        setErrorMsg(data.error || 'Username atau Password Administrator salah.');
        setIsAuthenticated(false);
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {}

    sessionStorage.removeItem('cybertech_admin_user');
    sessionStorage.removeItem('cybertech_admin_token');
    sessionStorage.removeItem('cybertech_admin_secret');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
    setErrorMsg(null);
  };

  if (!isMounted) {
    return (
      <div className={styles.adminContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>
          Memuat Admin Portal...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.adminContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem' }}>
        <div className={styles.authContainer} style={{ position: 'relative', width: '100%', maxWidth: '420px', margin: '0 auto', textAlign: 'center' }}>
          {/* Top-Right Theme Toggle */}
          <button
            type="button"
            onClick={(e) => toggleTheme(e)}
            className={styles.themeToggleBtn}
            title="Ganti Mode Tampilan"
            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={16} weight="bold" /> Mode Terang
              </>
            ) : (
              <>
                <Moon size={16} weight="bold" /> Mode Gelap
              </>
            )}
          </button>

          {/* Centered Large CyberTech Logo & Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', paddingTop: '0.5rem' }}>
            <div className={styles.authLogoWrap}>
              <Image src="/images/primary/cyberlogo.png" alt="Logo UKM CyberTech" width={64} height={64} priority style={{ objectFit: 'contain' }} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '1rem', marginBottom: '0.25rem' }}>
              UKM CYBERTECH PNP
            </div>
            <h1 className={styles.authTitle} style={{ textAlign: 'center', margin: '0 0 0.4rem 0' }}>Login Admin Portal</h1>
            <p className={styles.authDesc} style={{ textAlign: 'center', margin: 0, maxWidth: '320px' }}>
              Masukkan Username & Password Administrator untuk mengakses dashboard.
            </p>
          </div>

          {errorMsg && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem', textAlign: 'left' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label className={styles.inputLabel}>Username Admin</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Masukkan Username Admin"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className={styles.inputLabel}>Password Admin</label>
              <input
                type="password"
                className={styles.inputField}
                placeholder="Masukkan Password Admin"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={isLoggingIn} className={styles.authBtn}>
              {isLoggingIn ? 'Memproses Login...' : 'Masuk Portal Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Mobile Top Header (< 768px) */}
      <header className={styles.mobileHeader}>
        <div className={styles.brandWrap}>
          <Image src="/images/primary/cyberlogo.png" alt="Logo" width={26} height={26} className={styles.brandLogo} />
          <span className={styles.brandTitle}>CyberTech</span>
          <span className={styles.brandTag}>ADMIN</span>
        </div>
        <button
          className={styles.menuBtn}
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Buka Menu Navigation"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <List size={22} weight="bold" />
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setMobileDrawerOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div>
              <div className={styles.drawerHeader}>
                <div className={styles.brandWrap}>
                  <Image src="/images/primary/cyberlogo.png" alt="Logo" width={24} height={24} />
                  <span className={styles.brandTitle}>Navigasi Admin</span>
                </div>
                <button className={styles.closeBtn} onClick={() => setMobileDrawerOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={20} weight="bold" />
                </button>
              </div>

              <div className={styles.navSectionTitle}>Menu Utama</div>
              <ul className={styles.navList}>
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`${styles.navItemLink} ${isActive ? styles.navItemActive : ''}`}
                        onClick={() => setMobileDrawerOpen(false)}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--admin-border, #1e293b)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={(e) => toggleTheme(e)}
                className={styles.themeToggleBtn}
                style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={16} weight="bold" /> Mode Terang
                  </>
                ) : (
                  <>
                    <Moon size={16} weight="bold" /> Mode Gelap
                  </>
                )}
              </button>

              {currentUser && (
                <div className={styles.userBadge}>
                  <div className={styles.userFullName}>{currentUser.fullName}</div>
                  <div className={styles.userRole}>@{currentUser.username} • ({currentUser.role})</div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className={styles.logoutBtn}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <SignOut size={16} weight="bold" /> Keluar (Logout)
              </button>

              <Link href="/" className={styles.linkSubtle}>
                ← Kembali ke Website Public
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop & Main Layout Body */}
      <div className={styles.bodyWrapper}>
        {/* Desktop Sidebar (>= 768px) */}
        <aside className={styles.sidebar}>
          <div>
            <div className={styles.brandWrap} style={{ marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border, #1e293b)' }}>
              <Image src="/images/primary/cyberlogo.png" alt="Logo" width={30} height={30} />
              <div>
                <div className={styles.brandTitle} style={{ fontSize: '1.05rem' }}>CYBERTECH</div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>ADMIN PORTAL</div>
              </div>
            </div>

            <div className={styles.navSectionTitle}>Manajemen Data</div>
            <ul className={styles.navList}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={`${styles.navItemLink} ${isActive ? styles.navItemActive : ''}`}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--admin-border, #1e293b)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={(e) => toggleTheme(e)}
              className={styles.themeToggleBtn}
              style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={16} weight="bold" /> Mode Terang
                </>
              ) : (
                <>
                  <Moon size={16} weight="bold" /> Mode Gelap
                </>
              )}
            </button>

            {currentUser && (
              <div className={styles.userBadge}>
                <div className={styles.userFullName}>{currentUser.fullName}</div>
                <div className={styles.userRole}>@{currentUser.username} • ({currentUser.role})</div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className={styles.logoutBtn}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <SignOut size={16} weight="bold" /> Keluar (Logout)
            </button>

            <Link href="/" className={styles.linkSubtle} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowSquareOut size={16} /> Lihat Website Utama
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
