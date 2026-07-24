'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './Division.module.css';
import { useLang } from '@/lib/context/LangContext';

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

const DivisionCard = ({ card, lang, index }: { card: CardProps; lang: string; index: number }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const handleCardClick = () => {
    setIsPressed((prev) => !prev);
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.cardWrapper} ${isPressed ? styles.pressed : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
      }}
    >
      <div className={styles.card}>
        <div className={styles.accentBorderTop} />
        <div className={styles.accentBorderLeft} />

        {/* Top section: icon + title */}
        <div className={styles.cardTop}>
          <div className={styles.cardHeaderRow}>
            <span className={styles.iconBadge}>{card.icon}</span>
            <h3 className={styles.cardTitle}>{card.nameEn}</h3>
          </div>
        </div>

        {/* Image frame */}
        <div className={styles.imageContainer}>
          <Image 
            src={card.image}
            alt={card.nameEn}
            fill
            className={styles.image}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Bottom section: desc + subfields */}
        <div className={styles.cardBottom}>
          <p className={styles.cardDesc}>
            {lang === 'id' ? card.descId : card.descEn}
          </p>

          <div className={styles.divider} />

          <div className={styles.subfieldsList}>
            {card.tags.map((tag, i) => (
              <div key={i} className={styles.subfieldItem}>
                <span className={styles.subfieldBullet}>◆</span>
                <span>{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Division() {
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

  const divisions: CardProps[] = [
    {
      id: 'programming',
      nameEn: 'Programming',
      nameId: 'Programming',
      descEn: 'Building software, mobile apps, and web platforms with modern technologies.',
      descId: 'Membangun perangkat lunak, aplikasi seluler, dan platform web dengan teknologi modern.',
      icon: '</>',
      image: '/images/primary/programming.png',
      tags: ['Mobile Programming', 'Web Programming', 'Machine Learning'],
    },
    {
      id: 'networking',
      nameEn: 'Networking',
      nameId: 'Networking',
      descEn: 'Designing, configuring, and securing computer networks and cloud infrastructure.',
      descId: 'Merancang, mengkonfigurasi, dan mengamankan jaringan komputer serta infrastruktur cloud.',
      icon: '🌐',
      image: '/images/primary/networking.png',
      tags: ['Network Architecture', 'Cloud Infrastructure', 'Cyber Security'],
    },
    {
      id: 'multimedia',
      nameEn: 'Multimedia',
      nameId: 'Multimedia',
      descEn: 'Creating stunning visuals, UI/UX designs, and engaging digital content.',
      descId: 'Membuat visual menawan, desain UI/UX, dan konten digital yang interaktif.',
      icon: '🎨',
      image: '/images/primary/multimedia.png',
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
              ? 'Pilih jalur Anda dan kembangkan keterampilan bersama divisi khusus kami.' 
              : 'Choose your path and master your skills with our specialized divisions.'}
          </p>
        </div>

        <div className={styles.grid}>
          {divisions.map((div, i) => (
            <DivisionCard key={i} card={div} lang={lang as string} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
