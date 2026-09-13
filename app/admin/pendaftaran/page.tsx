'use client';

import React, { useState, useEffect } from 'react';

interface RegistrationItem {
  registrationId: string;
  timestamp: string;
  nama: string;
  noHp?: string;
  jurusan: string;
  prodi: string;
  divisi1: string;
  divisi2: string;
  alasan: string;
  harapan: string;
  ipAddress: string;
  buktiPembayaran?: string;
}

export default function AdminPendaftaranPage() {
  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('All');

  // Modal State for viewing details
  const [selectedItem, setSelectedItem] = useState<RegistrationItem | null>(null);

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<RegistrationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Registration Status Control State (Open/Close toggle)
  const [regStatus, setRegStatus] = useState<{ isOpen: boolean; title: string; message: string } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const getAdminUsername = () => {
    try {
      const sessionStr = sessionStorage.getItem('cybertech_admin_user');
      if (sessionStr) {
        const u = JSON.parse(sessionStr);
        return u?.username || '';
      }
    } catch (e) {}
    return '';
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/registration-status');
      const data = await res.json();
      if (res.ok && data.success) {
        setRegStatus(data.settings);
      }
    } catch (e) {}
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const username = getAdminUsername();
      const res = await fetch('/api/admin/registrations', {
        headers: { 'x-admin-username': username },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Gagal mengambil data pendaftaran.');
        setLoading(false);
        return;
      }

      setItems(data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal terhubung ke server.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    fetchStatus();
  }, []);

  const handleToggleStatus = async (newIsOpen: boolean) => {
    setUpdatingStatus(true);
    const username = getAdminUsername();
    try {
      const res = await fetch('/api/admin/registration-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-username': username,
        },
        body: JSON.stringify({ isOpen: newIsOpen }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegStatus(data.settings);
      } else {
        alert(data.error || 'Gagal mengubah status pendaftaran.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat mengubah status pendaftaran.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const username = getAdminUsername();
      const res = await fetch(
        `/api/admin/registrations?registrationId=${encodeURIComponent(itemToDelete.registrationId)}`,
        {
          method: 'DELETE',
          headers: { 'x-admin-username': username },
        }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || 'Gagal menghapus pendaftaran.');
      } else {
        setItems((prev) => prev.filter((i) => i.registrationId !== itemToDelete.registrationId));
        setItemToDelete(null);
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus data.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.noHp && item.noHp.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.registrationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jurusan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prodi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDivisi =
      filterDivisi === 'All' || item.divisi1.toLowerCase() === filterDivisi.toLowerCase();

    return matchesSearch && matchesDivisi;
  });

  const exportToCSV = () => {
    if (items.length === 0) return;

    const headers = [
      'ID Registrasi',
      'Waktu Pendaftaran',
      'Nama Lengkap',
      'No. WhatsApp/HP',
      'Jurusan',
      'Program Studi',
      'Divisi 1',
      'Divisi 2',
      'Alasan Masuk',
      'Harapan',
      'IP Address',
    ];

    const rows = filteredItems.map((i) => [
      i.registrationId,
      new Date(i.timestamp).toLocaleString('id-ID'),
      `"${i.nama.replace(/"/g, '""')}"`,
      `"${(i.noHp || '').replace(/"/g, '""')}"`,
      `"${i.jurusan.replace(/"/g, '""')}"`,
      `"${i.prodi.replace(/"/g, '""')}"`,
      `"${i.divisi1.replace(/"/g, '""')}"`,
      `"${i.divisi2.replace(/"/g, '""')}"`,
      `"${i.alasan.replace(/"/g, '""')}"`,
      `"${i.harapan.replace(/"/g, '""')}"`,
      i.ipAddress,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Pendaftaran_CyberTech_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatWaUrl = (phone?: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--admin-border)', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: 0 }}>
              Kelola Rekap Pendaftaran Anggota
            </h1>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
              Manajemen calon anggota baru, kontak WhatsApp, bukti transfer, dan kontrol buka/tutup pendaftaran.
            </p>
          </div>

          {/* Registration Status Toggle Button */}
          {regStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', padding: '0.6rem 1rem', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Status Pendaftaran Publik:
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: regStatus.isOpen ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {regStatus.isOpen ? '🟢 DIBUKA (OPEN)' : '🔴 DITUTUP (CLOSED)'}
                </div>
              </div>

              <button
                onClick={() => handleToggleStatus(!regStatus.isOpen)}
                disabled={updatingStatus}
                style={{
                  padding: '0.55rem 1rem',
                  background: regStatus.isOpen ? '#ef4444' : '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {updatingStatus ? 'Memproses...' : regStatus.isOpen ? '🔒 Tutup Pendaftaran' : '🔓 Buka Pendaftaran'}
              </button>
            </div>
          )}
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '0.85rem 1rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Toolbar & Filters (Mobile First Stack) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', background: 'var(--admin-card-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <input
              type="text"
              placeholder="Cari Nama / HP / ID Registrasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.9rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '16px', outline: 'none' }}
            />
            <select
              value={filterDivisi}
              onChange={(e) => setFilterDivisi(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.9rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '16px', outline: 'none' }}
            >
              <option value="All">Semua Divisi ({items.length})</option>
              <option value="Programming">Programming</option>
              <option value="Networking">Networking</option>
              <option value="Multimedia">Multimedia</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', width: '100%' }}>
            <button
              onClick={fetchRegistrations}
              style={{ flex: 1, padding: '0.75rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', minHeight: '44px' }}
            >
              🔄 Refresh
            </button>
            <button
              onClick={exportToCSV}
              disabled={filteredItems.length === 0}
              style={{ flex: 1, padding: '0.75rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', minHeight: '44px' }}
            >
              📊 Export CSV ({filteredItems.length})
            </button>
          </div>
        </div>

        {/* Content List: Mobile Cards (< 640px) vs Table (>= 640px) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>Memuat data pendaftaran...</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)', color: 'var(--admin-text-muted)' }}>
            Belum ada data pendaftaran yang sesuai.
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div style={{ overflowX: 'auto', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--admin-th-bg)', color: 'var(--admin-th-color)', borderBottom: '1px solid var(--admin-border)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>ID & Nama</th>
                    <th style={{ padding: '0.85rem 1rem' }}>No. WhatsApp</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Jurusan / Prodi</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Divisi</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => (
                    <tr key={item.registrationId || idx} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontFamily: 'monospace', color: '#10b981', fontWeight: 700, fontSize: '0.8rem' }}>
                          {item.registrationId}
                        </div>
                        <div style={{ color: 'var(--admin-text-main)', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.1rem' }}>
                          {item.nama}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        {item.noHp ? (
                          <a
                            href={formatWaUrl(item.noHp)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            💬 {item.noHp}
                          </a>
                        ) : (
                          <span style={{ color: 'var(--admin-text-muted)' }}>-</span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: 'var(--admin-text-main)' }}>
                        {item.jurusan}
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{item.prodi}</div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.775rem', fontWeight: 600 }}>
                          {item.divisi1}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setSelectedItem(item)}
                            style={{ padding: '0.45rem 0.75rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Detail & Bukti
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            style={{ padding: '0.45rem 0.75rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Detail Pendaftar & Bukti Pembayaran */}
        {selectedItem && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'var(--admin-modal-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}
            onClick={() => setSelectedItem(null)}
          >
            <div
              style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>

              <div style={{ display: 'inline-block', padding: '0.2rem 0.6rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {selectedItem.registrationId}
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 1.25rem 0', color: 'var(--admin-text-main)' }}>
                Detail Pendaftar: {selectedItem.nama}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', background: 'var(--admin-input-bg)', padding: '1rem', borderRadius: '6px', marginBottom: '1.25rem', border: '1px solid var(--admin-border)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Nama Lengkap:</div>
                  <div style={{ fontWeight: 600, color: 'var(--admin-text-main)' }}>{selectedItem.nama}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>No. WhatsApp:</div>
                  <div style={{ fontWeight: 600, color: '#22c55e' }}>
                    {selectedItem.noHp ? (
                      <a href={formatWaUrl(selectedItem.noHp)} target="_blank" rel="noreferrer" style={{ color: '#22c55e' }}>
                        💬 {selectedItem.noHp}
                      </a>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Jurusan:</div>
                  <div style={{ color: 'var(--admin-text-main)' }}>{selectedItem.jurusan}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Prodi:</div>
                  <div style={{ color: 'var(--admin-text-main)' }}>{selectedItem.prodi}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Divisi Pilihan 1:</div>
                  <div style={{ fontWeight: 600, color: '#0284c7' }}>{selectedItem.divisi1}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Divisi Pilihan 2:</div>
                  <div style={{ color: 'var(--admin-text-main)' }}>{selectedItem.divisi2}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0284c7', marginBottom: '0.25rem' }}>Alasan Masuk:</div>
                <div style={{ background: 'var(--admin-input-bg)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', color: 'var(--admin-text-main)', lineHeight: '1.45', border: '1px solid var(--admin-border)' }}>
                  {selectedItem.alasan}
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0284c7', marginBottom: '0.25rem' }}>Harapan:</div>
                <div style={{ background: 'var(--admin-input-bg)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', color: 'var(--admin-text-main)', lineHeight: '1.45', border: '1px solid var(--admin-border)' }}>
                  {selectedItem.harapan}
                </div>
              </div>

              {/* Bukti Pembayaran */}
              <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-text-main)', marginBottom: '0.75rem' }}>
                  📷 Foto Bukti Pembayaran Transfer:
                </div>
                {selectedItem.buktiPembayaran && selectedItem.buktiPembayaran.startsWith('data:image/') ? (
                  <div style={{ textAlign: 'center', background: 'var(--admin-input-bg)', padding: '0.85rem', borderRadius: '6px', border: '1px dashed var(--admin-border)' }}>
                    <img
                      src={selectedItem.buktiPembayaran}
                      alt="Bukti Transfer"
                      style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '4px', margin: '0 auto 0.75rem auto' }}
                    />
                    <a
                      href={selectedItem.buktiPembayaran}
                      download={`Bukti_Transfer_${selectedItem.registrationId}.png`}
                      style={{ display: 'inline-flex', padding: '0.55rem 1rem', background: '#10b981', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}
                    >
                      ⬇️ Unduh Gambar Bukti Transfer
                    </a>
                  </div>
                ) : (
                  <div style={{ color: 'var(--admin-text-muted)', fontStyle: 'italic', padding: '0.85rem', background: 'var(--admin-input-bg)', borderRadius: '6px', textAlign: 'center', fontSize: '0.85rem' }}>
                    Tidak ada file gambar bukti pembayaran.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus */}
        {itemToDelete && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'var(--admin-modal-overlay)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}
            onClick={() => setItemToDelete(null)}
          >
            <div
              style={{ background: 'var(--admin-card-bg)', border: '1px solid #ef4444', borderRadius: '8px', width: '100%', maxWidth: '420px', padding: '1.5rem', textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--admin-text-main)', marginBottom: '0.5rem' }}>Hapus Data Pendaftaran?</h3>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.45' }}>
                Apakah Anda yakin ingin menghapus data pendaftaran milik <strong style={{ color: 'var(--admin-text-main)' }}>{itemToDelete.nama}</strong> ({itemToDelete.registrationId})? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                  style={{ flex: 1, padding: '0.75rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  disabled={isDeleting}
                  style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
