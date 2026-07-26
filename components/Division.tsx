'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './Division.module.css';
import { useLang } from '@/lib/context/LangContext';
import { Sparkle, ArrowClockwise, ArrowRight } from '@phosphor-icons/react';

interface CardProps {
  id: string;
  nameEn: string;
  nameId: string;
  descEn: string;
  descId: string;
  icon: string;
  image: string;
  tags: string[];
}

const DivisionCard = ({
  card,
  lang,
}: {
  card: CardProps;
  lang: string;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`${styles.cardWrapper} ${isFlipped ? styles.flipped : ''}`}
      onClick={toggleFlip}
      tabIndex={0}
      role="button"
      aria-label={`Flip card for Division ${lang === 'id' ? card.nameId : card.nameEn}`}
    >
      <div className={styles.flipCardInner}>

        {/* CARD FRONT SIDE */}
        <div className={styles.cardFront}>
          <div className={styles.accentBorderTop} />
          <div className={styles.accentBorderLeft} />

          <div className={styles.cardTop}>
            <div className={styles.cardHeaderRow}>
              <span className={styles.iconBadge}>{card.icon}</span>
              <h3 className={styles.cardTitle}>{lang === 'id' ? card.nameId : card.nameEn}</h3>
            </div>
          </div>

          <div className={styles.imageContainer}>
            <Image
              src={card.image}
              alt={card.nameEn}
              fill
              sizes="(max-width: 768px) 85vw, (max-width: 1200px) 33vw, 400px"
              className={styles.image}
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>

          <div className={styles.cardBottomFront}>
            <p className={styles.shortDesc}>
              {lang === 'id' ? card.descId : card.descEn}
            </p>

            <div className={styles.flipHint}>
              <span>{lang === 'id' ? 'Detail Keahlian' : 'Specialization Detail'}</span>
              <ArrowClockwise size={16} weight="bold" />
            </div>
          </div>
        </div>

        {/* CARD BACK SIDE */}
        <div className={styles.cardBack}>
          <div className={styles.cardBackHeader}>
            <span className={styles.iconBadge}>{card.icon}</span>
            <div>
              <h3 className={styles.cardBackTitle}>{lang === 'id' ? card.nameId : card.nameEn}</h3>
              <p className={styles.cardBackSub}>Specialization Track</p>
            </div>
          </div>

          <p className={styles.cardBackDesc}>
            {lang === 'id' ? card.descId : card.descEn}
          </p>

          <div className={styles.subfieldsSection}>
            <span className={styles.subfieldsLabel}>
              {lang === 'id' ? 'Fokus Keahlian Utama' : 'Key Focus Areas'}
            </span>
            <div className={styles.tagsGrid}>
              {card.tags.map((tag, i) => (
                <div key={i} className={styles.tagBadge}>
                  <Sparkle size={12} weight="fill" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.flipBackHint}>
            <span>{lang === 'id' ? 'Kembali ke Depan' : 'Flip Back'}</span>
            <ArrowRight size={16} weight="bold" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default function Division() {
  const { lang } = useLang();
  const [isVisible, setIsVisible] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

  const handleScroll = () => {
    if (!gridRef.current) return;
    const scrollLeft = gridRef.current.scrollLeft;
    const width = gridRef.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / (width * 0.8));
    setActiveCardIndex(Math.min(Math.max(newIndex, 0), 2));
  };

  const divisions: CardProps[] = [
    {
      id: 'programming',
      nameEn: 'Programming',
      nameId: 'Programming',
      descEn: 'Building software, mobile apps, and web platforms with modern technologies.',
      descId: 'Membangun perangkat lunak, aplikasi seluler, dan platform web dengan teknologi modern.',
      icon: '</>',
      image: '/images/primary/programming.png?v=2',
      tags: ['Mobile Programming', 'Web Programming', 'Machine Learning', 'Game Development'],
    },
    {
      id: 'networking',
      nameEn: 'Networking',
      nameId: 'Networking',
      descEn: 'Designing, configuring, and securing computer networks and cloud infrastructure.',
      descId: 'Merancang, mengkonfigurasi, dan mengamankan jaringan komputer serta infrastruktur cloud.',
      icon: '🌐',
      image: '/images/primary/networking.png?v=2',
      tags: ['Network Architecture', 'Cloud Infrastructure', 'Cyber Security'],
    },
    {
      id: 'multimedia',
      nameEn: 'Multimedia',
      nameId: 'Multimedia',
      descEn: 'Creating stunning visuals, UI/UX designs, and engaging digital content.',
      descId: 'Membuat visual menawan, desain UI/UX, dan konten digital yang interaktif.',
      icon: '🎨',
      image: '/images/primary/multimedia.png?v=2',
      tags: ['UI/UX Design', 'Graphic & Motion Design', 'Video Production'],
    }
  ];

  return (
    <section id="division" ref={sectionRef} className={`${styles.division} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>{lang === 'id' ? 'Divisi Kami' : 'Our Divisions'}</span>
          <h2 className={styles.title}>{lang === 'id' ? 'Area Keahlian' : 'Areas of Expertise'}</h2>
          <p className={styles.subtitle}>
            {lang === 'id'
              ? 'Arahkan kursor atau tekan kartu untuk melihat detail keahlian divisi kami.'
              : 'Hover or tap card to inspect specialization details for each division.'}
          </p>
        </div>

        <div className={styles.grid} ref={gridRef} onScroll={handleScroll}>
          {divisions.map((div, i) => (
            <DivisionCard key={i} card={div} lang={lang as string} />
          ))}
        </div>

        {/* Mobile Swipe Dots Indicator */}
        <div className={styles.mobileSwipeIndicator}>
          {divisions.map((_, i) => (
            <span
              key={i}
              className={`${styles.swipeDot} ${activeCardIndex === i ? styles.activeDot : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
