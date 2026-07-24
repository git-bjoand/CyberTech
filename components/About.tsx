'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './About.module.css';
import { useLang } from '@/lib/context/LangContext';

export default function About() {
  const { lang } = useLang();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
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

  const missions = [
    { en: 'Form independent individuals who master information technology at Politeknik Negeri Padang', id: 'Membentuk pribadi mandiri yang menguasai teknologi informasi di Politeknik Negeri Padang' },
    { en: 'Serve as a medium for planning, organizing, and executing information technology activities at Politeknik Negeri Padang', id: 'Sebagai wadah kegiatan perencanaan, pengorganisasian dan pelaksanaan kegiatan teknologi informasi di Politeknik Negeri Padang' },
    { en: 'Cultivate work professionalism', id: 'Membudayakan profesionalisme kerja' },
    { en: 'Enhance the intellectual capacity of the academic community in the field of IT', id: 'Meningkatkan intelektual civitas akademika di bidang teknologi informasi' },
    { en: 'Be the driving engine of information technology at Politeknik Negeri Padang', id: 'Menjadi motor penggerak teknologi informasi di Politeknik Negeri Padang' },
    { en: 'Foster a sense of ownership in the academic community towards technology advancement', id: 'Menumbuhkan rasa memiliki pada civitas akademika terhadap perkembangan teknologi' },
  ];

  return (
    <section id="about" ref={sectionRef} className={`${styles.about} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.container}>
        {/* Top Header */}
        <div className={styles.topHeader}>
          <span className={styles.smallBadge}>THE FOUNDATION</span>
          <h2 className={styles.mainTitle}>About Us</h2>
        </div>

        {/* Top 2-Column Split: Vision (Left) & Description (Right) */}
        <div className={styles.visionSplitGrid}>
          <div className={styles.visionCol}>
            <div className={styles.sectionLabelWrapper}>
              <span className={styles.sectionLabel}>OUR VISION</span>
              <div className={styles.labelBar} />
            </div>
            <h3 className={styles.visionQuote}>
              {lang === 'id' 
                ? 'Mewujudkan kampus Politeknik Negeri Padang yang berwawasan teknologi informasi.'
                : 'Realizing an information technology-oriented campus at Politeknik Negeri Padang.'}
            </h3>
          </div>

          <div className={styles.descCol}>
            <p className={styles.descParagraph}>
              {lang === 'id'
                ? 'Sebagai komunitas berbasis teknologi yang dinamis, CyberTech PNP menyediakan lingkungan terstruktur di mana mahasiswa mengubah ide menjadi solusi inovatif. Dengan mengintegrasikan proyek strategis, program pengembangan skill, dan inisiatif kolaboratif, kami membina talenta siap masa depan yang berkontribusi pada kemajuan teknologi di dalam ekosistem akademik.'
                : 'As a dynamic technology-driven community, CyberTech PNP provides a structured environment where students transform ideas into innovative solutions. By integrating strategic projects, skill development programs, and collaborative initiatives, we cultivate future-ready talents who contribute to technological advancement within the academic ecosystem.'}
            </p>
          </div>
        </div>

        {/* Bottom Container Card: Mission & Core Objectives */}
        <div className={styles.missionCardBox}>
          <div className={styles.missionCardInner}>
            <div className={styles.missionLeftCol}>
              <div className={styles.sectionLabelWrapper}>
                <span className={styles.sectionLabel}>OUR MISSION</span>
                <div className={styles.labelBar} />
              </div>
              <h3 className={styles.missionTitle}>Our Core Objectives</h3>
            </div>

            <div className={styles.missionRightCol}>
              <ul className={styles.missionList}>
                {missions.map((m, idx) => (
                  <li key={idx} className={styles.missionItem}>
                    <span className={styles.sparkleIcon}>✦</span>
                    <span className={styles.missionText}>{m[lang as 'en' | 'id'] || m.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

