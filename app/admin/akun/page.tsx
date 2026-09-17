'use client';

import React, { useState, useEffect } from 'react';
import { UsersThree, UserPlus, ShieldCheck, PencilSimple, X } from '@phosphor-icons/react';

interface AdminAccount {
  id: number;
  username: string;
  fullName: string;
  role: string;
  createdAt?: string;
}

export default function AdminAkunPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);

  // Form states for new admin creation (Internal Only)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for Edit Account Modal
  const [editAccModal, setEditAccModal] = useState<{ show: boolean; targetAcc: AdminAccount | null }>({ show: false, targetAcc: null });
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('admin');
  const [editPassword, setEditPassword] = useState('');
  const [isUpdatingAcc, setIsUpdatingAcc] = useState(false);

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('cybertech_admin_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  useEffect(() => {
    const sessionStr = sessionStorage.getItem('cybertech_admin_user');
    if (sessionStr) {
      try {
        const u = JSON.parse(sessionStr);
        setCurrentUser(u);
      } catch (e) {}
    }
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/accounts', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAccounts(data.data);
      }
    } catch (err) {
      console.error('Error fetching admin accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openEditModal = (acc: AdminAccount) => {
    setEditAccModal({ show: true, targetAcc: acc });
    setEditFullName(acc.fullName);
    setEditUsername(acc.username);
    setEditRole(acc.role);
    setEditPassword('');
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !fullName) return;

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ username, password, fullName, role }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: data.message || 'Akun admin berhasil ditambahkan!' });
        setUsername('');
        setPassword('');
        setFullName('');
        setRole('admin');
        setShowAddModal(false);
        fetchAccounts();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Gagal membuat akun admin.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Terjadi kesalahan sistem saat membuat akun.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAccountEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccModal.targetAcc || !editFullName || !editUsername) return;

    setIsUpdatingAcc(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          id: editAccModal.targetAcc.id,
          username: editAccModal.targetAcc.username,
          newUsername: editUsername,
          fullName: editFullName,
          role: editRole,
          newPassword: editPassword || undefined,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: data.message || `Akun @${editUsername} berhasil diperbarui!` });
        setEditAccModal({ show: false, targetAcc: null });
        fetchAccounts();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Gagal mengubah data akun.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Gagal menghubungi server untuk update akun.' });
    } finally {
      setIsUpdatingAcc(false);
    }
  };

  const handleDeleteAccount = async (id: number, username: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun admin @${username}?`)) return;

    try {
      const res = await fetch(`/api/admin/accounts?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: `Akun @${username} berhasil dihapus.` });
        fetchAccounts();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Gagal menghapus akun.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Gagal menghapus akun admin.' });
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header & Internal Security Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UsersThree size={26} weight="duotone" color="#38bdf8" />
            Kelola Akun Admin
          </h1>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Pendaftaran akun admin <strong style={{ color: '#10b981' }}>hanya bisa dilakukan di dalam portal ini</strong> (Internal Only).
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setStatusMsg(null);
          }}
          style={{
            padding: '0.65rem 1.25rem',
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
          <UserPlus size={16} weight="bold" /> Registrasi Akun Admin Baru
        </button>
      </div>

      {/* Security Badge */}
      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '0.85rem 1.15rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ShieldCheck size={22} weight="bold" />
        <div>
          <strong>Akses Terproteksi Intern:</strong> Tidak ada form registrasi publik di luar halaman admin. Pembuatan akun baru sepenuhnya terkontrol dari internal portal ini untuk menjaga keamanan database.
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '0.85rem 1rem', background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: `1px solid ${statusMsg.type === 'success' ? '#10b981' : '#ef4444'}`, color: statusMsg.type === 'success' ? '#10b981' : '#ef4444', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {statusMsg.text}
        </div>
      )}

      {/* Accounts Table */}
      <div style={{ overflowX: 'auto', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-card-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--admin-th-bg)', color: 'var(--admin-text-muted)', borderBottom: '1px solid var(--admin-border)' }}>
              <th style={{ padding: '0.85rem 1rem' }}>ID</th>
              <th style={{ padding: '0.85rem 1rem' }}>Nama Lengkap</th>
              <th style={{ padding: '0.85rem 1rem' }}>Username</th>
              <th style={{ padding: '0.85rem 1rem' }}>Role</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Memuat data akun admin...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Belum ada akun admin terdaftar.
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr key={acc.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                    #{acc.id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                    {acc.fullName}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#0284c7', fontFamily: 'monospace' }}>
                    @{acc.username}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', background: acc.role === 'superadmin' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(56, 189, 248, 0.15)', color: acc.role === 'superadmin' ? '#8b5cf6' : '#0284c7', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {acc.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {(currentUser?.username?.toLowerCase() === 'admin' || currentUser?.role === 'superadmin' || currentUser?.username?.toLowerCase() === acc.username.toLowerCase()) && (
                        <button
                          onClick={() => openEditModal(acc)}
                          style={{ padding: '0.4rem 0.65rem', background: '#0284c7', border: 'none', color: '#ffffff', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <PencilSimple size={13} weight="bold" /> Edit Akun
                        </button>
                      )}

                      {acc.username.toLowerCase() !== 'admin' && (currentUser?.username?.toLowerCase() === 'admin' || currentUser?.role === 'superadmin') && (
                        <button
                          onClick={() => handleDeleteAccount(acc.id, acc.username)}
                          style={{ padding: '0.4rem 0.65rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Edit Akun Administrator */}
      {editAccModal.show && editAccModal.targetAcc && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--admin-modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 999 }}>
          <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '8px', width: '100%', maxWidth: '440px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PencilSimple size={18} weight="bold" color="#0284c7" /> Edit Akun @{editAccModal.targetAcc.username}
              </h2>
              <button onClick={() => setEditAccModal({ show: false, targetAcc: null })} style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Tutup"><X size={18} weight="bold" /></button>
            </div>

            <form onSubmit={handleSaveAccountEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 600 }}>Nama Lengkap</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 600 }}>Username Login</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                  disabled={editAccModal.targetAcc.username.toLowerCase() === 'admin'}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: editAccModal.targetAcc.username.toLowerCase() === 'admin' ? 'var(--admin-th-bg)' : 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 600 }}>Role / Hak Akses</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  disabled={currentUser?.username?.toLowerCase() !== 'admin' && currentUser?.role !== 'superadmin'}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '0.9rem' }}
                >
                  <option value="admin">Admin Biasa</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 600 }}>Password Baru (Opsional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditAccModal({ show: false, targetAcc: null })}
                  style={{ padding: '0.65rem 1rem', background: 'transparent', border: '1px solid var(--admin-border)', color: 'var(--admin-text-muted)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAcc}
                  style={{ padding: '0.65rem 1.25rem', background: '#0284c7', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 700, cursor: isUpdatingAcc ? 'not-allowed' : 'pointer' }}
                >
                  {isUpdatingAcc ? 'Menyimpan...' : 'Simpan Perubahan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrasi Akun Admin Baru (Internal Only) */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--admin-modal-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 999 }}>
          <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-card-border)', borderRadius: '10px', width: '100%', maxWidth: '480px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--admin-border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-text-main)', margin: 0 }}>
                Registrasi Akun Admin Baru (Intern)
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Tutup"><X size={18} weight="bold" /></button>
            </div>

            <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 600 }}>Nama Lengkap Administrator</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 600 }}>Username Login</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: budi_admin"
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 600 }}>Password Akun</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password aman"
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--admin-text-main)', marginBottom: '0.35rem', fontWeight: 600 }}>Role / Hak Akses</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-input-border)', color: 'var(--admin-text-main)', borderRadius: '6px', fontSize: '0.9rem' }}
                >
                  <option value="admin">Admin Biasa</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.65rem 1rem', background: 'transparent', border: '1px solid var(--admin-border)', color: 'var(--admin-text-muted)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.65rem 1.25rem', background: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Akun Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
