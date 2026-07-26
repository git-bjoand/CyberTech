'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLang } from '@/lib/context/LangContext';
import { portfolios, Division } from '@/lib/data/portfolio';
import styles from './Portfolio.module.css';

type Filter = 'all' | Division;

export default function Portfolio() {
  const { t } = useLang();
  const [filter, setFilter] = useState<Filter>('all');
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsClient(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleFilter = (f: Filter) => {
    setFilter(f);
  };

  const getDivisionIcon = (div: Division) => {
    switch (div) {
      case 'programming':
        return (
          <svg className={styles.placeholderIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'networking':
        return (
          <svg className={styles.placeholderIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      case 'multimedia':
        return (
          <svg className={styles.placeholderIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'partnership':
        return (
          <svg className={styles.placeholderIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section id="portfolio" ref={sectionRef} className={`${styles.portfolio} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.labelWrapper}>
            <span className={styles.label}>{t?.portfolio?.label || 'Portofolio'}</span>
            <span className={styles.countBadge}>
              {portfolios.filter((item) => filter === 'all' || item.division === filter).length} Proyek
            </span>
          </div>
          <h2 className={styles.title}>{t?.portfolio?.title || 'Karya & Proyek Kami'}</h2>
          <p className={styles.subtitle}>{t?.portfolio?.subtitle || 'Jelajahi berbagai proyek inovatif dari anggota CyberTech.'}</p>
        </div>

        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => handleFilter('all')}
          >
            {t?.portfolio?.filter?.all || 'Semua'}
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'programming' ? styles.active : ''}`}
            onClick={() => handleFilter('programming')}
          >
            {t?.portfolio?.filter?.programming || 'Programming'}
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'networking' ? styles.active : ''}`}
            onClick={() => handleFilter('networking')}
          >
            {t?.portfolio?.filter?.networking || 'Networking'}
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'multimedia' ? styles.active : ''}`}
            onClick={() => handleFilter('multimedia')}
          >
            {t?.portfolio?.filter?.multimedia || 'Multimedia'}
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'partnership' ? styles.active : ''}`}
            onClick={() => handleFilter('partnership')}
          >
            {t?.portfolio?.filter?.partnership || 'Partnership'}
          </button>
        </div>

        <div className={styles.grid}>
          {portfolios
            .filter((item) => filter === 'all' || item.division === filter)
            .map((item, index) => (
              <div 
                key={item.id} 
                className={`${styles.card} ${isVisible ? styles.cardRevealed : ''}`}
                style={{ transitionDelay: `${0.25 + index * 0.15}s` }}
              >
                <div className={styles.imageArea}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className={styles.image}
                    />
                  ) : (
                    <div className={styles.placeholderBox}>
                      {getDivisionIcon(item.division)}
                      <span className={styles.placeholderLabel}>{item.division}</span>
                    </div>
                  )}

                  {/* Image Hover CTA Overlay */}
                  <div className={styles.imageOverlay}>
                    <span className={styles.viewBtn}>
                      Lihat Proyek ↗
                    </span>
                  </div>

                  {/* Collaboration Badge (Only Shown for Partnerships/Collaborations) */}
                  {(item.isPartnership || item.division === 'partnership') && (
                    <span className={styles.partnerBadge}>
                      {item.partner ? `Partner: ${item.partner}` : 'Kolaborasi'}
                    </span>
                  )}
                </div>

                <div className={styles.content}>
                  <div className={styles.cardMeta}>
                    <span className={styles.yearTag}>{item.year}</span>
                  </div>

                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDesc}>{item.description}</p>

                  <div className={styles.tags}>
                    {item.tags.map((tag, i) => (
                      <span key={i} className={styles.tag}>#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
