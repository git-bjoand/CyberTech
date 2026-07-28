'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Navbar.module.css';
import { useLang } from '@/lib/context/LangContext';
import { useTheme } from '@/lib/context/ThemeContext';

const SunIcon = () => (
  <svg className={styles.themeIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg className={styles.themeIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const navLinks = [
  { id: 'home', label: { en: 'Home', id: 'Beranda' } },
  { id: 'about', label: { en: 'About', id: 'Tentang' } },
  { id: 'division', label: { en: 'Division', id: 'Divisi' } },
  { id: 'portfolio', label: { en: 'Portfolio', id: 'Portofolio' } },
  { id: 'events', label: { en: 'Events', id: 'Acara' } },
  { id: 'structure', label: { en: 'Structure', id: 'Struktur' } },
  { id: 'gallery', label: { en: 'Gallery', id: 'Galeri' } },
];

export default function Navbar() {
  const { lang, setLang } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;

      // Scrolled state
      if (totalScroll > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Active section
      const sections = navLinks.map(link => document.getElementById(link.id));
      let current = '';
      sections.forEach((section) => {
        if (section) {
          const sectionTop = section.offsetTop;
          if (totalScroll >= sectionTop - 100) {
            current = section.getAttribute('id') || '';
          }
        }
      });
      if (current !== activeSection) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 68,
        behavior: 'smooth',
      });
    }
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'id' : 'en');
  };

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.logo} onClick={() => scrollToSection('home')}>
            <Image 
              src="/images/primary/cyberlogo.png" 
              alt="CyberTech Logo" 
              width={36} 
              height={36} 
              className={styles.logoImage} 
            />
            <span className={styles.brandText}>CYBERTECH</span>
          </div>
        </div>

        <nav className={`${styles.center} ${menuOpen ? styles.open : ''}`}>
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  className={`${styles.navLink} ${activeSection === link.id ? styles.active : ''}`}
                  onClick={() => scrollToSection(link.id)}
                >
                  {link.label[lang as keyof typeof link.label]}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.right}>
          <button 
            className={styles.themeToggleBtn} 
            onClick={(e) => toggleTheme(e)} 
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className={styles.iconBtn} onClick={toggleLang} aria-label="Toggle Language">
            {lang === 'en' ? 'EN' : 'ID'}
          </button>
          <button className={styles.joinBtn}>
            {lang === 'en' ? 'Join Us' : 'Gabung'}
          </button>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Tutup Menu Navigation' : 'Buka Menu Navigation'}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
