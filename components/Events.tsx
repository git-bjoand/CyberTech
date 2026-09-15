'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLang } from '@/lib/context/LangContext';
import { events as defaultEvents, Event as EventItem } from '@/lib/data/events';
import styles from './Events.module.css';

interface EventsProps {
  initialData?: EventItem[];
}

export default function Events({ initialData }: EventsProps) {
  const { t } = useLang();
  const [items, setItems] = useState<EventItem[]>(
    initialData && initialData.length > 0 ? initialData : defaultEvents
  );
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Sync state if initialData prop updates
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setItems(initialData);
    }
  }, [initialData]);

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

    // Always ensure fresh data from database in background
    fetch('/api/events')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          setItems(resData.data);
        }
      })
      .catch(() => {});

    return () => observer.disconnect();
  }, []);

  const featuredEvent = items.find((e) => e.isFeatured);
  const regularEvents = items.filter((e) => !e.isFeatured);

  return (
    <section id="events" ref={sectionRef} className={`${styles.events} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>{t?.events?.label || 'Kegiatan & Acara'}</span>
          <h2 className={styles.title}>
            {t?.events?.title || 'Agenda'} <span className={styles.titleAccent}>{t?.events?.titleAccent || 'CyberTech'}</span>
          </h2>
          <p className={styles.subtitle}>{t?.events?.subtitle || 'Ikuti berbagai workshop, seminar, hackathon, dan kegiatan seru kami.'}</p>
        </div>

        {featuredEvent ? (
          <div className={styles.heroCard}>
            <div className={styles.heroGlow}></div>
            <div className={styles.heroContent}>
              <div className={styles.heroHeader}>
                <span className={styles.featuredBadge}>Featured Event</span>
                <span className={`${styles.badge} ${styles.badgeStatus} ${styles.upcoming}`}>
                  {(t?.events && typeof t.events === 'object' && (t.events as any)[featuredEvent.status]) || featuredEvent.status}
                </span>
              </div>
              
              <h3 className={styles.heroTitle}>{featuredEvent.title}</h3>
              <p className={styles.heroDesc}>{featuredEvent.description}</p>
              
              <div className={styles.heroActions}>
                <a href="#events" className={styles.heroCta}>{t?.events?.learnMore || 'Selengkapnya'}</a>
                {featuredEvent.instagram && (
                  <a href={`https://instagram.com/${featuredEvent.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className={styles.heroInsta}>
                    {featuredEvent.instagram}
                  </a>
                )}
              </div>
            </div>
            
            <div className={styles.heroStats}>
              {(Array.isArray(featuredEvent.tags) ? featuredEvent.tags.slice(0, 3) : []).map((tag, i) => (
                <div key={i} className={styles.statItem}>
                  <span className={styles.statValue}>{tag}</span>
                  <span className={styles.statLabel}>Highlight {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty Featured Event Placeholder Card */
          <div className={`${styles.heroCard} ${styles.emptyHeroCard}`}>
            <div className={styles.heroGlow}></div>
            <div className={styles.heroContent}>
              <div className={styles.heroHeader}>
                <span className={styles.featuredBadge}>Agenda Utama</span>
                <span className={`${styles.badge} ${styles.badgeStatus} ${styles.upcoming}`}>
                  Segera Hadir
                </span>
              </div>
              
              <h3 className={styles.heroTitle}>Agenda Akbar Sedang Dipersiapkan</h3>
              <p className={styles.heroDesc}>
                Event unggulan tahunan UKM CyberTech PNP sedang dalam tahap perancangan teknis. Nantikan pengumuman resminya di media sosial kami.
              </p>
            </div>
            
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>2026</span>
                <span className={styles.statLabel}>Tahun Agenda</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>Nasional</span>
                <span className={styles.statLabel}>Cakupan</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.grid}>
          {regularEvents.length === 0 ? (
            /* Empty Regular Events Placeholder Card */
            <div 
              className={`${styles.card} ${styles.emptyCard} ${isVisible ? styles.cardRevealed : ''}`}
              style={{ transitionDelay: '0.8s' }}
            >
              <div className={styles.cardImageContainer}>
                <Image
                  src="/images/primary/cyberlogo.png"
                  alt="Belum Ada Acara"
                  width={140}
                  height={140}
                  className={styles.emptyCardLogo}
                />
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardBadges}>
                    <span className={`${styles.badge} ${styles.badgeType}`}>Kegiatan</span>
                    <span className={`${styles.badge} ${styles.badgeStatus} ${styles.upcoming}`}>Stay Tuned</span>
                  </div>
                  <span className={styles.cardYear}>2026</span>
                </div>

                <h4 className={styles.cardTitle}>Kegiatan Mendatang</h4>
                <p className={styles.cardDesc}>
                  Belum ada agenda kegiatan tambahan di database. Ikuti informasi terbaru seputar workshop dan seminar kami.
                </p>
              </div>
            </div>
          ) : (
            regularEvents.map((event, index) => {
              const partnerMatch = event.title.includes('—') ? event.title.split('—') : event.title.split('-');
              const partnerName = partnerMatch.length > 1 ? partnerMatch[1].trim() : '';

              const eventTypeKey = event.type as string;
              const typeTranslation = (t?.events && (t.events as any)[eventTypeKey]?.type) || event.type;
              const statusTranslation = (t?.events && (t.events as any)[event.status]) || event.status;

              const eventImage = event.image || '/images/primary/cyberlogo.png';
              const isExtOrData = Boolean(eventImage.startsWith('data:') || eventImage.startsWith('http'));

              return (
                <div 
                  key={event.id || index} 
                  className={`${styles.card} ${isVisible ? styles.cardRevealed : ''}`}
                  style={{ transitionDelay: `${0.8 + index * 0.3}s` }}
                >
                  <div className={styles.cardImageContainer}>
                    <Image
                      src={eventImage}
                      alt={event.title}
                      width={400}
                      height={240}
                      unoptimized={isExtOrData}
                      className={styles.cardImage}
                    />
                    <div className={styles.imageOverlay} />
                  </div>
                  
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardBadges}>
                        <span className={`${styles.badge} ${styles.badgeType} ${styles[event.type] || ''}`}>
                          {typeTranslation}
                        </span>
                        <span className={`${styles.badge} ${styles.badgeStatus} ${styles[event.status] || ''}`}>
                          {statusTranslation}
                        </span>
                      </div>
                      <span className={styles.cardYear}>{event.year || 2026}</span>
                    </div>

                    <h4 className={styles.cardTitle}>{event.title}</h4>
                    <p className={styles.cardDesc}>{event.description}</p>

                    {event.type === 'collaboration' && partnerName && (
                      <div className={styles.cardFooter}>
                        <span className={styles.partnerName}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          {partnerName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
