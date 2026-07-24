'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './Structure.module.css';
import { useLang } from '@/lib/context/LangContext';
import { ketuaUmum, level2, level3, level4, Member } from '@/lib/data/structure';

const StructureCard = ({ member, isKetua = false, index = 0 }: { member: Member; isKetua?: boolean; index?: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const isActive = isHovered || isClicked;

  const handleClick = () => {
    setIsClicked((prev) => !prev);
  };

  const primaryPhoto = member.photo || '/images/primary/cyberlogo.png';
  const fullPhoto = member.photo2 || primaryPhoto;

  return (
    <div
      className={`${styles.card} ${isKetua ? styles.ketuaCard : ''} ${isActive ? styles.activeHackState : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`View ${member.name}`}
      style={{ transitionDelay: `${0.15 + index * 0.18}s` }}
    >
      {/* Glitch Overlay Layers */}
      {isActive && (
        <>
          <div className={styles.glitchLayerCyan} />
          <div className={styles.glitchLayerRed} />
          <div className={styles.glitchNoiseOverlay} />
          <div className={styles.glitchScanline} />
        </>
      )}

      {/* Photo Container */}
      <div className={styles.imageContainer}>
        <img
          src={isActive ? fullPhoto : primaryPhoto}
          alt={member.name}
          className={`${styles.photo} ${isActive ? styles.glitchPhotoActive : ''}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/primary/cyberlogo.png';
          }}
        />
        {isActive && <div className={styles.hackedStatusBadge}>[SYS.HACKED]</div>}
      </div>

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
      { threshold: 0.15 }
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
          {/* Level 1: Ketua Umum */}
          <div className={styles.treeLevel1}>
            <StructureCard member={ketuaUmum} isKetua={true} index={0} />
            <div className={styles.verticalStem} />
          </div>

          {/* Branch Bar to Level 2 */}
          <div className={styles.branchContainerL2}>
            <div className={styles.horizontalBarL2} />
            <div className={styles.level2Grid}>
              {/* SekUm */}
              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={sekUm} index={1} />
              </div>

              {/* Wakil Ketua */}
              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={wakil} index={2} />
              </div>

              {/* BenUm */}
              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={benUm} index={3} />
              </div>
            </div>
            
            {/* Stem down from Wakil (Center of Level 2) to Level 3 */}
            <div className={styles.verticalStemCenterL2} />
          </div>

          {/* Branch Bar to Level 3 (4 Depts) */}
          <div className={styles.branchContainerL3}>
            <div className={styles.horizontalBarL3} />
            <div className={styles.level3Grid}>
              {/* Dept HRD */}
              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={deptHRD} index={4} />
              </div>

              {/* Dept PR */}
              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={deptPR} index={5} />
              </div>

              {/* Dept CIM */}
              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={deptCIM} index={6} />
              </div>

              {/* Dept IT */}
              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={deptIT} index={7} />
                <div className={styles.verticalStemBottom} />
              </div>
            </div>
          </div>

          {/* Branch Bar to Level 4 (3 Divisions) */}
          <div className={styles.branchContainerL4}>
            <div className={styles.horizontalBarL4} />
            <div className={styles.level4Grid}>
              {/* Div Networking */}
              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={divNet} index={8} />
              </div>

              {/* Div Programming */}
              <div className={styles.treeNode}>
                <div className={styles.verticalStemTop} />
                <StructureCard member={divProg} index={9} />
              </div>

              {/* Div Multimedia */}
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

