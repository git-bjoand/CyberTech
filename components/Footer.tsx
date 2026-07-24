'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/lib/context/LangContext';
import styles from './Footer.module.css';

const NAV_LINKS = [
  { href: '#home', key: 'home' },
  { href: '#about', key: 'about' },
  { href: '#division', key: 'division' },
  { href: '#portfolio', key: 'portfolio' },
  { href: '#events', key: 'events' },
  { href: '#structure', key: 'structure' },
  { href: '#gallery', key: 'gallery' },
] as const;

export default function Footer() {
  const { t } = useLang();
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer ref={footerRef} className={`${styles.footer} ${isVisible ? styles.visible : ''}`}>
      {/* Top divider glow */}
      <div className={styles.topGlow} />

      <div className={`container ${styles.inner}`}>
        {/* Brand column */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Image
              src="/images/primary/cyberlogo.png"
              alt="CyberTech Logo"
              width={44}
              height={44}
              style={{ objectFit: 'contain' }}
            />
            <span className={styles.logoText}>CYBERTECH</span>
          </div>
          <p className={styles.tagline}>{t.footer.tagline}</p>
          <p className={styles.desc}>{t.footer.desc}</p>

          {/* Social links */}
          <div className={styles.socials}>
            <a
              href="https://www.instagram.com/cybertech_pnp"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@cybertechpnp"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialBtn}
              aria-label="YouTube"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a
              href="mailto:cybertechpnpofficial@gmail.com"
              className={styles.socialBtn}
              aria-label="Email"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Links column */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>{t.footer.links}</h4>
          <ul className={styles.linkList}>
            {NAV_LINKS.map(({ href, key }) => (
              <li key={key}>
                <button
                  onClick={() => scrollTo(href)}
                  className={styles.footerLink}
                >
                  {t.nav[key as keyof typeof t.nav]}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact column */}
        <div className={styles.contactCol}>
          <h4 className={styles.colTitle}>{t.footer.contact}</h4>
          <div className={styles.contactList}>
            <div className={styles.contactItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <a href="mailto:cybertechpnpofficial@gmail.com" className={styles.contactLink}>
                cybertechpnpofficial@gmail.com
              </a>
            </div>
            <div className={styles.contactItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <a href="https://www.instagram.com/cybertech_pnp" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                @cybertech_pnp
              </a>
            </div>
            <div className={styles.contactItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <a href="https://youtube.com/@cybertechpnp" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                cybertech pnp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className="container">
          <p className={styles.copyright}>{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
