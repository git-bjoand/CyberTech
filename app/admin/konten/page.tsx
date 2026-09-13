'use client';

import React, { useState } from 'react';
import { events } from '@/lib/data/events';
import { portfolios } from '@/lib/data/portfolio';
import { photos } from '@/lib/data/gallery';

export default function AdminKontenPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'portfolio' | 'gallery'>('events');

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: 0 }}>
            Kelola Konten Landing Page
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Manajemen data Acara/Events, Portofolio Karya, dan Galeri Kegiatan.
          </p>
        </div>
      </div>

      {/* Tab Selection (Mobile First) */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('events')}
          style={{
            padding: '0.65rem 1.25rem',
            background: activeTab === 'events' ? '#10b981' : 'var(--admin-card-bg)',
            color: activeTab === 'events' ? '#ffffff' : 'var(--admin-text-muted)',
            border: '1px solid',
            borderColor: activeTab === 'events' ? '#10b981' : 'var(--admin-border)',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            minHeight: '44px',
          }}
        >
          📅 Acara / Events ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          style={{
            padding: '0.65rem 1.25rem',
            background: activeTab === 'portfolio' ? '#0284c7' : 'var(--admin-card-bg)',
            color: activeTab === 'portfolio' ? '#ffffff' : 'var(--admin-text-muted)',
            border: '1px solid',
            borderColor: activeTab === 'portfolio' ? '#0284c7' : 'var(--admin-border)',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            minHeight: '44px',
          }}
        >
          💻 Portofolio Karya ({portfolios.length})
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          style={{
            padding: '0.65rem 1.25rem',
            background: activeTab === 'gallery' ? '#8b5cf6' : 'var(--admin-card-bg)',
            color: activeTab === 'gallery' ? '#ffffff' : 'var(--admin-text-muted)',
            border: '1px solid',
            borderColor: activeTab === 'gallery' ? '#8b5cf6' : 'var(--admin-border)',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            minHeight: '44px',
          }}
        >
          🖼️ Galeri Kegiatan ({photos.length})
        </button>
      </div>

      {/* Content Views */}
      {activeTab === 'events' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-main)', margin: 0 }}>Daftar Acara & Kegiatan</h2>
            <button style={{ padding: '0.5rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              + Tambah Acara Baru
            </button>
          </div>

          <div style={{ overflowX: 'auto', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--admin-th-bg)', color: 'var(--admin-text-muted)', borderBottom: '1px solid var(--admin-border)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Judul Acara</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Tipe</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Tahun</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                      {ev.title}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {ev.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>
                      {ev.year || 2026}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button style={{ padding: '0.4rem 0.65rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        <button style={{ padding: '0.4rem 0.65rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-main)', margin: 0 }}>Daftar Portofolio Karya</h2>
            <button style={{ padding: '0.5rem 1rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              + Tambah Portofolio Baru
            </button>
          </div>

          <div style={{ overflowX: 'auto', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--admin-th-bg)', color: 'var(--admin-text-muted)', borderBottom: '1px solid var(--admin-border)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Nama Karya</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Kategori & Tags</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {portfolios.map((pf) => (
                  <tr key={pf.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                      {pf.title}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                        {pf.division}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
                        {pf.tags.join(', ')}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button style={{ padding: '0.4rem 0.65rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        <button style={{ padding: '0.4rem 0.65rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-main)', margin: 0 }}>Daftar Foto Galeri Kegiatan</h2>
            <button style={{ padding: '0.5rem 1rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              + Tambah Foto Galeri Baru
            </button>
          </div>

          <div style={{ overflowX: 'auto', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--admin-th-bg)', color: 'var(--admin-text-muted)', borderBottom: '1px solid var(--admin-border)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Kegiatan / Caption</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Kategori</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Tahun</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {photos.map((gl) => (
                  <tr key={gl.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                      {gl.alt}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {gl.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>
                      {gl.year}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button style={{ padding: '0.4rem 0.65rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        <button style={{ padding: '0.4rem 0.65rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
