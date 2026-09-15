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

    // End glitch burst effect after 350ms so content settles cleanly
    finishTimerRef.current = setTimeout(() => {
      setIsGlitching(false);
    }, 350);
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

  const isPrimaryDataOrExt = primaryPhoto.startsWith('data:') || primaryPhoto.startsWith('http');
  const isFullDataOrExt = fullPhoto.startsWith('data:') || fullPhoto.startsWith('http');

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

      {/* Dual-Layer Preloaded Photo Container (Instant Swap & Zero Delay) */}
      <div className={styles.imageContainer}>
        {/* Layer 1: Foto Utama (Default) */}
        <Image
          src={primaryPhoto}
          alt={member.name}
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
            opacity: photoMode === 'hover' ? 0 : 1,
            transform: photoMode === 'hover' ? 'scale(0.92)' : 'scale(1)',
            transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none',
          }}
        />

        {/* Layer 2: Foto Kedua (Hover / Swap) */}
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

  // Dynamic DPH state from PostgreSQL Database
  const [ketua, setKetua] = useState<Member>(ketuaUmum);
  const [l2, setL2] = useState<Member[]>(level2);
  const [l3, setL3] = useState<Member[]>(level3);
  const [l4, setL4] = useState<Member[]>(level4);

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

    // Fetch dynamic DPH structure from database
    fetch('/api/structure')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          const all: any[] = resData.data;

          // Level 1: Ketua Umum
          const foundKetua = all.find((m) => m.level === 1 || m.role?.toLowerCase().includes('ketua umum'));
          if (foundKetua) {
            setKetua({
              id: typeof foundKetua.id === 'number' ? foundKetua.id : 1,
              name: foundKetua.name,
              role: foundKetua.role,
              photo: foundKetua.photo || '/images/primary/cyberlogo.png',
              photo2: foundKetua.photo2 || foundKetua.photo || '/images/primary/maskot.png',
              level: 'ketua',
            });
          }

          // Level 2: Sekretaris Umum, Wakil Ketua Umum, Bendahara Umum
          const foundL2 = all.filter((m) => m.level === 2);
          if (foundL2.length > 0) {
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
            setL2(sortedL2.map((m, idx) => ({
              id: typeof m.id === 'number' ? m.id : idx + 2,
              name: m.name,
              role: m.role,
              photo: m.photo || '/images/primary/cyberlogo.png',
              photo2: m.photo2 || m.photo || '/images/primary/maskot.png',
              level: (m.role?.toLowerCase().includes('wakil') ? 'wakil' : 'sekretaris_bendahara') as any,
            })));
          }

          // Level 3: Kepala Departemen (HRD, PR, CIM, IT)
          const foundL3 = all.filter((m) => m.level === 3);
          if (foundL3.length > 0) {
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
            setL3(sortedL3.map((m, idx) => ({
              id: typeof m.id === 'number' ? m.id : idx + 5,
              name: m.name,
              role: m.role,
              photo: m.photo || '/images/primary/cyberlogo.png',
              photo2: m.photo2 || m.photo || '/images/primary/maskot.png',
              level: 'departemen',
            })));
          }

          // Level 4: Kepala Divisi (Networking, Programming, Multimedia)
          const foundL4 = all.filter((m) => m.level === 4);
          if (foundL4.length > 0) {
            const sortedL4 = [...foundL4].sort((a, b) => {
              const order = (role: string) => {
                const s = (role || '').toLowerCase();
                if (s.includes('networking')) return 1;
                if (s.includes('programming')) return 2;
                if (s.includes('multimedia')) return 3;
                return 4;
              };
              return order(a.role) - order(b.role);
            });
            setL4(sortedL4.map((m, idx) => ({
              id: typeof m.id === 'number' ? m.id : idx + 9,
              name: m.name,
              role: m.role,
              photo: m.photo || '/images/primary/cyberlogo.png',
              photo2: m.photo2 || m.photo || '/images/primary/maskot.png',
              level: 'divisi',
            })));
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching dynamic structure from DB:', err);
      });

    return () => observer.disconnect();
  }, []);

  const sekUm = l2[0] || level2[0];
  const wakil = l2[1] || level2[1];
  const benUm = l2[2] || level2[2];

  const deptHRD = l3[0] || level3[0];
  const deptPR = l3[1] || level3[1];
  const deptCIM = l3[2] || level3[2];
  const deptIT = l3[3] || level3[3];

  const divNet = l4[0] || level4[0];
  const divProg = l4[1] || level4[1];
  const divMulti = l4[2] || level4[2];

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