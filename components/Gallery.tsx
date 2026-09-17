'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import styles from './Gallery.module.css';
import { useLang } from '@/lib/context/LangContext';
import { photos as defaultPhotos, GalleryPhoto, GalleryCategory } from '@/lib/data/gallery';
import { Trophy, Laptop, Users, Camera, MagnifyingGlassPlus } from '@phosphor-icons/react';

interface GalleryProps {
  initialData?: GalleryPhoto[];
}

export default function Gallery({ initialData }: GalleryProps) {
  const { t } = useLang();
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all');
  const [allPhotos, setAllPhotos] = useState<GalleryPhoto[]>(
    initialData && initialData.length > 0 ? initialData : defaultPhotos
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Sync state if initialData prop updates
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setAllPhotos(initialData);
    }
  }, [initialData]);

  // Entrance intersection observer
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
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          setAllPhotos(resData.data);
        }
      })
      .catch(() => {});

    return () => observer.disconnect();
  }, []);

  // Filtered photos with fallback to empty placeholder cards if empty
  const filteredPhotos = allPhotos.filter(
    (photo) => filter === 'all' || photo.category === filter
  );

  const effectivePhotos = filteredPhotos.length > 0 ? filteredPhotos : [
    { id: 101, src: '', alt: 'Dokumentasi Segera Hadir', category: (filter === 'all' ? 'workshop' : filter) as any, year: 2026 },
    { id: 102, src: '', alt: 'Foto Kegiatan Mendatang', category: (filter === 'all' ? 'hackathon' : filter) as any, year: 2026 },
    { id: 103, src: '', alt: 'Momen CyberTech 2026', category: (filter === 'all' ? 'internal' : filter) as any, year: 2026 },
  ];

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showPrevLightbox = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + effectivePhotos.length) % effectivePhotos.length);
    }
  }, [lightboxIndex, effectivePhotos.length]);

  const showNextLightbox = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % effectivePhotos.length);
    }
  }, [lightboxIndex, effectivePhotos.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrevLightbox();
      if (e.key === 'ArrowRight') showNextLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, showPrevLightbox, showNextLightbox]);

  // Prevent background scroll when Lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'hackathon': return <Trophy size={18} color="#f59e0b" />;
      case 'workshop': return <Laptop size={18} color="#38bdf8" />;
      case 'internal': return <Users size={18} color="#10b981" />;
      default: return <Camera size={18} color="#a855f7" />;
    }
  };

  // Split filtered photos into 3 masonry columns
  const col1 = effectivePhotos.filter((_, i) => i % 3 === 0);
  const col2 = effectivePhotos.filter((_, i) => i % 3 === 1);
  const col3 = effectivePhotos.filter((_, i) => i % 3 === 2);

  // Duplicate columns for seamless infinite auto-scrolling marquee loop
  const dupCol1 = [...col1, ...col1];
  const dupCol2 = [...col2, ...col2];
  const dupCol3 = [...col3, ...col3];

  return (
    <section id="gallery" ref={sectionRef} className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          {t?.gallery?.title || 'Galeri'} <span style={{ color: 'var(--accent-royal-blue)' }}>{t?.gallery?.titleAccent || ''}</span>
        </h2>
        <p className={styles.subtitle}>{t?.gallery?.subtitle || 'Dokumentasi kegiatan UKM CyberTech PNP'}</p>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          {t?.gallery?.filter?.all || 'All'}
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'hackathon' ? styles.active : ''}`}
          onClick={() => setFilter('hackathon')}
        >
          {t?.gallery?.filter?.hackathon || 'Hackathon'}
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'workshop' ? styles.active : ''}`}
          onClick={() => setFilter('workshop')}
        >
          {t?.gallery?.filter?.workshop || 'Workshop'}
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'internal' ? styles.active : ''}`}
          onClick={() => setFilter('internal')}
        >
          {t?.gallery?.filter?.internal || 'Internal'}
        </button>
      </div>

      {/* Auto-Slide Masonry Gallery Marquee Wrapper */}
      <div 
        className={styles.masonryScrollWrapper}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Column 1 - Auto-Scroll Up */}
        <div className={`${styles.masonryColumn} ${styles.scrollUp} ${isPaused ? styles.paused : ''}`}>
          {dupCol1.map((photo, index) => {
            const isExtOrData = Boolean(photo.src && (photo.src.startsWith('data:') || photo.src.startsWith('http')));
            return (
              <div
                key={`${photo.id}-1-${index}`}
                className={styles.masonryCard}
                onClick={() => openLightbox(index % (col1.length || 1))}
              >
                {photo.src ? (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={500}
                    height={index % 2 === 0 ? 320 : 240}
                    unoptimized={isExtOrData}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.placeholder} style={{ height: index % 2 === 0 ? '300px' : '220px' }}>
                    <Image
                      src="/images/primary/cyberlogo.png"
                      alt={photo.alt || 'CyberTech PNP'}
                      width={64}
                      height={64}
                      style={{ opacity: 0.65, objectFit: 'contain', marginBottom: '8px' }}
                    />
                    <span className={styles.placeholderIcon}>{getCategoryIcon(photo.category)}</span>
                    <span className={styles.placeholderText}>{photo.category}</span>
                  </div>
                )}
                <div className={styles.overlay}>
                  <span className={styles.zoomIcon}><MagnifyingGlassPlus size={22} weight="bold" /></span>
                  <span className={styles.altText}>{photo.alt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Column 2 - Auto-Scroll Down */}
        <div className={`${styles.masonryColumn} ${styles.scrollDown} ${isPaused ? styles.paused : ''}`}>
          {dupCol2.map((photo, index) => {
            const isExtOrData = Boolean(photo.src && (photo.src.startsWith('data:') || photo.src.startsWith('http')));
            return (
              <div
                key={`${photo.id}-2-${index}`}
                className={styles.masonryCard}
                onClick={() => openLightbox(index % (col2.length || 1))}
              >
                {photo.src ? (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={500}
                    height={index % 2 === 0 ? 250 : 340}
                    unoptimized={isExtOrData}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.placeholder} style={{ height: index % 2 === 0 ? '240px' : '320px' }}>
                    <Image
                      src="/images/primary/cyberlogo.png"
                      alt={photo.alt || 'CyberTech PNP'}
                      width={64}
                      height={64}
                      style={{ opacity: 0.65, objectFit: 'contain', marginBottom: '8px' }}
                    />
                    <span className={styles.placeholderIcon}>{getCategoryIcon(photo.category)}</span>
                    <span className={styles.placeholderText}>{photo.category}</span>
                  </div>
                )}
                <div className={styles.overlay}>
                  <span className={styles.zoomIcon}><MagnifyingGlassPlus size={22} weight="bold" /></span>
                  <span className={styles.altText}>{photo.alt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Column 3 - Auto-Scroll Up */}
        <div className={`${styles.masonryColumn} ${styles.scrollUp} ${isPaused ? styles.paused : ''}`}>
          {dupCol3.map((photo, index) => {
            const isExtOrData = Boolean(photo.src && (photo.src.startsWith('data:') || photo.src.startsWith('http')));
            return (
              <div
                key={`${photo.id}-3-${index}`}
                className={styles.masonryCard}
                onClick={() => openLightbox(index % (col3.length || 1))}
              >
                {photo.src ? (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={500}
                    height={index % 2 === 0 ? 300 : 220}
                    unoptimized={isExtOrData}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.placeholder} style={{ height: index % 2 === 0 ? '280px' : '230px' }}>
                    <Image
                      src="/images/primary/cyberlogo.png"
                      alt={photo.alt || 'CyberTech PNP'}
                      width={64}
                      height={64}
                      style={{ opacity: 0.65, objectFit: 'contain', marginBottom: '8px' }}
                    />
                    <span className={styles.placeholderIcon}>{getCategoryIcon(photo.category)}</span>
                    <span className={styles.placeholderText}>{photo.category}</span>
                  </div>
                )}
                <div className={styles.overlay}>
                  <span className={styles.zoomIcon}><MagnifyingGlassPlus size={22} weight="bold" /></span>
                  <span className={styles.altText}>{photo.alt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <button className={styles.closeBtn} onClick={closeLightbox}>×</button>
          <button className={styles.prevBtn} onClick={showPrevLightbox}>‹</button>
          
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {filteredPhotos[lightboxIndex].src ? (
              <Image
                src={filteredPhotos[lightboxIndex].src}
                alt={filteredPhotos[lightboxIndex].alt}
                width={1200}
                height={800}
                className={styles.lightboxImage}
              />
            ) : (
              <div className={styles.lightboxPlaceholder}>
                <span className={styles.placeholderIcon} style={{ fontSize: '4rem' }}>
                  {getCategoryIcon(filteredPhotos[lightboxIndex].category)}
                </span>
                <span className={styles.placeholderText} style={{ fontSize: '1.5rem' }}>
                  {filteredPhotos[lightboxIndex].category}
                </span>
              </div>
            )}
            <div className={styles.lightboxTitle}>
              {filteredPhotos[lightboxIndex].alt}
            </div>
          </div>
          
          <button className={styles.nextBtn} onClick={showNextLightbox}>›</button>
        </div>
      )}
    </section>
  );
}
