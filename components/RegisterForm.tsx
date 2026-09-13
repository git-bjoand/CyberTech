'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './RegisterForm.module.css';
import { JURUSAN_LIST, DIVISI_LIST } from '@/lib/data/registration-options';
import { useLang } from '@/lib/context/LangContext';
import { useTheme } from '@/lib/context/ThemeContext';

interface SuccessData {
  registrationId: string;
  nama: string;
  divisi1: string;
  date: string;
}

export default function RegisterForm() {
  const { lang } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [noHp, setNoHp] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [prodi, setProdi] = useState('');
  const [availableProdi, setAvailableProdi] = useState<string[]>([]);
  const [divisi1, setDivisi1] = useState('');
  const [divisi2, setDivisi2] = useState('');
  const [alasan, setAlasan] = useState('');
  const [harapan, setHarapan] = useState('');
  const [buktiPembayaran, setBuktiPembayaran] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');

  // Bot protection state
  const [hpWebsite, setHpWebsite] = useState('');
  const [formStartTime, setFormStartTime] = useState<number>(0);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setFormStartTime(Date.now());
  }, []);

  // Update Prodi list whenever Jurusan changes
  const handleJurusanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedJurusanName = e.target.value;
    setJurusan(selectedJurusanName);
    setProdi('');

    const found = JURUSAN_LIST.find((j) => j.name === selectedJurusanName);
    if (found) {
      setAvailableProdi(found.prodi);
    } else {
      setAvailableProdi([]);
    }
  };

  // Image upload handler with base64 conversion & validation
  const processImageFile = (file: File) => {
    setErrorMsg(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('File bukti pembayaran harus berupa format gambar (JPG, PNG, atau WebP).');
      return;
    }

    // Validate file size max 5MB (5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file bukti pembayaran terlalu besar (Maksimal 5MB).');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');

    const reader = new FileReader();
    reader.onloadend = () => {
      setBuktiPembayaran(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setBuktiPembayaran('');
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side quick checks
    if (!nama.trim() || !noHp.trim() || !jurusan || !prodi || !divisi1 || !alasan.trim() || !harapan.trim()) {
      setErrorMsg('Harap lengkapi semua bidang isian yang wajib diisi (*).');
      return;
    }

    if (noHp.trim().length < 9) {
      setErrorMsg('Nomor WhatsApp / Handphone tidak valid (minimal 9 digit).');
      return;
    }

    if (!buktiPembayaran) {
      setErrorMsg('Harap unggah bukti pembayaran transfer pendaftaran.');
      return;
    }

    if (alasan.trim().length < 15) {
      setErrorMsg('Alasan masuk wajib diisi minimal 15 karakter.');
      return;
    }

    if (harapan.trim().length < 15) {
      setErrorMsg('Harapan wajib diisi minimal 15 karakter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: nama.trim(),
          noHp: noHp.trim(),
          jurusan,
          prodi,
          divisi1,
          divisi2: divisi2 || 'Tidak ada',
          buktiPembayaran,
          alasan: alasan.trim(),
          harapan: harapan.trim(),
          hp_website: hpWebsite, // Honeypot field
          form_start_time: formStartTime,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Gagal mengirim pendaftaran. Silakan coba lagi.');
        setIsSubmitting(false);
        return;
      }

      setSuccessData(data.data);
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi gangguan koneksi jaringan. Harap periksa koneksi internet Anda.');
      setIsSubmitting(false);
    }
  };

  const copyTicketId = () => {
    if (successData?.registrationId) {
      navigator.clipboard.writeText(successData.registrationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (successData) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.successCard}>
          <div className={styles.successIconWrap}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Pendaftaran Berhasil!
          </h2>
          <p className={styles.successDesc}>
            Selamat <strong style={{ color: '#34d399' }}>{successData.nama}</strong>! Berkas pendaftaran Anda untuk Divisi <strong style={{ color: '#38bdf8' }}>{successData.divisi1}</strong> UKM CyberTech PNP telah berhasil kami terima.
          </p>

          <div className={styles.ticketIdBox}>
            <div className={styles.ticketLabel}>Nomor Registrasi Anda</div>
            <div className={styles.ticketValue}>{successData.registrationId}</div>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '2rem' }}>
            Tanggal Pendaftaran: {successData.date}
          </p>

          <div className={styles.btnGroup}>
            <button className={styles.copyIdBtn} onClick={copyTicketId}>
              {copied ? '✓ Kode Tersalin!' : '📋 Salin Kode Registrasi'}
            </button>
            <Link href="/" className={styles.backHomeBtn}>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerCard}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <div className={styles.badge}>
            <span className={styles.dot}></span> Open Recruitment 2026
          </div>
        </div>
        <h1 className={styles.title}>Form Pendaftaran UKM CyberTech</h1>
        <p className={styles.subtitle}>
          Bergabunglah menjadi bagian dari komunitas IT terbesar Politeknik Negeri Padang. Isi formulir pendaftaran di bawah ini secara cermat.
        </p>
      </div>

      <div className={styles.formCard}>
        {errorMsg && (
          <div className={styles.alertError}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Honeypot field for bot trap (hidden) */}
          <div className={styles.hpField}>
            <input
              type="text"
              name="hp_website"
              value={hpWebsite}
              onChange={(e) => setHpWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* 1. Nama Lengkap & No. WhatsApp */}
          <div className={styles.gridTwo}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Nama Lengkap <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="Contoh: Budi Pratama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                No. WhatsApp / Handphone <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                className={styles.input}
                placeholder="Contoh: 081234567890"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                required
              />
              <span className={styles.hint}>Aktif WhatsApp untuk info seleksi & wawancara.</span>
            </div>
          </div>

          {/* 2. Jurusan & 3. Prodi */}
          <div className={styles.gridTwo}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Jurusan <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                value={jurusan}
                onChange={handleJurusanChange}
                required
              >
                <option value="">-- Pilih Jurusan PNP --</option>
                {JURUSAN_LIST.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Program Studi (Prodi) <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                value={prodi}
                onChange={(e) => setProdi(e.target.value)}
                disabled={!jurusan || availableProdi.length === 0}
                required
              >
                <option value="">
                  {!jurusan ? '-- Pilih Jurusan Terlebih Dahulu --' : '-- Pilih Program Studi --'}
                </option>
                {availableProdi.map((p, idx) => (
                  <option key={idx} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Divisi Pilihan 1 & 5. Divisi Pilihan 2 */}
          <div className={styles.gridTwo}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Divisi Pilihan 1 <span className={styles.required}>*</span>
              </label>
              <select
                className={styles.select}
                value={divisi1}
                onChange={(e) => setDivisi1(e.target.value)}
                required
              >
                <option value="">-- Pilih Divisi Utama --</option>
                {DIVISI_LIST.map((div) => (
                  <option key={div.id} value={div.name}>
                    {div.name} ({div.badge})
                  </option>
                ))}
              </select>
              <span className={styles.hint}>Divisi prioritas utama yang ingin kamu tekuni.</span>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Divisi Pilihan 2 (Opsional)</label>
              <select
                className={styles.select}
                value={divisi2}
                onChange={(e) => setDivisi2(e.target.value)}
              >
                <option value="">-- Tidak ada / Pilihan 2 Opsional --</option>
                {DIVISI_LIST.filter((div) => div.name !== divisi1).map((div) => (
                  <option key={div.id} value={div.name}>
                    {div.name} ({div.badge})
                  </option>
                ))}
              </select>
              <span className={styles.hint}>Divisi cadangan minat kedua kamu.</span>
            </div>
          </div>

          {/* 6. Bukti Pembayaran Pendaftaran */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Bukti Pembayaran Pendaftaran <span className={styles.required}>*</span>
            </label>
            <span className={styles.hint} style={{ marginBottom: '0.5rem' }}>
              Unggah foto / screenshot transfer pendaftaran (JPG, PNG, WebP - Maksimal 5MB).
            </span>

            {!buktiPembayaran ? (
              <div
                className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={styles.fileInputHidden}
                  onChange={handleFileChange}
                />
                <div className={styles.uploadIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <div className={styles.uploadText}>
                  Drag & drop gambar bukti transfer di sini atau <span>Klik untuk Pilih File</span>
                </div>
              </div>
            ) : (
              <div className={styles.previewContainer}>
                <img src={buktiPembayaran} alt="Bukti Pembayaran" className={styles.previewImage} />
                <button
                  type="button"
                  className={styles.removeFileBtn}
                  onClick={handleRemoveFile}
                  title="Hapus gambar"
                >
                  ✕
                </button>
                <div className={styles.fileMeta}>
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                    {fileName}
                  </span>
                  <span>{fileSize}</span>
                </div>
              </div>
            )}
          </div>

          {/* 7. Alasan Masuk */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Alasan Masuk UKM CyberTech <span className={styles.required}>*</span>
            </label>
            <textarea
              className={styles.textarea}
              placeholder="Ceritakan motivasi dan alasan utama kamu ingin bergabung dengan UKM CyberTech PNP..."
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              rows={4}
              required
            />
            <span className={styles.hint}>Minimal 15 karakter. ({alasan.length} karakter)</span>
          </div>

          {/* 8. Harapan */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Harapan Kamu Setelah Bergabung <span className={styles.required}>*</span>
            </label>
            <textarea
              className={styles.textarea}
              placeholder="Apa skill, pengalaman, atau target yang ingin kamu capai di UKM CyberTech..."
              value={harapan}
              onChange={(e) => setHarapan(e.target.value)}
              rows={4}
              required
            />
            <span className={styles.hint}>Minimal 15 karakter. ({harapan.length} karakter)</span>
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className={styles.spinner}></span>
                <span>Memproses Pendaftaran...</span>
              </>
            ) : (
              <>
                <span>Kirim Pendaftaran</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
