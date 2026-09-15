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

  const isEmpty = !member.name || member.name.trim() === '' || member.name.toLowerCase().includes('belum terisi') || member.name.toLowerCase().includes('open position');
  const primaryPhoto = isEmpty ? '/images/primary/cyberlogo.png' : (member.photo || '/images/primary/cyberlogo.png');
  const fullPhoto = isEmpty ? '/images/primary/cyberlogo.png' : (member.photo2 || primaryPhoto);

  const clearTimers = () => {
    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
  };

  const handleMouseEnter = () => {
    if (isEmpty) return;
    clearTimers();
    setIsHovered(true);
    setPhotoMode('hover');
    setIsGlitching(true);

    // End glitch burst effect after 350ms so content settles cleanly
    finishTimerRef.current = setTimeout(() => {
      setIsGlitching(false);
    }, 350);
  };

  const handleMouseLeave = () => {
    if (isEmpty) return;
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
    if (isEmpty) return;
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

  const isPrimaryDataOrExt = primaryPhoto.startsWith('data:') || primaryPhoto.startsWith('http');
  const isFullDataOrExt = fullPhoto.startsWith('data:') || fullPhoto.startsWith('http');

  return (
    <div
      className={`${styles.card} ${isKetua ? styles.ketuaCard : ''} ${isEmpty ? styles.emptyCard : ''} ${isHovered ? styles.activeState : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClickToggle}
      tabIndex={0}
      role="article"
      aria-label={`Member ${isEmpty ? 'Belum Terisi' : member.name}`}
    >
      {/* Glitch Burst Overlay Effect on Hover & Unhover */}
      {isGlitching && !isEmpty && (
        <>
          <div className={styles.glitchBurstCyan} />
          <div className={styles.glitchBurstRed} />
          <div className={styles.glitchNoiseBurst} />
        </>
      )}

      {/* Dual-Layer Preloaded Photo Container (Instant Swap & Zero Delay) */}
      <div className={styles.imageContainer}>
        {/* Layer 1: Foto Utama (Default) */}
        <Image
          src={primaryPhoto}
          alt={isEmpty ? 'Slot Belum Terisi' : member.name}
          width={320}
          height={320}
          unoptimized={isPrimaryDataOrExt}
          className={styles.photo}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: photoMode === 'hover' && !isEmpty ? 0 : 1,
            transform: photoMode === 'hover' && !isEmpty ? 'scale(0.92)' : 'scale(1)',
            transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none',
          }}
        />

        {/* Layer 2: Foto Kedua (Hover / Swap) */}
        {!isEmpty && (
          <Image
            src={fullPhoto}
            alt={`${member.name} - Hover`}
            width={320}
            height={320}
            unoptimized={isFullDataOrExt}
            className={styles.photo}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: photoMode === 'hover' ? 1 : 0,
              transform: photoMode === 'hover' ? 'scale(1)' : 'scale(1.08)',
              transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Card Info Text */}
      <div className={styles.info}>
        <h3 className={styles.name}>{isEmpty ? 'Belum Terisi' : member.name}</h3>
        <p className={styles.role}>{member.role}</p>
        {isEmpty && <span className={styles.emptyBadge}>Open Slot</span>}
      </div>
    </div>
  );
};

export interface DynamicMember extends Member {
  parentId?: string | null;
  positionId?: string;
  rawLevel?: number;
}

export function parseDphNodes(all: any[]) {
  // Exclude level 0 (Pembina)
  const valid = all.filter((m) => Number(m.level) > 0);

  // Level 1: Ketua Umum
  const foundKetua = valid.find((m) => Number(m.level) === 1 || m.role?.toLowerCase().includes('ketua umum'));
  const ketua: DynamicMember = foundKetua ? {
    id: typeof foundKetua.id === 'number' ? foundKetua.id : 1,
    name: foundKetua.name,
    role: foundKetua.role,
    photo: foundKetua.photo || '/images/primary/cyberlogo.png',
    photo2: foundKetua.photo2 || foundKetua.photo || '/images/primary/maskot.png',
    level: 'ketua',
    parentId: foundKetua.parentId,
    positionId: foundKetua.positionId,
    rawLevel: 1,
  } : ketuaUmum;

  // Level 2: Executive Core (Sekretaris Umum, Wakil Ketum, Bendahara Umum, Komdis, etc.)
  const foundL2 = valid.filter((m) => Number(m.level) === 2);
  const sortedL2 = [...foundL2].sort((a, b) => {
    const order = (role: string) => {
      const s = (role || '').toLowerCase();
      if (s.includes('sekretaris')) return 1;
      if (s.includes('wakil')) return 2;
      if (s.includes('bendahara')) return 3;
      return 4;
    };
    return order(a.role) - order(b.role);
  });
  const l2: DynamicMember[] = sortedL2.length > 0 ? sortedL2.map((m, idx) => ({
    id: typeof m.id === 'number' ? m.id : idx + 2,
    name: m.name,
    role: m.role,
    photo: m.photo || '/images/primary/cyberlogo.png',
    photo2: m.photo2 || m.photo || '/images/primary/maskot.png',
    level: (m.role?.toLowerCase().includes('wakil') ? 'wakil' : 'sekretaris_bendahara') as any,
    parentId: m.parentId,
    positionId: m.positionId,
    rawLevel: 2,
  })) : level2;

  // Level 3: Kepala Departemen (HRD, PR, CIM, IT, etc.)
  const foundL3 = valid.filter((m) => Number(m.level) === 3);
  const sortedL3 = [...foundL3].sort((a, b) => {
    const order = (role: string) => {
      const s = (role || '').toLowerCase();
      if (s.includes('hrd')) return 1;
      if (s.includes('pr')) return 2;
      if (s.includes('cim')) return 3;
      if (s.includes('it')) return 4;
      return 5;
    };
    return order(a.role) - order(b.role);
  });
  const l3: DynamicMember[] = sortedL3.length > 0 ? sortedL3.map((m, idx) => ({
    id: typeof m.id === 'number' ? m.id : idx + 5,
    name: m.name,
    role: m.role,
    photo: m.photo || '/images/primary/cyberlogo.png',
    photo2: m.photo2 || m.photo || '/images/primary/maskot.png',
    level: 'departemen',
    parentId: m.parentId,
    positionId: m.positionId,
    rawLevel: 3,
  })) : level3;

  // Level 4+: Technical Divisions & Staff Ahli (Networking, Programming, Multimedia, Staff Ahli ML, etc.)
  const foundL4 = valid.filter((m) => Number(m.level) >= 4);
  const sortedL4 = [...foundL4].sort((a, b) => {
    const order = (role: string) => {
      const s = (role || '').toLowerCase();
      if (s.includes('networking')) return 1;
      if (s.includes('programming')) return 2;
      if (s.includes('multimedia')) return 3;
      if (s.includes('mechine') || s.includes('machine') || s.includes('staff')) return 4;
      return 5;
    };
    return order(a.role) - order(b.role);
  });
  const l4: DynamicMember[] = sortedL4.length > 0 ? sortedL4.map((m, idx) => ({
    id: typeof m.id === 'number' ? m.id : idx + 9,
    name: m.name,
    role: m.role,
    photo: m.photo || '/images/primary/cyberlogo.png',
    photo2: m.photo2 || m.photo || '/images/primary/maskot.png',
    level: 'divisi',
    parentId: m.parentId,
    positionId: m.positionId,
    rawLevel: Number(m.level),
  })) : level4;

  return { ketua, l2, l3, l4 };
}

interface StructureProps {
  initialData?: any[];
}

export default function Structure({ initialData }: StructureProps) {
  const { t } = useLang();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Initialize with server-fetched database data instantly (no delay or flash of old static text)
  const initialParsed = initialData && initialData.length > 0 ? parseDphNodes(initialData) : null;
  const [ketua, setKetua] = useState<DynamicMember>(initialParsed ? initialParsed.ketua : ketuaUmum);
  const [l2, setL2] = useState<DynamicMember[]>(initialParsed ? initialParsed.l2 : level2);
  const [l3, setL3] = useState<DynamicMember[]>(initialParsed ? initialParsed.l3 : level3);
  const [l4, setL4] = useState<DynamicMember[]>(initialParsed ? initialParsed.l4 : level4);

  // Sync state immediately if initialData prop updates
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      const parsed = parseDphNodes(initialData);
      setKetua(parsed.ketua);
      setL2(parsed.l2);
      setL3(parsed.l3);
      setL4(parsed.l4);
    }
  }, [initialData]);

  useEffect(() => {
    // Intersection observer for section entrance animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Always ensure fresh data from database in background
    fetch('/api/structure')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          const parsed = parseDphNodes(resData.data);
          setKetua(parsed.ketua);
          setL2(parsed.l2);
          setL3(parsed.l3);
          setL4(parsed.l4);
        }
      })
      .catch((err) => {
        console.error('Error fetching dynamic structure from DB:', err);
      });

    return () => observer.disconnect();
  }, []);

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
            <StructureCard member={ketua} isKetua={true} index={0} />
            <div className={styles.verticalStem} />
          </div>

          {/* Dynamic Row for Level 2 (Executive Core) */}
          {l2.length > 0 && (
            <div className={styles.treeRow}>
              <div className={styles.treeRowStemIn} />
              {l2.map((member, idx) => (
                <div key={member.id || `l2-${idx}`} className={styles.treeNodeWrapper}>
                  <StructureCard member={member} index={idx + 1} />
                </div>
              ))}
            </div>
          )}

          {/* Stem between Level 2 and Level 3 */}
          <div className={styles.verticalStem} />

          {/* Dynamic Row for Level 3 (Departments) */}
          {l3.length > 0 && (
            <div className={styles.treeRow}>
              <div className={styles.treeRowStemIn} />
              {l3.map((member, idx) => {
                const isIT = member.role?.toLowerCase().includes('it');
                return (
                  <div key={member.id || `l3-${idx}`} className={styles.treeNodeWrapper}>
                    <StructureCard member={member} index={idx + l2.length + 1} />
                    {/* If this department is IT, drop a stem connecting down to the technical divisions & staff */}
                    {isIT && l4.length > 0 && (
                      <div className={styles.verticalStemBottom} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Dynamic Sub-branch for Level 4+ (Divisions & Staff Ahli connected under IT) */}
          {l4.length > 0 && (
            <div className={styles.subBranchContainer}>
              <div className={styles.subBranchRow}>
                {l4.map((member, idx) => (
                  <div key={member.id || `l4-${idx}`} className={styles.subTreeNodeWrapper}>
                    <StructureCard member={member} index={idx + l2.length + l3.length + 1} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}