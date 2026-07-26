'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowClockwise, Code, Globe, Palette } from '@phosphor-icons/react';
import styles from './Division.module.css';
import { useLang } from '@/lib/context/LangContext';

interface CardProps {
  id: string;
  nameEn: string;
  nameId: string;
  descEn: string;
  descId: string;
  icon: React.ReactNode;
  image: string;
  tags: string[];
}

export default function Division() {
  const { lang } = useLang();
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({});
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleCardClick = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const divisions: CardProps[] = [
    {
      id: 'programming',
      nameEn: 'Programming',
      nameId: 'Programming',
      descEn: 'Building software, mobile apps, and web platforms with modern technologies.',
      descId: 'Membangun perangkat lunak, aplikasi seluler, dan platform web dengan teknologi modern.',
      icon: <Code size={22} weight="bold" />,
      image: '/images/primary/programming.png?v=2',
      tags: ['Mobile Programming', 'Web Programming', 'Machine Learning', 'Game Development'],
    },
    {
      id: 'networking',
      nameEn: 'Networking',
      nameId: 'Networking',
      descEn: 'Designing, configuring, and securing computer networks and cloud infrastructure.',
      descId: 'Merancang, mengkonfigurasi, dan mengamankan jaringan komputer serta infrastruktur cloud.',
      icon: <Globe size={22} weight="bold" />,
      image: '/images/primary/networking.png?v=2',
      tags: ['Network Architecture', 'Cloud Infrastructure', 'Cyber Security'],
    },
    {
      id: 'multimedia',
      nameEn: 'Multimedia',
      nameId: 'Multimedia',
      descEn: 'Crafting UI/UX designs, motion graphics, and creative visual experiences.',
      descId: 'Merancang desain UI/UX, motion graphics, dan pengalaman visual yang kreatif.',
      icon: <Palette size={22} weight="bold" />,
      image: '/images/primary/multimedia.png?v=2',
      tags: ['UI/UX Design', 'Graphic Design', 'Motion Graphics', 'Video Editing'],
    },
  ];

  return (
    <section id="division" ref={sectionRef} className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.badge}>{lang === 'id' ? 'Divisi Kami' : 'Our Divisions'}</span>
          <h2 className={styles.title}>{lang === 'id' ? 'Area Keahlian' : 'Areas of Expertise'}</h2>
          <p className={styles.subtitle}>
            {lang === 'id'
              ? 'Arahkan kursor atau tekan kartu untuk melihat detail keahlian divisi kami.'
              : 'Hover or tap card to inspect specialization details for each division.'}
          </p>
        </div>

        <div className={styles.grid}>
          {divisions.map((card) => {
            const isFlipped = !!flippedCards[card.id];

            return (
              <div
                key={card.id}
                className={`${styles.flipCard} ${isFlipped ? styles.isFlipped : ''}`}
                onClick={() => handleCardClick(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(card.id);
                  }
                }}
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
                        priority
                        loading="eager"
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
                    <div className={styles.cardBackContent}>
                      <div className={styles.cardBackHeader}>
                        <span className={styles.iconBadgeBack}>{card.icon}</span>
                        <h3 className={styles.cardBackTitle}>{lang === 'id' ? card.nameId : card.nameEn}</h3>
                      </div>

                      <p className={styles.cardBackDesc}>
                        {lang === 'id' ? card.descId : card.descEn}
                      </p>

                      <div className={styles.tagSection}>
                        <h4 className={styles.tagTitle}>
                          {lang === 'id' ? 'Fokus Keahlian & Spesialisasi:' : 'Core Competencies:'}
                        </h4>
                        <div className={styles.tagsContainer}>
                          {card.tags.map((tag, i) => (
                            <span key={i} className={styles.tagBadge}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={styles.flipHintBack}>
                        <ArrowClockwise size={16} weight="bold" />
                        <span>{lang === 'id' ? 'Kembali ke Gambar' : 'Back to Preview'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
