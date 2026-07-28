'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './Structure.module.css';
import { useLang } from '@/lib/context/LangContext';
import { ketuaUmum, level2, level3, level4, Member } from '@/lib/data/structure';

interface StructureCardProps {
  member: Member;
  isKetua?: boolean;
  index?: number;
}

const StructureCard = ({ member, isKetua = false }: StructureCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [photoMode, setPhotoMode] = useState<'default' | 'hover'>('default');
  const [isGlitching, setIsGlitching] = useState(false);

  const swapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);

  const primaryPhoto = member.photo || '/images/primary/cyberlogo.png';
  const fullPhoto = member.photo2 || primaryPhoto;

  const clearTimers = () => {
    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
  };

  const handleMouseEnter = () => {
    clearTimers();
    setIsHovered(true);
    setPhotoMode('hover');
    setIsGlitching(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    clearTimers();

    // 1. Start glitch burst while STILL showing the hover photo
    setIsGlitching(true);

    // 2. Midway through glitch burst (150ms), swap photo back to default
    swapTimerRef.current = setTimeout(() => {
      setPhotoMode('default');
    }, 150);

    // 3. Complete glitch animation (350ms) and settle on clean default state
    finishTimerRef.current = setTimeout(() => {
      setIsGlitching(false);
    }, 350);
  };

  const handleClickToggle = () => {
    clearTimers();
    setIsGlitching(true);
    if (photoMode === 'default') {
      setIsHovered(true);
      setPhotoMode('hover');
    } else {
      setIsHovered(false);
      swapTimerRef.current = setTimeout(() => {
        setPhotoMode('default');
      }, 150);
    }
    finishTimerRef.current = setTimeout(() => {
      setIsGlitching(false);
    }, 350);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const displayedPhoto = photoMode === 'hover' ? fullPhoto : primaryPhoto;

  return (
    <div
      className={`${styles.card} ${isKetua ? styles.ketuaCard : ''} ${isHovered ? styles.activeState : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClickToggle}
      tabIndex={0}
      role="article"
      aria-label={`Member ${member.name}`}
    >
      {/* Glitch Burst Overlay Effect on Hover & Unhover */}
      {isGlitching && (
        <>
          <div className={styles.glitchBurstCyan} />
          <div className={styles.glitchBurstRed} />
          <div className={styles.glitchNoiseBurst} />
        </>
      )}

      {/* Photo Container with Controlled Photo Mode */}
      <div className={styles.imageContainer}>
        <Image
          src={displayedPhoto}
          alt={member.name}
          width={320}
          height={320}
          className={`${styles.photo} ${photoMode === 'hover' ? styles.photoFull : ''}`}
        />
      </div>

      {/* Card Info Text */}
      <div className={styles.info}>
        <h3 className={styles.name}>{member.name}</h3>
        <p className={styles.role}>{member.role}</p>
      </div>
    </div>
  );
};

export default function Structure() {
  const { t } = useLang();
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

  const sekUm = level2[0];
  const wakil = level2[1];
  const benUm = level2[2];

  const deptHRD = level3[0];
  const deptPR = level3[1];
  const deptCIM = level3[2];
  const deptIT = level3[3];

  const divNet = level4[0];
  const divProg = level4[1];
  const divMulti = level4[2];

  return (
    <section id="structure" ref={sectionRef} className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.header}>
        <span className={styles.badge}>Organisasi</span>
        <h2 className={styles.title}>{t?.structure?.title || 'Struktur Dewan Pengurus Harian UKM Cybertech 2026/2027'}</h2>
        <p className={styles.subtitle}>UKM CyberTech PNP 2026/2027</p>
      </div>

      <div className={styles.treeScrollContainer}>
        <div className={styles.treeOuter}>

          {/* Level 1: Root Node (Ketua Umum) */}
          <div className={styles.treeLevel1}>
            <StructureCard member={ketuaUmum} isKetua={true} index={0} />
            <div className={styles.verticalStem} />
          </div>

          {/* Branch Bar to Level 2 (Executive Core) */}
          <div className={styles.branchContainerL2}>
            <div className={styles.horizontalBarL2} />
            <div className={styles.level2Grid}>
              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={sekUm} index={1} />
              </div>

              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={wakil} index={2} />
              </div>

              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={benUm} index={3} />
              </div>
            </div>

            <div className={styles.verticalStemCenterL2} />
          </div>

          {/* Branch Bar to Level 3 (4 Depts) */}
          <div className={styles.branchContainerL3}>
            <div className={styles.horizontalBarL3} />
            <div className={styles.level3Grid}>
              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={deptHRD} index={4} />
              </div>

              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={deptPR} index={5} />
              </div>

              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={deptCIM} index={6} />
              </div>

              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={deptIT} index={7} />
                <div className={styles.verticalStemBottom} />
              </div>
            </div>
          </div>

          {/* Branch Bar to Level 4 (3 Technical Divisions) - Connected under Rofiqul (Dept IT) */}
          <div className={styles.branchContainerL4}>
            <div className={styles.horizontalBarL4} />
            <div className={styles.level4Grid}>
              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={divNet} index={8} />
              </div>

              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={divProg} index={9} />
              </div>

              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={divMulti} index={10} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}