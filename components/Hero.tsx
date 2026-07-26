'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './Hero.module.css';
import { useLang } from '@/lib/context/LangContext';

export default function Hero() {
  const { lang } = useLang();
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const container = canvas.parentElement;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    // Particle setup
    const particleCount = 45;
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }

    const particles: Particle[] = [];
    const colors = ['#00d4ff', '#0099ff', '#e63946', '#ffffff'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Draw cursor attraction glow if mouse active
      if (mouse.active) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.15)');
        gradient.addColorStop(0.5, 'rgba(0, 153, 255, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 160, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse interaction force
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const angle = Math.atan2(dy, dx);
            const force = (140 - dist) / 140;
            p.x += Math.cos(angle) * force * 1.5;
            p.y += Math.sin(angle) * force * 1.5;

            // Connect line to cursor
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.4 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.15 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const content = {
    badge: {
      en: 'CyberTech PNP Organization',
      id: 'Organisasi CyberTech PNP',
    },
    title1: {
      en: 'Technology Can',
      id: 'Technology Can',
    },
    title2: {
      en: 'Unite Anything',
      id: 'Unite Anything',
    },
    subtitle: {
      en: 'Serving as a venue for creative expression, collaboration, and technological innovation at Politeknik Negeri Padang.',
      id: 'Menjadi wadah untuk berkarya, berkolaborasi, dan berinovasi dalam teknologi di Politeknik Negeri Padang.',
    },
    btnPrimary: {
      en: 'Join now',
      id: 'Daftar sekarang',
    },
    btnSecondary: {
      en: 'About Us',
      id: 'Tentang Kami',
    },
    stats: [
      { num: '2009', label: { en: 'Founded', id: 'Didirikan' } },
      { num: '16', label: { en: 'Generations', id: 'Generasi' } },
      { num: '3', label: { en: 'Divisions', id: 'Divisi' } },
    ],
  };

  return (
    <section id="home" className={`${styles.hero} ${mounted ? styles.fadeIn : ''}`}>
      <div className={styles.dotBackground}></div>
      <canvas ref={canvasRef} className={styles.particleCanvas} />

      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            <span className={styles.titleLine1}>{content.title1[lang as keyof typeof content.title1]}</span>
            <br />
            <span className={styles.titleLine2}>{content.title2[lang as keyof typeof content.title2]}</span>
          </h1>

          <p className={styles.subtitle}>
            {content.subtitle[lang as keyof typeof content.subtitle]}
          </p>

          <div className={styles.actions}>
            <button
              className={styles.btnPrimary}
              onClick={() => {
                const el = document.getElementById('portfolio');
                if (el) window.scrollTo({ top: el.offsetTop - 68, behavior: 'smooth' });
              }}
            >
              {content.btnPrimary[lang as keyof typeof content.btnPrimary]}
            </button>
            <button
              className={styles.btnSecondary}
              onClick={() => {
                const el = document.getElementById('about');
                if (el) window.scrollTo({ top: el.offsetTop - 68, behavior: 'smooth' });
              }}
            >
              {content.btnSecondary[lang as keyof typeof content.btnSecondary]}
            </button>
          </div>

          <div className={styles.statsRow}>
            {content.stats.map((stat, idx) => (
              <div key={idx} className={styles.statBlock}>
                <span className={styles.statNum}>{stat.num}</span>
                <span className={styles.statLabel}>{stat.label[lang as keyof typeof stat.label]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.scrollIndicator}>
        <svg className={styles.chevron} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </section>
  );
}

