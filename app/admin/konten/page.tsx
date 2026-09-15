'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function AdminKontenPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'portfolio' | 'gallery'>('events');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states from DB
  const [events, setEvents] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);

  // Modal / Form states
  const [editingItem, setEditingItem] = useState<{ type: 'events' | 'portfolio' | 'gallery'; item?: any } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'events' | 'portfolio' | 'gallery'; id: any; title: string } | null>(null);

  // Form input states
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTypeOrCategory, setFormTypeOrCategory] = useState('');
  const [formStatus, setFormStatus] = useState('upcoming');
  const [formYear, setFormYear] = useState(2026);
  const [formDate, setFormDate] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formInstagram, setFormInstagram] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formTags, setFormTags] = useState('');
  const [formIsPartnership, setFormIsPartnership] = useState(false);
  const [formPartner, setFormPartner] = useState('');
  const [formLink, setFormLink] = useState('');

  // Image compressor helper
  const compressImage = (file: File, maxWidth = 1000, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const fetchContent = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/content');
      const json = await res.json();
      if (json.success && json.data) {
        setEvents(json.data.events || []);
        setPortfolios(json.data.portfolios || []);
        setGallery(json.data.gallery || []);
      } else {
        setErrorMsg('Gagal memuat data konten.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const openForm = (type: 'events' | 'portfolio' | 'gallery', item?: any) => {
    setEditingItem({ type, item });
    setErrorMsg(null);
    setSuccessMsg(null);

    if (item) {
      if (type === 'events') {
        setFormTitle(item.title || '');
        setFormDesc(item.description || '');
        setFormTypeOrCategory(item.type || 'workshop');
        setFormStatus(item.status || 'upcoming');
        setFormYear(item.year || 2026);
        setFormDate(item.date || '');
        setFormImage(item.image || '');
        setFormInstagram(item.instagram || '');
        setFormIsFeatured(Boolean(item.isFeatured));
        setFormTags(Array.isArray(item.tags) ? item.tags.join(', ') : '');
      } else if (type === 'portfolio') {
        setFormTitle(item.title || '');
        setFormDesc(item.description || '');
        setFormTypeOrCategory(item.division || 'programming');
        setFormYear(item.year || 2026);
        setFormImage(item.image || '');
        setFormTags(Array.isArray(item.tags) ? item.tags.join(', ') : '');
        setFormIsPartnership(Boolean(item.isPartnership));
        setFormPartner(item.partner || '');
        setFormLink(item.link || '');
      } else if (type === 'gallery') {
        setFormTitle(item.alt || '');
        setFormTypeOrCategory(item.category || 'workshop');
        setFormYear(item.year || 2026);
        setFormImage(item.src || '');
      }
    } else {
      // New item default
      setFormTitle('');
      setFormDesc('');
      setFormTypeOrCategory(type === 'portfolio' ? 'programming' : 'workshop');
      setFormStatus('upcoming');
      setFormYear(2026);
      setFormDate('');
      setFormImage('');
      setFormInstagram('');
      setFormIsFeatured(false);
      setFormTags('');
      setFormIsPartnership(false);
      setFormPartner('');
      setFormLink('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { type, item } = editingItem;
    const isEdit = Boolean(item && item.id);

    try {
      let payloadData: any = {};
      const targetApiType = type === 'events' ? 'event' : type === 'portfolio' ? 'portfolio' : 'gallery';

      if (type === 'events') {
        payloadData = {
          id: isEdit ? item.id : undefined,
          title: formTitle.trim(),
          description: formDesc.trim(),
          type: formTypeOrCategory || 'workshop',
          status: formStatus,
          year: Number(formYear) || 2026,
          date: formDate.trim(),
          image: formImage.trim() || '/images/primary/cyberlogo.png',
          instagram: formInstagram.trim(),
          isFeatured: formIsFeatured,
          tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
        };
      } else if (type === 'portfolio') {
        payloadData = {
          id: isEdit ? item.id : undefined,
          title: formTitle.trim(),
          description: formDesc.trim(),
          division: formTypeOrCategory || 'programming',
          year: Number(formYear) || 2026,
          image: formImage.trim() || '/images/primary/cyberlogo.png',
          tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
          isPartnership: formIsPartnership,
          partner: formPartner.trim(),
          link: formLink.trim(),
        };
      } else if (type === 'gallery') {
        payloadData = {
          id: isEdit ? item.id : undefined,
          alt: formTitle.trim(),
          src: formImage.trim() || '/images/primary/cyberlogo.png',
          category: formTypeOrCategory || 'workshop',
          year: Number(formYear) || 2026,
        };
      }

      const res = await fetch('/api/admin/content', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: targetApiType, data: payloadData }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMsg(`Berhasil ${isEdit ? 'memperbarui' : 'menambahkan'} item.`);
        setEditingItem(null);
        await fetchContent();
      } else {
        setErrorMsg(json.error || 'Gagal menyimpan data.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setSaving(true);
    setErrorMsg(null);

    const targetApiType = itemToDelete.type === 'events' ? 'event' : itemToDelete.type === 'portfolio' ? 'portfolio' : 'gallery';

    try {
      const res = await fetch(`/api/admin/content?type=${targetApiType}&id=${itemToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSuccessMsg('Item berhasil dihapus.');
        setItemToDelete(null);
        await fetchContent();
      } else {
        setErrorMsg(json.error || 'Gagal menghapus data.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menghapus.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: 0 }}>
            Kelola Konten Landing Page (Supabase DB)
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Seluruh perubahan tersimpan langsung ke PostgreSQL Supabase dan ter-render di landing page.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Tab Selection */}
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
          }}
        >
          🖼️ Galeri Kegiatan ({gallery.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--admin-text-muted)' }}>
          <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(59, 130, 246, 0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem' }}>Memuat data dari database Supabase...</p>
        </div>
      ) : (
        <>
          {/* TAB EVENTS */}
          {activeTab === 'events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-main)', margin: 0 }}>Daftar Acara & Kegiatan</h2>
                <button
                  onClick={() => openForm('events')}
                  style={{ padding: '0.55rem 1.1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  + Tambah Acara Baru
                </button>
              </div>

              <div style={{ overflowX: 'auto', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--admin-th-bg)', color: 'var(--admin-text-muted)', borderBottom: '1px solid var(--admin-border)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Gambar</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Judul Acara</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Tipe & Status</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Tahun</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                          Belum ada acara. Silakan tambahkan acara baru.
                        </td>
                      </tr>
                    ) : (
                      events.map((ev) => (
                        <tr key={ev.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                          <td style={{ padding: '0.85rem 1rem', width: '70px' }}>
                            <img
                              src={ev.image || '/images/primary/cyberlogo.png'}
                              alt={ev.title}
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', background: '#030814' }}
                            />
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                            {ev.title}
                            {ev.isFeatured && (
                              <span style={{ marginLeft: '6px', background: 'rgba(59, 130, 246, 0.2)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                                Featured
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, marginRight: '4px' }}>
                              {ev.type}
                            </span>
                            <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--admin-text-muted)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                              {ev.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--admin-text-muted)' }}>
                            {ev.year || 2026}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => openForm('events', ev)}
                                style={{ padding: '0.4rem 0.75rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setItemToDelete({ type: 'events', id: ev.id, title: ev.title })}
                                style={{ padding: '0.4rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-main)', margin: 0 }}>Daftar Portofolio Karya</h2>
                <button
                  onClick={() => openForm('portfolio')}
                  style={{ padding: '0.55rem 1.1rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  + Tambah Portofolio Baru
                </button>
              </div>

              <div style={{ overflowX: 'auto', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--admin-th-bg)', color: 'var(--admin-text-muted)', borderBottom: '1px solid var(--admin-border)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Preview</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Nama Karya</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Divisi & Tags</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Tahun</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolios.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                          Belum ada portofolio. Silakan tambahkan karya baru.
                        </td>
                      </tr>
                    ) : (
                      portfolios.map((pf) => (
                        <tr key={pf.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                          <td style={{ padding: '0.85rem 1rem', width: '70px' }}>
                            <img
                              src={pf.image || '/images/primary/cyberlogo.png'}
                              alt={pf.title}
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', background: '#030814' }}
                            />
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                            {pf.title}
                            {pf.isPartnership && (
                              <span style={{ marginLeft: '6px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                                {pf.partner || 'Partner'}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                              {pf.division}
                            </span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
                              {Array.isArray(pf.tags) ? pf.tags.join(', ') : ''}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--admin-text-muted)' }}>
                            {pf.year || 2026}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => openForm('portfolio', pf)}
                                style={{ padding: '0.4rem 0.75rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setItemToDelete({ type: 'portfolio', id: pf.id, title: pf.title })}
                                style={{ padding: '0.4rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB GALLERY */}
          {activeTab === 'gallery' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-main)', margin: 0 }}>Daftar Foto Galeri Kegiatan</h2>
                <button
                  onClick={() => openForm('gallery')}
                  style={{ padding: '0.55rem 1.1rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  + Tambah Foto Galeri Baru
                </button>
              </div>

              <div style={{ overflowX: 'auto', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--admin-th-bg)', color: 'var(--admin-text-muted)', borderBottom: '1px solid var(--admin-border)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Foto</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Caption / Keterangan</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Kategori</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Tahun</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gallery.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                          Belum ada foto galeri. Silakan tambahkan foto baru.
                        </td>
                      </tr>
                    ) : (
                      gallery.map((gl) => (
                        <tr key={gl.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                          <td style={{ padding: '0.85rem 1rem', width: '70px' }}>
                            <img
                              src={gl.src || '/images/primary/cyberlogo.png'}
                              alt={gl.alt}
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', background: '#030814' }}
                            />
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                            {gl.alt}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                              {gl.category}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--admin-text-muted)' }}>
                            {gl.year || 2026}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => openForm('gallery', gl)}
                                style={{ padding: '0.4rem 0.75rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setItemToDelete({ type: 'gallery', id: gl.id, title: gl.alt })}
                                style={{ padding: '0.4rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL FORM TAMBAH / EDIT */}
      {editingItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', position: 'relative' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--admin-text-main)', fontSize: '1.2rem', fontWeight: 800 }}>
              {editingItem.item ? 'Edit Konten' : 'Tambah Konten Baru'} ({editingItem.type.toUpperCase()})
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>
                  {editingItem.type === 'gallery' ? 'Caption / Nama Foto *' : 'Judul / Nama *'}
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Masukkan judul..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-main)', fontSize: '0.875rem' }}
                />
              </div>

              {editingItem.type !== 'gallery' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>
                    Deskripsi *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Deskripsi singkat konten..."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-main)', fontSize: '0.875rem' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>
                    {editingItem.type === 'portfolio' ? 'Divisi *' : 'Kategori / Tipe *'}
                  </label>
                  {editingItem.type === 'portfolio' ? (
                    <select
                      value={formTypeOrCategory}
                      onChange={(e) => setFormTypeOrCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-main)', fontSize: '0.875rem' }}
                    >
                      <option value="programming">Programming</option>
                      <option value="networking">Networking</option>
                      <option value="multimedia">Multimedia</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  ) : editingItem.type === 'events' ? (
                    <select
                      value={formTypeOrCategory}
                      onChange={(e) => setFormTypeOrCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-main)', fontSize: '0.875rem' }}
                    >
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="annual">Annual / Tahunan</option>
                      <option value="webinar">Webinar</option>
                      <option value="collaboration">Collaboration</option>
                    </select>
                  ) : (
                    <select
                      value={formTypeOrCategory}
                      onChange={(e) => setFormTypeOrCategory(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-main)', fontSize: '0.875rem' }}
                    >
                      <option value="workshop">Workshop</option>
                      <option value="hackathon">Hackathon</option>
                      <option value="internal">Internal</option>
                    </select>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>
                    Tahun
                  </label>
                  <input
                    type="number"
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-main)', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              {/* Upload Gambar dengan Kompresi Canvas */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>
                  Gambar / Foto Konten
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <img
                    src={formImage || '/images/primary/cyberlogo.png'}
                    alt="Preview"
                    style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', background: '#030814', border: '1px solid var(--admin-border)' }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const compressed = await compressImage(file);
                        setFormImage(compressed);
                      }
                    }}
                    style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}
                  />
                </div>
                <input
                  type="text"
                  value={formImage.startsWith('data:') ? 'Foto terkompresi siap diupload' : formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="Atau masukkan path/URL foto (mis: /images/primary/programming.png)"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-main)', fontSize: '0.8rem' }}
                />
              </div>

              {editingItem.type === 'events' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-main)', fontSize: '0.875rem' }}
                    >
                      <option value="upcoming">Upcoming (Akan Datang)</option>
                      <option value="past">Past (Selesai)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={formInstagram}
                      onChange={(e) => setFormInstagram(e.target.value)}
                      placeholder="@cybertech_pnp"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-main)', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              )}

              {editingItem.type !== 'gallery' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>
                    Tags (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="React, Next.js, IoT..."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-main)', fontSize: '0.875rem' }}
                  />
                </div>
              )}

              {editingItem.type === 'events' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--admin-text-main)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                  />
                  Jadikan Featured Event Utama
                </label>
              )}

              {editingItem.type === 'portfolio' && (
                <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--admin-text-main)', cursor: 'pointer', marginBottom: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formIsPartnership}
                      onChange={(e) => setFormIsPartnership(e.target.checked)}
                    />
                    Proyek Kolaborasi / Kemitraan
                  </label>
                  {formIsPartnership && (
                    <input
                      type="text"
                      value={formPartner}
                      onChange={(e) => setFormPartner(e.target.value)}
                      placeholder="Nama Mitra / Partner (mis: Bank Indonesia)"
                      style={{ width: '100%', padding: '0.55rem 0.75rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', borderRadius: '6px', color: 'var(--admin-text-main)', fontSize: '0.875rem' }}
                    />
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--admin-border)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--admin-border)', color: 'var(--admin-text-muted)', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '0.6rem 1.4rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Konten'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {itemToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '1rem' }}>
          <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px', width: '100%', maxWidth: '400px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--admin-text-main)', fontSize: '1.1rem' }}>Hapus Konten?</h3>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', margin: '0 0 1.5rem 0' }}>
              Anda yakin ingin menghapus <strong>"{itemToDelete.title}"</strong>? Perubahan ini akan langsung diperbarui ke database.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setItemToDelete(null)}
                style={{ padding: '0.55rem 1.2rem', background: 'transparent', border: '1px solid var(--admin-border)', color: 'var(--admin-text-muted)', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                style={{ padding: '0.55rem 1.4rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
