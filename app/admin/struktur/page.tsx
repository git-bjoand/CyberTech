'use client';

import React, { useState, useEffect } from 'react';
import { PositionNode, OfficerNode } from '@/lib/data/structure-store';
import {
  TreeStructure,
  Users,
  User,
  Plus,
  X,
  Lightbulb,
  Camera,
  Sparkle,
  UploadSimple,
  Warning,
} from '@phosphor-icons/react';

export default function AdminStrukturPage() {
  const [activeTab, setActiveTab] = useState<'positions' | 'officers'>('positions');

  const [positions, setPositions] = useState<PositionNode[]>([]);
  const [officers, setOfficers] = useState<OfficerNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State for Master Jabatan
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<PositionNode | null>(null);
  const [posTitle, setPosTitle] = useState('');
  const [posDesc, setPosDesc] = useState('');
  const [posLevel, setPosLevel] = useState<number>(2);
  const [posParentId, setPosParentId] = useState<string>('');

  // Modal State for Pejabat Pengurus
  const [offModalOpen, setOffModalOpen] = useState(false);
  const [editingOff, setEditingOff] = useState<OfficerNode | null>(null);
  const [offName, setOffName] = useState('');
  const [offPositionId, setOffPositionId] = useState('');
  const [offPhoto, setOffPhoto] = useState('/images/primary/cyberlogo.png');
  const [offPhoto2, setOffPhoto2] = useState('/images/primary/maskot.png');
  const [previewHover, setPreviewHover] = useState(false);
  const [uploadingPhoto1, setUploadingPhoto1] = useState(false);
  const [uploadingPhoto2, setUploadingPhoto2] = useState(false);
  const [offPeriod, setOffPeriod] = useState('2025/2026');

  // Canvas image compression helper (identik dengan bukti pembayaran: auto compress file to data URL)
  const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
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

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<{ type: 'position' | 'officer'; id: string; name: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/structure');
      const data = await res.json();
      if (res.ok && data.success) {
        setPositions(data.positions || []);
        setOfficers(data.officers || []);
      } else {
        setErrorMsg(data.error || 'Gagal memuat data struktur DPH.');
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal terhubung ke server.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('cybertech_admin_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // --- HANDLERS UNTUK MASTER JABATAN ---
  const openAddPosModal = () => {
    setEditingPos(null);
    setPosTitle('');
    setPosDesc('');
    setPosLevel(2);
    setPosParentId('');
    setPosModalOpen(true);
  };

  const openEditPosModal = (pos: PositionNode) => {
    setEditingPos(pos);
    setPosTitle(pos.title);
    setPosDesc(pos.description || '');
    setPosLevel(pos.level);
    setPosParentId(pos.parentId || '');
    setPosModalOpen(true);
  };

  const handleSavePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posTitle.trim()) {
      alert('Nama wajib diisi.');
      return;
    }

    const method = editingPos ? 'PUT' : 'POST';

    const payload = {
      targetType: 'position',
      id: editingPos ? editingPos.id : undefined,
      title: posTitle.trim(),
      description: posDesc.trim(),
      level: posLevel,
      parentId: posParentId || null,
    };

    try {
      const res = await fetch('/api/admin/structure', {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Gagal menyimpan Struktur.');
      } else {
        setPosModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert('Terjadi kesalahan sistem saat menyimpan Struktur.');
    }
  };

  // --- HANDLERS UNTUK PEJABAT PENGURUS ---
  const handlePhoto1Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar (JPG, PNG, WebP).');
        return;
      }
      setUploadingPhoto1(true);
      try {
        const compressed = await compressImage(file, 800, 0.8);
        if (compressed) setOffPhoto(compressed);
      } catch (err) {
        alert('Gagal memproses gambar foto 1.');
      } finally {
        setUploadingPhoto1(false);
      }
    }
  };

  const handlePhoto2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar (JPG, PNG, WebP).');
        return;
      }
      setUploadingPhoto2(true);
      try {
        const compressed = await compressImage(file, 800, 0.8);
        if (compressed) setOffPhoto2(compressed);
      } catch (err) {
        alert('Gagal memproses gambar foto 2.');
      } finally {
        setUploadingPhoto2(false);
      }
    }
  };

  const openAddOffModal = () => {
    setEditingOff(null);
    setOffName('');
    setOffPositionId(positions.length > 0 ? positions[0].id : '');
    setOffPhoto('/images/primary/cyberlogo.png');
    setOffPhoto2('/images/primary/maskot.png');
    setOffPeriod('2025/2026');
    setPreviewHover(false);
    setOffModalOpen(true);
  };

  const openEditOffModal = (off: OfficerNode) => {
    setEditingOff(off);
    setOffName(off.name);
    setOffPositionId(off.positionId);
    setOffPhoto(off.photo || '/images/primary/cyberlogo.png');
    setOffPhoto2(off.photo2 || off.photo || '/images/primary/maskot.png');
    setOffPeriod(off.period || '2025/2026');
    setPreviewHover(false);
    setOffModalOpen(true);
  };

  const handleSaveOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offName.trim() || !offPositionId) {
      alert('Nama Pejabat dan Pilihan Jabatan wajib diisi.');
      return;
    }

    const method = editingOff ? 'PUT' : 'POST';

    const payload = {
      targetType: 'officer',
      id: editingOff ? editingOff.id : undefined,
      name: offName.trim(),
      positionId: offPositionId,
      photo: offPhoto || '/images/primary/cyberlogo.png',
      photo2: offPhoto2 || offPhoto || '/images/primary/maskot.png',
      period: offPeriod || '2025/2026',
    };

    try {
      const res = await fetch('/api/admin/structure', {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Gagal menyimpan data Pejabat.');
      } else {
        setOffModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert('Terjadi kesalahan sistem saat menyimpan data Pejabat.');
    }
  };

  // --- DELETE CONFIRMATION ---
  const handleDeleteConfirmed = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(
        `/api/admin/structure?id=${encodeURIComponent(itemToDelete.id)}&targetType=${itemToDelete.type}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || 'Gagal menghapus data.');
      } else {
        setItemToDelete(null);
        fetchData();
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  const getLevelBadge = (lvl: number) => {
    switch (lvl) {
      case 0: return { label: 'Pembina Org', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 1: return { label: 'Pimpinan Utama', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 2: return { label: 'BPH / Komisi / Badan', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' };
      case 3: return { label: 'Departemen', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)' };
      case 4: return { label: 'Divisi / Sub-Struktur', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' };
      default: return { label: `Level ${lvl}`, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };
    }
  };

  const getParentPosTitle = (pid?: string | null) => {
    if (!pid) return 'Akar Utama (Tanpa Atasan)';
    const parentPos = positions.find((p) => p.id === pid);
    return parentPos ? parentPos.title : 'Akar Utama';
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <TreeStructure size={26} weight="duotone" color="#38bdf8" />
            Kelola Struktur & Pejabat DPH
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Pemisahan tabel <strong style={{ color: '#38bdf8' }}>Struktur</strong> (Hirarki, Fungsi, Komisi) dan <strong style={{ color: '#10b981' }}>Pejabat Pengurus</strong> per periode.
          </p>
        </div>

        {/* 2 SEPARATE BUTTONS FOR 2 SEPARATE ACTIONS */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={openAddPosModal}
            style={{
              padding: '0.65rem 1.15rem',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              minHeight: '44px',
            }}
          >
            <Plus size={16} weight="bold" /> Tambah Struktur Baru
          </button>

          <button
            onClick={openAddOffModal}
            style={{
              padding: '0.65rem 1.15rem',
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              minHeight: '44px',
            }}
          >
            <Plus size={16} weight="bold" /> Tambah Pengurus Baru
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '0.85rem 1rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          {errorMsg}
        </div>
      )}

      {/* TAB SELECTOR */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('positions')}
          style={{
            padding: '0.65rem 1.25rem',
            background: activeTab === 'positions' ? '#0284c7' : 'var(--admin-card-bg)',
            color: activeTab === 'positions' ? '#ffffff' : 'var(--admin-text-muted)',
            border: '1px solid',
            borderColor: activeTab === 'positions' ? '#0284c7' : 'var(--admin-border)',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <TreeStructure size={18} weight={activeTab === 'positions' ? 'bold' : 'regular'} /> Tabel 1: Struktur & Hirarki ({positions.length})
        </button>

        <button
          onClick={() => setActiveTab('officers')}
          style={{
            padding: '0.65rem 1.25rem',
            background: activeTab === 'officers' ? '#10b981' : 'var(--admin-card-bg)',
            color: activeTab === 'officers' ? '#ffffff' : 'var(--admin-text-muted)',
            border: '1px solid',
            borderColor: activeTab === 'officers' ? '#10b981' : 'var(--admin-border)',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            minHeight: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Users size={18} weight={activeTab === 'officers' ? 'bold' : 'regular'} /> Tabel 2: Pejabat Pengurus ({officers.length})
        </button>
      </div>

      {/* TAB 1: TABEL STRUKTUR */}
      {activeTab === 'positions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--admin-text-main)', margin: 0 }}>
              Daftar Struktur, Komisi, & Hirarki Organisasi
            </h2>
            <button onClick={openAddPosModal} style={{ padding: '0.45rem 0.85rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              + Tambah Struktur
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>Memuat data struktur jabatan...</div>
          ) : positions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)', color: 'var(--admin-text-muted)' }}>
              Belum ada struktur terdaftar. Klik "+ Tambah Struktur Baru" untuk menambahkan.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--admin-th-bg)', color: 'var(--admin-th-color)', borderBottom: '1px solid var(--admin-border)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Nama Struktur</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Level Hirarki</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Turunan Dari (Atasan Struktur)</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Fungsi & Deskripsi Tugas</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => {
                    const badge = getLevelBadge(pos.level);
                    return (
                      <tr key={pos.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--admin-text-main)', minWidth: '200px' }}>
                          {pos.title}
                          <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace', fontWeight: 400 }}>
                            ID: {pos.id}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ background: badge.bg, color: badge.color, padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {badge.label}
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: 'var(--admin-text-muted)', fontSize: '0.825rem' }}>
                          <span style={{ background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                            {getParentPosTitle(pos.parentId)}
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: 'var(--admin-text-main)', fontSize: '0.825rem', lineHeight: '1.45', maxWidth: '320px' }}>
                          {pos.description ? (
                            <div>{pos.description}</div>
                          ) : (
                            <span style={{ color: 'var(--admin-text-muted)', fontStyle: 'italic' }}>Belum ada deskripsi fungsi.</span>
                          )}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => openEditPosModal(pos)}
                              style={{ padding: '0.4rem 0.65rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Edit Struktur
                            </button>
                            <button
                              onClick={() => setItemToDelete({ type: 'position', id: pos.id, name: pos.title })}
                              style={{ padding: '0.4rem 0.65rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TABEL PEJABAT PENGURUS */}
      {activeTab === 'officers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--admin-text-main)', margin: 0 }}>
              Daftar Pejabat Pengurus Alokasi Per Periode Kepengurusan
            </h2>
            <button onClick={openAddOffModal} style={{ padding: '0.45rem 0.85rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              + Assign Pejabat Baru
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>Memuat data pejabat pengurus...</div>
          ) : officers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)', color: 'var(--admin-text-muted)' }}>
              Belum ada pejabat yang dialokasikan. Klik "+ Assign / Tambah Pejabat Baru" untuk memasukkan pengurus.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--admin-th-bg)', color: 'var(--admin-th-color)', borderBottom: '1px solid var(--admin-border)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Foto (1: Utama / 2: Hover)</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Nama Pejabat</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Jabatan Organisasi (Relasi Master)</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Periode Kepengurusan</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((off) => {
                    const pos = positions.find((p) => p.id === off.positionId);
                    const badge = pos ? getLevelBadge(pos.level) : { label: 'General', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };

                    return (
                      <tr key={off.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div title="Foto 1: Utama" style={{ position: 'relative' }}>
                              <img
                                src={off.photo || '/images/primary/cyberlogo.png'}
                                alt="Foto 1"
                                style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', border: '1.5px solid #38bdf8', background: '#0f172a' }}
                              />
                              <span style={{ position: 'absolute', bottom: -3, right: -3, background: '#0284c7', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '1px 4px', borderRadius: '3px', lineHeight: '1' }}>1</span>
                            </div>
                            <div title="Foto 2: Hover Swap" style={{ position: 'relative' }}>
                              <img
                                src={off.photo2 || off.photo || '/images/primary/maskot.png'}
                                alt="Foto 2"
                                style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', border: '1.5px solid #10b981', background: '#0f172a' }}
                              />
                              <span style={{ position: 'absolute', bottom: -3, right: -3, background: '#10b981', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '1px 4px', borderRadius: '3px', lineHeight: '1' }}>2</span>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--admin-text-main)' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                            <User size={16} weight="bold" color="#10b981" />
                            {off.name}
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ color: '#0284c7', fontWeight: 700, fontSize: '0.9rem' }}>
                            {pos ? pos.title : 'Jabatan Tidak Ditemukan'}
                          </div>
                          <div style={{ marginTop: '0.2rem' }}>
                            <span style={{ background: badge.bg, color: badge.color, padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                              {badge.label}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: 'var(--admin-text-main)', fontFamily: 'monospace', fontWeight: 600 }}>
                          [{off.period || '2025/2026'}]
                        </td>

                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => openEditOffModal(off)}
                              style={{ padding: '0.4rem 0.65rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Edit Pejabat
                            </button>
                            <button
                              onClick={() => setItemToDelete({ type: 'officer', id: off.id, name: off.name })}
                              style={{ padding: '0.4rem 0.65rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: FORM MASTER JABATAN */}
      {posModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'var(--admin-modal-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}
          onClick={() => setPosModalOpen(false)}
        >
          <div
            style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', width: '100%', maxWidth: '520px', padding: '1.5rem', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPosModalOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Tutup"
            >
              <X size={16} weight="bold" />
            </button>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 1.25rem 0', color: 'var(--admin-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TreeStructure size={22} weight="duotone" color="#0284c7" />
              {editingPos ? 'Edit Struktur Jabatan' : 'Tambah Struktur Jabatan / Komisi Baru'}
            </h2>

            <form onSubmit={handleSavePosition}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 700 }}>
                  Nama Struktur Jabatan <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={posTitle}
                  onChange={(e) => setPosTitle(e.target.value)}
                  placeholder="Contoh: Komisi Disiplin / Kepala Divisi AI & Data"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '16px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 700 }}>
                  Fungsi & Deskripsi Tugas Jabatan:
                </label>
                <textarea
                  value={posDesc}
                  onChange={(e) => setPosDesc(e.target.value)}
                  placeholder="Deskripsikan fungsi, wewenang, dan tanggung jawab jabatan ini secara rinci."
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '15px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 700 }}>
                    Tingkat Level Hirarki (Angka) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={1}
                    value={posLevel}
                    onChange={(e) => setPosLevel(parseInt(e.target.value, 10) || 0)}
                    placeholder="Masukkan angka level (0 - 5)"
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '16px', outline: 'none' }}
                    required
                  />
                  <div style={{ marginTop: '0.45rem', fontSize: '0.75rem', color: 'var(--admin-text-muted)', lineHeight: '1.45', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.5rem 0.65rem', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-cyan, #38bdf8)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Lightbulb size={16} weight="bold" /> Panduan Tingkatan Level:
                    </div>
                    <div><strong>Level 0:</strong> Pembina (Disimpan di sistem, disembunyikan di landing)</div>
                    <div><strong>Level 1:</strong> Pimpinan Tertinggi (Ketua Umum)</div>
                    <div><strong>Level 2:</strong> Pengurus Harian Inti (Sekretaris Umum, Wakil Ketum, Bendahara Umum)</div>
                    <div><strong>Level 3:</strong> Kepala Departemen (HRD, PR, CIM, IT)</div>
                    <div><strong>Level 4+:</strong> Divisi Teknis & Staff Ahli (Networking, Programming, Multimedia, Staff Ahli ML, dll)</div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 700 }}>
                    Atasan Jabatan (Parent Position)
                  </label>
                  <select
                    value={posParentId}
                    onChange={(e) => setPosParentId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '16px', outline: 'none' }}
                  >
                    <option value="">-- Tanpa Atasan (Akar Utama) --</option>
                    {positions
                      .filter((p) => !editingPos || p.id !== editingPos.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (Level {p.level})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setPosModalOpen(false)}
                  style={{ padding: '0.75rem 1.25rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.75rem 1.5rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Simpan Struktur Jabatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM ASSIGN PEJABAT PENGURUS */}
      {offModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'var(--admin-modal-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}
          onClick={() => setOffModalOpen(false)}
        >
          <div
            style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', width: '100%', maxWidth: '580px', padding: '1.5rem', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOffModalOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Tutup"
            >
              <X size={16} weight="bold" />
            </button>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 1.25rem 0', color: 'var(--admin-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={22} weight="duotone" color="#10b981" />
              {editingOff ? 'Edit Pejabat Pengurus' : 'Assign / Tambah Pejabat Baru'}
            </h2>

            <form onSubmit={handleSaveOfficer}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 700 }}>
                  Nama Lengkap Pejabat <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={offName}
                  onChange={(e) => setOffName(e.target.value)}
                  placeholder="Contoh: Rayhan Ramadhan"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '16px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 700 }}>
                  Jabatan Organisasi (Relasi Struktur Jabatan) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={offPositionId}
                  onChange={(e) => setOffPositionId(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '16px', outline: 'none' }}
                  required
                >
                  <option value="">-- Pilih Jabatan Organisasi --</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (Level {p.level})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 700 }}>
                  Periode Kepengurusan:
                </label>
                <input
                  type="text"
                  value={offPeriod}
                  onChange={(e) => setOffPeriod(e.target.value)}
                  placeholder="2025/2026"
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '16px', outline: 'none' }}
                />
              </div>

              {/* DUAL PHOTO EDITORS (FOTO 1 UTAMA & FOTO 2 HOVER SWAP) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', background: 'var(--admin-input-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                {/* FOTO 1: UTAMA */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Camera size={16} weight="bold" /> Foto 1 (Utama / Default)
                    </label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>Normal</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <img
                      src={offPhoto || '/images/primary/cyberlogo.png'}
                      alt="Preview Foto 1"
                      style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '2px solid #38bdf8', background: '#020617' }}
                    />
                    <label
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.65rem',
                        background: '#0284c7',
                        color: '#fff',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: uploadingPhoto1 ? 'wait' : 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <UploadSimple size={14} weight="bold" />
                      {uploadingPhoto1 ? 'Mengompres...' : 'Pilih File Foto 1'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhoto1Upload}
                        disabled={uploadingPhoto1}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={offPhoto}
                    onChange={(e) => setOffPhoto(e.target.value)}
                    placeholder="/images/... atau data:image/..."
                    style={{ width: '100%', padding: '0.5rem', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                {/* FOTO 2: HOVER SWAP */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Sparkle size={16} weight="bold" /> Foto 2 (Hover / Swap)
                    </label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>Saat Kursor</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <img
                      src={offPhoto2 || offPhoto || '/images/primary/maskot.png'}
                      alt="Preview Foto 2"
                      style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '2px solid #10b981', background: '#020617' }}
                    />
                    <label
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.65rem',
                        background: '#10b981',
                        color: '#fff',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: uploadingPhoto2 ? 'wait' : 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <UploadSimple size={14} weight="bold" />
                      {uploadingPhoto2 ? 'Mengompres...' : 'Pilih File Foto 2'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhoto2Upload}
                        disabled={uploadingPhoto2}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={offPhoto2}
                    onChange={(e) => setOffPhoto2(e.target.value)}
                    placeholder="/images/... atau data:image/..."
                    style={{ width: '100%', padding: '0.5rem', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '4px', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* INTERACTIVE PREVIEW BOX */}
              <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', border: '1px dashed var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={previewHover ? (offPhoto2 || offPhoto) : offPhoto}
                    alt="Live Test"
                    style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', border: previewHover ? '2px solid #10b981' : '2px solid #38bdf8', transition: 'all 0.2s ease', background: '#020617' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--admin-text-main)' }}>
                      {offName.trim() || 'Nama Pejabat'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: previewHover ? '#10b981' : '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {previewHover ? (
                        <>
                          <Sparkle size={14} weight="bold" /> Menampilkan Foto 2 (Hover)
                        </>
                      ) : (
                        <>
                          <Camera size={14} weight="bold" /> Menampilkan Foto 1 (Utama)
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewHover(!previewHover)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    background: previewHover ? '#10b981' : '#38bdf8',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {previewHover ? 'Kembalikan Foto 1' : 'Uji Coba Swap Foto 2'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setOffModalOpen(false)}
                  style={{ padding: '0.75rem 1.25rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Simpan Pejabat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE CONFIRMATION */}
      {itemToDelete && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'var(--admin-modal-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}
          onClick={() => setItemToDelete(null)}
        >
          <div
            style={{ background: 'var(--admin-card-bg)', border: '1px solid #ef4444', borderRadius: '8px', width: '100%', maxWidth: '420px', padding: '1.5rem', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Warning size={28} weight="bold" color="#ef4444" />
              </div>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--admin-text-main)', marginBottom: '0.5rem' }}>
              Hapus {itemToDelete.type === 'position' ? 'Struktur Jabatan' : 'Data Pejabat'}?
            </h3>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.45' }}>
              Apakah Anda yakin ingin menghapus <strong style={{ color: 'var(--admin-text-main)' }}>{itemToDelete.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setItemToDelete(null)}
                style={{ flex: 1, padding: '0.75rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirmed}
                style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
