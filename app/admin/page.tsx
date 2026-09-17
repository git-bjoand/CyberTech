'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClipboardText, Buildings, Article, ArrowRight } from '@phosphor-icons/react';

interface StatsOverview {
  total: number;
  programming: number;
  networking: number;
  multimedia: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<StatsOverview>({
    total: 0,
    programming: 0,
    networking: 0,
    multimedia: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('cybertech_admin_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('/api/admin/registrations', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const items = data.data;
          setStats({
            total: items.length,
            programming: items.filter((i: any) => i.divisi1 === 'Programming').length,
            networking: items.filter((i: any) => i.divisi1 === 'Networking').length,
            multimedia: items.filter((i: any) => i.divisi1 === 'Multimedia').length,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Title Banner */}
      <div style={{ marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: 0, fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
          Dashboard Overview Management
        </h1>
        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
          Pusat kendali rekap pendaftaran, struktur DPH organisasi, dan konten website UKM CyberTech PNP.
        </p>
      </div>

      {/* Quick Stats Grid (Natural Card Design) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pendaftar</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
            {loading ? '...' : stats.total}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>Calon Anggota Baru</div>
        </div>

        <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Divisi Programming</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
            {loading ? '...' : stats.programming}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>Pilihan Utama</div>
        </div>

        <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Divisi Networking</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#c084fc', marginTop: '0.2rem' }}>
            {loading ? '...' : stats.networking}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>Pilihan Utama</div>
        </div>

        <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Divisi Multimedia</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fb923c', marginTop: '0.2rem' }}>
            {loading ? '...' : stats.multimedia}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.25rem' }}>Pilihan Utama</div>
        </div>
      </div>

      {/* Action Modules */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--admin-text-main)' }}>
        Modul Pengelolaan Sistem
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Card 1: Pendaftaran */}
        <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: '0.75rem', color: '#10b981' }}>
              <ClipboardText size={32} weight="duotone" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--admin-text-main)' }}>
              Kelola Pendaftaran Anggota
            </h3>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
              Lihat daftar calon anggota, cek foto bukti transfer, hubungi WhatsApp pendaftar, dan hapus/export data.
            </p>
          </div>
          <Link href="/admin/pendaftaran" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1.25rem', padding: '0.75rem 1rem', background: '#10b981', color: '#ffffff', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', minHeight: '44px' }}>
            <span>Buka Rekap Pendaftaran</span>
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>

        {/* Card 2: DPH & Struktur */}
        <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: '0.75rem', color: '#0284c7' }}>
              <Buildings size={32} weight="duotone" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--admin-text-main)' }}>
              Kelola DPH & Struktur Org
            </h3>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
              Atur hirarki DPH (Pembina → Ketua → BPH → Dept → Divisi), tambah/edit/hapus pejabat jika terjadi pergantian kepengurusan.
            </p>
          </div>
          <Link href="/admin/struktur" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1.25rem', padding: '0.75rem 1rem', background: '#0284c7', color: '#ffffff', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', minHeight: '44px' }}>
            <span>Kelola Hirarki DPH</span>
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>

        {/* Card 3: Konten Landing */}
        <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: '0.75rem', color: '#8b5cf6' }}>
              <Article size={32} weight="duotone" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--admin-text-main)' }}>
              Kelola Konten Landing
            </h3>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>
              Kelola daftar Acara/Events, Portofolio karya, dan foto Galeri kegiatan secara teratur dari dashboard.
            </p>
          </div>
          <Link href="/admin/konten" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1.25rem', padding: '0.75rem 1rem', background: '#334155', color: '#ffffff', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem', minHeight: '44px' }}>
            <span>Kelola Data Konten</span>
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </div>
    </div>
  );
}
