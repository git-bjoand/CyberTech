import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Connection pool configuration
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

let pool: Pool | null = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

let tableInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Ensures the PostgreSQL registrations table exists with all columns including no_hp
 */
export async function initDb() {
  if (!pool || tableInitialized) return;

  if (!initPromise) {
    initPromise = (async () => {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS registrations (
          id SERIAL PRIMARY KEY,
          registration_id VARCHAR(50) UNIQUE NOT NULL,
          nama VARCHAR(150) NOT NULL,
          no_hp VARCHAR(30) DEFAULT '',
          jurusan VARCHAR(150) NOT NULL,
          prodi VARCHAR(150) NOT NULL,
          divisi1 VARCHAR(100) NOT NULL,
          divisi2 VARCHAR(100) DEFAULT 'Tidak ada',
          bukti_pembayaran TEXT NOT NULL,
          alasan TEXT NOT NULL,
          harapan TEXT NOT NULL,
          ip_address VARCHAR(45) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE registrations ADD COLUMN IF NOT EXISTS no_hp VARCHAR(30) DEFAULT '';
        ALTER TABLE registrations ADD COLUMN IF NOT EXISTS alasan_divisi1 TEXT DEFAULT '';
        ALTER TABLE registrations ADD COLUMN IF NOT EXISTS alasan_divisi2 TEXT DEFAULT '';

        CREATE TABLE IF NOT EXISTS dph_structure (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          role VARCHAR(150) NOT NULL,
          description TEXT DEFAULT '',
          level INT NOT NULL DEFAULT 1,
          parent_id VARCHAR(50),
          photo TEXT DEFAULT '',
          period VARCHAR(50) DEFAULT '2025/2026',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        ALTER TABLE dph_structure ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

        CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          type VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL,
          year INT DEFAULT 2026,
          date VARCHAR(100),
          image TEXT NOT NULL,
          instagram VARCHAR(100),
          is_featured BOOLEAN DEFAULT FALSE,
          tags TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS portfolios (
          id SERIAL PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          division VARCHAR(50) NOT NULL,
          year INT DEFAULT 2026,
          image TEXT NOT NULL,
          tags TEXT[] DEFAULT '{}',
          is_partnership BOOLEAN DEFAULT FALSE,
          partner VARCHAR(100),
          link TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS gallery_photos (
          id SERIAL PRIMARY KEY,
          src TEXT NOT NULL,
          alt VARCHAR(200) NOT NULL,
          category VARCHAR(50) NOT NULL,
          year INT DEFAULT 2026,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS admin_accounts (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name VARCHAR(150) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS site_settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL
        );
      `;

      await pool!.query(createTableQuery);

      // Seed initial admin account if table is empty
      const checkAdmin = await pool!.query('SELECT COUNT(*) FROM admin_accounts');
      if (parseInt(checkAdmin.rows[0].count, 10) === 0) {
        await pool!.query(
          'INSERT INTO admin_accounts (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
          ['admin', 'cybertech2026', 'Super Admin CyberTech', 'superadmin']
        );
        console.log('✓ Default Admin Account seeded into PostgreSQL.');
      }

      // Seed initial DPH structure if table is empty
      const checkCount = await pool!.query('SELECT COUNT(*) FROM dph_structure');
      if (parseInt(checkCount.rows[0].count, 10) === 0) {
        const initialDph = [
          { id: 'dph-0', name: 'Fazrol Rozi, M.Cs.', role: 'Pembina UKM CyberTech', level: 0, parentId: null, photo: '/images/primary/cyberlogo.png', period: '2025/2026' },
          { id: 'dph-1', name: 'Rayhan Ramadhan', role: 'Ketua Umum', level: 1, parentId: 'dph-0', photo: '/images/primary/cyberlogo.png', period: '2025/2026' },
          { id: 'dph-2', name: 'Farel Al Furqan', role: 'Wakil Ketua Umum', level: 2, parentId: 'dph-1', photo: '/images/primary/cyberlogo.png', period: '2025/2026' },
          { id: 'dph-3', name: 'Dhannisya', role: 'Sekretaris Umum', level: 2, parentId: 'dph-1', photo: '/images/primary/cyberlogo.png', period: '2025/2026' },
          { id: 'dph-4', name: 'Sukra Sriwita', role: 'Bendahara Umum', level: 2, parentId: 'dph-1', photo: '/images/primary/cyberlogo.png', period: '2025/2026' },
          { id: 'dph-5', name: 'Rayfo Huda', role: 'Kepala Departemen HRD', level: 3, parentId: 'dph-1', photo: '/images/primary/cyberlogo.png', period: '2025/2026' },
          { id: 'dph-6', name: 'Muhammad Raihan Pramana Wiguna', role: 'Kepala Departemen PR', level: 3, parentId: 'dph-1', photo: '/images/primary/cyberlogo.png', period: '2025/2026' },
          { id: 'dph-7', name: 'Muhammad Hafizh Boyensa', role: 'Kepala Departemen CIM', level: 3, parentId: 'dph-1', photo: '/images/primary/cyberlogo.png', period: '2025/2026' },
          { id: 'dph-8', name: 'Muhammad Rofiqul Islamy', role: 'Kepala Departemen IT', level: 3, parentId: 'dph-1', photo: '/images/primary/programming.png', period: '2025/2026' },
          { id: 'dph-9', name: 'Bagastio Putra Joandri', role: 'Kepala Divisi Programming', level: 4, parentId: 'dph-8', photo: '/images/primary/programming.png', period: '2025/2026' },
          { id: 'dph-10', name: 'Muhammad Luthfi', role: 'Kepala Divisi Networking', level: 4, parentId: 'dph-8', photo: '/images/primary/networking.png', period: '2025/2026' },
          { id: 'dph-11', name: 'Zahwa Rahmadhania', role: 'Kepala Divisi Multimedia', level: 4, parentId: 'dph-7', photo: '/images/primary/multimedia.png', period: '2025/2026' },
        ];

        for (const node of initialDph) {
          await pool!.query(
            'INSERT INTO dph_structure (id, name, role, level, parent_id, photo, period) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [node.id, node.name, node.role, node.level, node.parentId, node.photo, node.period]
          );
        }
        console.log('✓ Initial DPH structure seeded into PostgreSQL.');
      }

      // Seed events if empty
      const checkEvents = await pool!.query('SELECT COUNT(*) FROM events');
      if (parseInt(checkEvents.rows[0].count, 10) === 0) {
        const initialEvents = [
          { id: 1, title: 'Hackathon Nasional CyberTech', description: 'Event tahunan bergengsi berupa live coding selama 24 jam non-stop.', type: 'annual', status: 'upcoming', year: 2026, image: '/images/primary/programming.png', instagram: '@hackathon_cybertech', isFeatured: true, tags: ['24 Jam', 'Nasional', 'Live Coding', 'Tahunan'] },
          { id: 2, title: 'Workshop Web Development', description: 'Workshop intensif pengembangan web modern menggunakan teknologi terkini.', type: 'workshop', status: 'past', year: 2025, image: '/images/primary/programming.png', instagram: '', isFeatured: false, tags: ['Workshop', 'Web Dev', 'Intensif'] },
          { id: 3, title: 'Seminar Cyber Security', description: 'Seminar tentang keamanan siber, etika hacking, dan pentingnya perlindungan data digital.', type: 'seminar', status: 'past', year: 2025, image: '/images/primary/networking.png', instagram: '', isFeatured: false, tags: ['Seminar', 'Cybersecurity', 'Awareness'] },
        ];

        for (const ev of initialEvents) {
          await pool!.query(
            'INSERT INTO events (id, title, description, type, status, year, image, instagram, is_featured, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [ev.id, ev.title, ev.description, ev.type, ev.status, ev.year, ev.image, ev.instagram, ev.isFeatured, ev.tags]
          );
        }
        console.log('✓ Initial Events seeded into PostgreSQL.');
      }

      tableInitialized = true;
      console.log('✓ PostgreSQL tables initialized.');
    })().catch((err) => {
      console.error('Error initializing PostgreSQL tables:', err);
      initPromise = null;
    });
  }

  return initPromise;
}

export interface RegistrationRecord {
  registrationId: string;
  nama: string;
  noHp: string;
  jurusan: string;
  prodi: string;
  divisi1: string;
  divisi2: string;
  buktiPembayaran: string;
  alasanDivisi1: string;
  alasanDivisi2: string;
  alasan?: string;
  harapan?: string;
  ipAddress: string;
  timestamp?: string;
}

/**
 * Inserts a new registration record into PostgreSQL (or JSON fallback)
 */
export async function saveRegistrationRecord(record: RegistrationRecord): Promise<boolean> {
  const alasanDiv1 = record.alasanDivisi1 || record.alasan || '';
  const alasanDiv2 = record.alasanDivisi2 || record.harapan || '';

  if (pool) {
    try {
      await initDb();
      const insertQuery = `
        INSERT INTO registrations (
          registration_id, nama, no_hp, jurusan, prodi, divisi1, divisi2,
          bukti_pembayaran, alasan, harapan, alasan_divisi1, alasan_divisi2, ip_address
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;
      await pool.query(insertQuery, [
        record.registrationId,
        record.nama,
        record.noHp || '',
        record.jurusan,
        record.prodi,
        record.divisi1,
        record.divisi2 || 'Tidak ada',
        record.buktiPembayaran,
        alasanDiv1,
        alasanDiv2,
        alasanDiv1,
        alasanDiv2,
        record.ipAddress,
      ]);
      return true;
    } catch (err) {
      console.error('PostgreSQL insert error:', err);
      // Fallback to JSON if DB write fails
    }
  }

  // Fallback to local JSON file storage
  try {
    const dataDir = path.join(process.cwd(), 'lib', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, 'registrations.json');
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (fileContent.trim()) {
        existingData = JSON.parse(fileContent);
      }
    }
    existingData.push({
      ...record,
      alasanDivisi1: alasanDiv1,
      alasanDivisi2: alasanDiv2,
      timestamp: new Date().toISOString(),
    });
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    return true;
  } catch (jsonErr) {
    console.error('JSON fallback save error:', jsonErr);
    return false;
  }
}

/**
 * Fetches all registration records from PostgreSQL (or JSON fallback)
 */
export async function getAllRegistrations(): Promise<any[]> {
  if (pool) {
    try {
      await initDb();
      const selectQuery = `
        SELECT 
          registration_id AS "registrationId",
          created_at AS "timestamp",
          nama,
          COALESCE(no_hp, '') AS "noHp",
          jurusan,
          prodi,
          divisi1,
          divisi2,
          COALESCE(NULLIF(alasan_divisi1, ''), alasan, '') AS "alasanDivisi1",
          COALESCE(NULLIF(alasan_divisi2, ''), harapan, '') AS "alasanDivisi2",
          COALESCE(alasan, '') AS "alasan",
          COALESCE(harapan, '') AS "harapan",
          ip_address AS "ipAddress"
        FROM registrations
        ORDER BY created_at DESC
      `;
      const result = await pool.query(selectQuery);
      return result.rows;
    } catch (err) {
      console.error('PostgreSQL query error, falling back to JSON:', err);
    }
  }

  // Fallback to local JSON
  try {
    const filePath = path.join(process.cwd(), 'lib', 'data', 'registrations.json');
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (fileContent.trim()) {
        const parsed = JSON.parse(fileContent);
        return parsed.map(({ buktiPembayaran, ...rest }: any) => rest);
      }
    }
  } catch (err) {
    console.error('JSON read error:', err);
  }
  return [];
}

/**
 * Fetches single registration detail including payment proof by registrationId
 */
export async function getRegistrationById(registrationId: string): Promise<any | null> {
  if (pool) {
    try {
      await initDb();
      const query = `
        SELECT 
          registration_id AS "registrationId",
          created_at AS "timestamp",
          nama,
          COALESCE(no_hp, '') AS "noHp",
          jurusan,
          prodi,
          divisi1,
          divisi2,
          COALESCE(NULLIF(alasan_divisi1, ''), alasan, '') AS "alasanDivisi1",
          COALESCE(NULLIF(alasan_divisi2, ''), harapan, '') AS "alasanDivisi2",
          COALESCE(alasan, '') AS "alasan",
          COALESCE(harapan, '') AS "harapan",
          ip_address AS "ipAddress",
          bukti_pembayaran AS "buktiPembayaran"
        FROM registrations
        WHERE registration_id = $1
      `;
      const result = await pool.query(query, [registrationId]);
      if (result.rows.length > 0) return result.rows[0];
    } catch (err) {
      console.error('PostgreSQL getRegistrationById error:', err);
    }
  }

  try {
    const filePath = path.join(process.cwd(), 'lib', 'data', 'registrations.json');
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (fileContent.trim()) {
        const parsed = JSON.parse(fileContent);
        return parsed.find((i: any) => i.registrationId === registrationId) || null;
      }
    }
  } catch (err) {}
  return null;
}

/**
 * Deletes a registration record by registrationId
 */
export async function deleteRegistrationRecord(registrationId: string): Promise<boolean> {
  if (pool) {
    try {
      await initDb();
      await pool.query('DELETE FROM registrations WHERE registration_id = $1', [registrationId]);
      return true;
    } catch (err) {
      console.error('PostgreSQL delete error:', err);
    }
  }

  // Fallback to local JSON
  try {
    const filePath = path.join(process.cwd(), 'lib', 'data', 'registrations.json');
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (fileContent.trim()) {
        const existingData = JSON.parse(fileContent);
        const filtered = existingData.filter((i: any) => i.registrationId !== registrationId);
        fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
        return true;
      }
    }
  } catch (err) {
    console.error('JSON delete error:', err);
  }
  return false;
}

/**
 * Fetches DPH structure nodes from PostgreSQL DB (or null if DB not available)
 */
export async function getDphStructureFromDb(): Promise<any[] | null> {
  if (!pool) return null;
  try {
    await initDb();
    const result = await pool.query(
      'SELECT id, name, role, COALESCE(description, \'\') AS "description", level, parent_id AS "parentId", photo, period FROM dph_structure ORDER BY level ASC, id ASC'
    );
    return result.rows;
  } catch (err) {
    console.error('PostgreSQL getDphStructure error:', err);
    return null;
  }
}

/**
 * Saves entire DPH structure list to PostgreSQL DB
 */
export async function saveDphStructureToDb(list: any[]): Promise<boolean> {
  if (!pool) return false;
  try {
    await initDb();
    // Re-sync full structure list
    await pool.query('DELETE FROM dph_structure');
    for (const node of list) {
      await pool.query(
        'INSERT INTO dph_structure (id, name, role, description, level, parent_id, photo, period) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [node.id, node.name, node.role, node.description || '', node.level, node.parentId || null, node.photo || '', node.period || '2025/2026']
      );
    }
    return true;
  } catch (err) {
    console.error('PostgreSQL saveDphStructure error:', err);
    return false;
  }
}

/**
 * Fetches all admin accounts from PostgreSQL DB
 */
export async function getAdminAccountsFromDb(): Promise<any[]> {
  if (!pool) return [{ id: 1, username: 'admin', fullName: 'Super Admin CyberTech', role: 'superadmin' }];
  try {
    await initDb();
    const result = await pool.query(
      'SELECT id, username, full_name AS "fullName", role, created_at AS "createdAt" FROM admin_accounts ORDER BY id ASC'
    );
    return result.rows;
  } catch (err) {
    console.error('PostgreSQL getAdminAccounts error:', err);
    return [{ id: 1, username: 'admin', fullName: 'Super Admin CyberTech', role: 'superadmin' }];
  }
}

/**
 * Creates a new admin account in PostgreSQL DB (Internal Registration only)
 */
export async function createAdminAccountInDb(username: string, passwordHash: string, fullName: string, role = 'admin'): Promise<boolean> {
  if (!pool) return true;
  try {
    await initDb();
    await pool.query(
      'INSERT INTO admin_accounts (username, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
      [username.trim().toLowerCase(), passwordHash, fullName.trim(), role]
    );
    return true;
  } catch (err) {
    console.error('PostgreSQL createAdminAccount error:', err);
    return false;
  }
}

/**
 * Deletes an admin account from PostgreSQL DB
 */
export async function deleteAdminAccountFromDb(id: number): Promise<boolean> {
  if (!pool) return true;
  try {
    await initDb();
    await pool.query('DELETE FROM admin_accounts WHERE id = $1', [id]);
    return true;
  } catch (err) {
    console.error('PostgreSQL deleteAdminAccount error:', err);
    return false;
  }
}

/**
 * Fetches admin account info by username for session verification
 */
export async function getAdminAccountByUsername(username: string): Promise<any | null> {
  if (!username) return null;
  if (!pool) {
    if (username.toLowerCase() === 'admin') {
      return { id: 1, username: 'admin', fullName: 'Super Admin CyberTech', role: 'superadmin' };
    }
    return null;
  }

  try {
    await initDb();
    const result = await pool.query(
      'SELECT id, username, full_name AS "fullName", role FROM admin_accounts WHERE LOWER(username) = LOWER($1)',
      [username.trim()]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { id: row.id, username: row.username, fullName: row.fullName, role: row.role };
  } catch (err) {
    console.error('PostgreSQL getAdminAccountByUsername error:', err);
    return null;
  }
}

/**
 * Verifies admin login credentials against admin_accounts or configured secret key
 */
export async function verifyAdminAccountInDb(username: string, pass: string): Promise<any | null> {
  if (!username || !pass) return null;
  if (!pool) {
    const masterKey = process.env.ADMIN_SECRET_KEY || 'cybertech2026';
    if (username.toLowerCase() === 'admin' && pass === masterKey) {
      return { id: 1, username: 'admin', fullName: 'Super Admin CyberTech', role: 'superadmin' };
    }
    return null;
  }

  try {
    await initDb();
    const result = await pool.query(
      'SELECT id, username, password_hash AS "passwordHash", full_name AS "fullName", role FROM admin_accounts WHERE LOWER(username) = LOWER($1)',
      [username.trim()]
    );
    if (result.rows.length === 0) return null;
    const adminRow = result.rows[0];
    const isMasterKey = Boolean(process.env.ADMIN_SECRET_KEY && pass === process.env.ADMIN_SECRET_KEY);
    if (adminRow.passwordHash === pass || isMasterKey) {
      return { id: adminRow.id, username: adminRow.username, fullName: adminRow.fullName, role: adminRow.role };
    }
    return null;
  } catch (err) {
    console.error('PostgreSQL verifyAdminAccount error:', err);
    return null;
  }
}


/**
 * Updates full admin account details in PostgreSQL DB
 */
export async function updateAdminAccountInDb(
  id: number | string,
  newUsername?: string,
  fullName?: string,
  role?: string,
  newPasswordHash?: string
): Promise<boolean> {
  if (!pool) return true;
  try {
    await initDb();
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (newUsername) {
      updates.push(`username = $${idx++}`);
      values.push(newUsername.trim().toLowerCase());
    }
    if (fullName) {
      updates.push(`full_name = $${idx++}`);
      values.push(fullName.trim());
    }
    if (role) {
      updates.push(`role = $${idx++}`);
      values.push(role);
    }
    if (newPasswordHash && newPasswordHash.trim().length > 0) {
      updates.push(`password_hash = $${idx++}`);
      values.push(newPasswordHash.trim());
    }

    if (updates.length === 0) return true;

    values.push(typeof id === 'number' ? id : Number(id) || id);
    const query = `UPDATE admin_accounts SET ${updates.join(', ')} WHERE ${typeof id === 'string' && isNaN(Number(id)) ? 'LOWER(username)' : 'id'} = $${idx}`;

    await pool.query(query, values);
    return true;
  } catch (err) {
    console.error('PostgreSQL updateAdminAccount error:', err);
    return false;
  }
}

export interface RegistrationSettings {
  isOpen: boolean;
  title: string;
  message: string;
}

export async function getRegistrationStatusFromDb(): Promise<RegistrationSettings> {
  const defaultSettings: RegistrationSettings = {
    isOpen: true,
    title: 'Pendaftaran Recruitment CyberTech Saat Ini Ditutup',
    message: 'Terima kasih atas antusiasme Anda. Pendaftaran pendaftar baru UKM Cybertech PNP di tutup. Sampai jumpa di Recruitment periode berikutnya!',
  };

  if (pool) {
    try {
      await initDb();
      const res = await pool.query("SELECT value FROM site_settings WHERE key = 'registration_status'");
      if (res.rows.length > 0) {
        const parsed = JSON.parse(res.rows[0].value);
        return { ...defaultSettings, ...parsed };
      }
    } catch (e) {
      console.error('PostgreSQL getRegistrationStatus error:', e);
    }
  }

  // Fallback to JSON
  try {
    const filePath = path.join(process.cwd(), 'lib', 'data', 'registration-settings.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.trim()) {
        const parsed = JSON.parse(content);
        return { ...defaultSettings, ...parsed };
      }
    }
  } catch (e) {}

  return defaultSettings;
}

export async function saveRegistrationStatusToDb(settings: Partial<RegistrationSettings>): Promise<boolean> {
  const current = await getRegistrationStatusFromDb();
  const updated: RegistrationSettings = {
    ...current,
    ...settings,
  };

  if (pool) {
    try {
      await initDb();
      await pool.query(
        `INSERT INTO site_settings (key, value) VALUES ('registration_status', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [JSON.stringify(updated)]
      );
      return true;
    } catch (e) {
      console.error('PostgreSQL saveRegistrationStatus error:', e);
    }
  }

  // Save to JSON fallback
  try {
    const dataDir = path.join(process.cwd(), 'lib', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, 'registration-settings.json');
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    return true;
  } catch (e) {
    console.error('JSON saveRegistrationStatus error:', e);
    return false;
  }
}

export interface PaymentSettings {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  notes?: string;
}

export async function getPaymentSettingsFromDb(): Promise<PaymentSettings> {
  const defaultSettings: PaymentSettings = {
    bankName: 'BNI',
    accountNumber: '1868208198',
    accountHolder: 'RahmaDani',
    notes: 'Silakan lakukan transfer ke rekening di atas sebelum mengunggah bukti transfer.',
  };

  if (pool) {
    try {
      await initDb();
      const res = await pool.query("SELECT value FROM site_settings WHERE key = 'payment_settings'");
      if (res.rows.length > 0) {
        const parsed = JSON.parse(res.rows[0].value);
        return { ...defaultSettings, ...parsed };
      }
    } catch (e) {
      console.error('PostgreSQL getPaymentSettings error:', e);
    }
  }

  // Fallback to JSON
  try {
    const filePath = path.join(process.cwd(), 'lib', 'data', 'payment-settings.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.trim()) {
        const parsed = JSON.parse(content);
        return { ...defaultSettings, ...parsed };
      }
    }
  } catch (e) {}

  return defaultSettings;
}

export async function savePaymentSettingsToDb(settings: Partial<PaymentSettings>): Promise<boolean> {
  const current = await getPaymentSettingsFromDb();
  const updated: PaymentSettings = {
    ...current,
    ...settings,
  };

  if (pool) {
    try {
      await initDb();
      await pool.query(
        `INSERT INTO site_settings (key, value) VALUES ('payment_settings', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [JSON.stringify(updated)]
      );
      return true;
    } catch (e) {
      console.error('PostgreSQL savePaymentSettings error:', e);
    }
  }

  // Save to JSON fallback
  try {
    const dataDir = path.join(process.cwd(), 'lib', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, 'payment-settings.json');
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    return true;
  } catch (e) {
    console.error('JSON savePaymentSettings error:', e);
    return false;
  }
}




