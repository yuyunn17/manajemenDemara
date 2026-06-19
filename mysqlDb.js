import pool from './mysql.js';

const tableColumnsCache = new Map();

// Function to clear cache (useful after schema migrations)
const clearTableColumnsCache = (tableName) => {
  if (tableName) {
    tableColumnsCache.delete(tableName);
    console.log(`🔄 Cleared cache for table: ${tableName}`);
  } else {
    tableColumnsCache.clear();
    console.log(`🔄 Cleared all table column cache`);
  }
};

const getTableColumns = async (tableName, forceRefresh = false) => {
  if (!forceRefresh && tableColumnsCache.has(tableName)) {
    return tableColumnsCache.get(tableName);
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(`SHOW COLUMNS FROM ${tableName}`);
    const columns = new Set(rows.map((row) => row.Field));
    tableColumnsCache.set(tableName, columns);
    return columns;
  } finally {
    conn.release();
  }
};

const findRowsByField = async (tableName, fieldName, value) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT * FROM \`${tableName}\` WHERE \`${fieldName}\` = ?`,
      [value]
    );
    return Array.isArray(rows) ? rows : [];
  } finally {
    conn.release();
  }
};

// Users Database Operations
const usersDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM users');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in usersDB.getAll:', err);
      return [];
    }
  },

  findOne: async (query) => {
    try {
      const conn = await pool.getConnection();
      let sql = 'SELECT * FROM users WHERE 1=1';
      const values = [];
      
      for (const [key, value] of Object.entries(query)) {
        sql += ` AND ${key} = ?`;
        values.push(value);
      }
      
      const [rows] = await conn.query(sql, values);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in usersDB.findOne:', err);
      return null;
    }
  },

  findMany: async (query = {}) => {
    try {
      const conn = await pool.getConnection();
      let sql = 'SELECT * FROM users WHERE 1=1';
      const values = [];

      for (const [key, value] of Object.entries(query)) {
        sql += ` AND ${key} = ?`;
        values.push(value);
      }

      sql += ' ORDER BY id DESC';
      const [rows] = await conn.query(sql, values);
      conn.release();
      return Array.isArray(rows) ? rows : [];
    } catch (err) {
      console.error('Error in usersDB.findMany:', err);
      return [];
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM users WHERE id = ?', [id]);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in usersDB.findById:', err);
      return null;
    }
  },

  save: async (user) => {
    try {
      const conn = await pool.getConnection();
      
      if (user.id) {
        // Update existing
        const fields = Object.keys(user).filter(k => k !== 'id' && k !== 'created_at');
        const values = fields.map(k => user[k]);
        values.push(user.id);
        
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        await conn.query(`UPDATE users SET ${setClause} WHERE id = ?`, values);
      } else {
        // Create new - exclude created_at (use SQL DEFAULT)
        const keys = Object.keys(user).filter(k => k !== 'created_at');
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => user[k]);
        
        const [result] = await conn.query(
          `INSERT INTO users (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        user.id = result.insertId;
      }
      
      conn.release();
      return user;
    } catch (err) {
      console.error('Error in usersDB.save:', err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM users WHERE id = ?', [id]);
      conn.release();
    } catch (err) {
      console.error('Error in usersDB.delete:', err);
    }
  }
};

// Karyawan Database Operations
const karyawanDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM karyawan');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in karyawanDB.getAll:', err);
      return [];
    }
  },

  findOne: async (query) => {
    try {
      const columns = await getTableColumns('karyawan');
      const conn = await pool.getConnection();
      let sql = 'SELECT * FROM karyawan WHERE 1=1';
      const values = [];
      
      for (const [key, value] of Object.entries(query)) {
        if (!columns.has(key)) {
          continue;
        }
        sql += ` AND ${key} = ?`;
        values.push(value);
      }

      if (values.length === 0) {
        conn.release();
        return null;
      }
      
      const [rows] = await conn.query(sql, values);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in karyawanDB.findOne:', err);
      return null;
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM karyawan WHERE id = ?', [id]);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in karyawanDB.findById:', err);
      return null;
    }
  },

  save: async (karyawan) => {
    try {
      const columns = await getTableColumns('karyawan');
      const conn = await pool.getConnection();
      
      if (karyawan.id) {
        // Update existing
        const fields = Object.keys(karyawan).filter(k => k !== 'id' && columns.has(k));
        const values = fields.map(k => karyawan[k]);
        values.push(karyawan.id);

        if (fields.length === 0) {
          conn.release();
          return karyawan;
        }
        
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        await conn.query(`UPDATE karyawan SET ${setClause} WHERE id = ?`, values);
      } else {
        // Create new - exclude created_at (use SQL DEFAULT)
        const keys = Object.keys(karyawan).filter(k => k !== 'created_at' && columns.has(k));
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => karyawan[k]);

        if (keys.length === 0) {
          conn.release();
          return karyawan;
        }
        
        const [result] = await conn.query(
          `INSERT INTO karyawan (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        karyawan.id = result.insertId;
      }
      
      conn.release();
      return karyawan;
    } catch (err) {
      console.error('Error in karyawanDB.save:', err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM karyawan WHERE id = ?', [id]);
      conn.release();
    } catch (err) {
      console.error('Error in karyawanDB.delete:', err);
      throw err;
    }
  },

  deleteById: async (id) => {
    return karyawanDB.delete(id);
  },

  deleteWithAccountAndRelations: async (id) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query('SELECT * FROM karyawan WHERE id = ? LIMIT 1', [id]);
      const karyawan = rows[0];
      if (!karyawan) {
        throw new Error('Karyawan tidak ditemukan');
      }

      // If linked account exists, delete user first.
      // FK `karyawan.user_id -> users.id ON DELETE CASCADE` ensures karyawan row is removed,
      // then FK on child tables referencing karyawan will also be cleaned up.
      if (karyawan.user_id) {
        await conn.query('DELETE FROM users WHERE id = ?', [karyawan.user_id]);
      } else {
        // Legacy rows may not have user_id link yet.
        // Remove matching karyawan account by role+name so deleted employee cannot log in again.
        await conn.query(
          'DELETE FROM users WHERE role = ? AND name = ?',
          ['karyawan', karyawan.nama]
        );
        await conn.query('DELETE FROM karyawan WHERE id = ?', [id]);
      }

      await conn.commit();
      return { deleted: true, karyawan };
    } catch (err) {
      await conn.rollback();
      console.error('Error in karyawanDB.deleteWithAccountAndRelations:', err);
      throw err;
    } finally {
      conn.release();
    }
  }
};

// Slip Gaji Database Operations
const slipGajiDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM slip_gaji');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in slipGajiDB.getAll:', err);
      return [];
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM slip_gaji WHERE id = ?', [id]);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in slipGajiDB.findById:', err);
      return null;
    }
  },

  findByKaryawanAndMonth: async (karyawanId, bulan, tahun) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query(
        'SELECT * FROM slip_gaji WHERE karyawan_id = ? AND bulan = ? AND tahun = ?',
        [karyawanId, bulan, tahun]
      );
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in slipGajiDB.findByKaryawanAndMonth:', err);
      return null;
    }
  },

  findByKaryawanId: async (karyawanId) => {
    try {
      return await findRowsByField('slip_gaji', 'karyawan_id', karyawanId);
    } catch (err) {
      console.error('Error in slipGajiDB.findByKaryawanId:', err);
      return [];
    }
  },

  delete: async (id) => {
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM slip_gaji WHERE id = ?', [id]);
      conn.release();
    } catch (err) {
      console.error('Error in slipGajiDB.delete:', err);
      throw err;
    }
  },

  save: async (slipGaji) => {
    try {
      const conn = await pool.getConnection();
      const tableColumns = await getTableColumns('slip_gaji');
      
      if (slipGaji.id) {
        // Check if record exists first
        const [existingRows] = await conn.query('SELECT id FROM slip_gaji WHERE id = ?', [slipGaji.id]);
        
        if (existingRows && existingRows.length > 0) {
          // Record exists, do UPDATE
          const fields = Object.keys(slipGaji).filter((k) => k !== 'id' && tableColumns.has(k));
          const values = fields.map((k) => slipGaji[k]);
          values.push(slipGaji.id);

          const setClause = fields.map((f) => `${f} = ?`).join(', ');
          await conn.query(`UPDATE slip_gaji SET ${setClause} WHERE id = ?`, values);
        } else {
          // Record doesn't exist, do INSERT with the provided ID
          const keys = Object.keys(slipGaji).filter((k) => tableColumns.has(k));
          const placeholders = keys.map(() => '?').join(', ');
          const values = keys.map((k) => slipGaji[k]);
          
          await conn.query(
            `INSERT INTO slip_gaji (${keys.join(', ')}) VALUES (${placeholders})`,
            values
          );
        }
      } else {
        // No ID provided, do INSERT and let DB generate one
        const keys = Object.keys(slipGaji).filter((k) => k !== 'created_at' && tableColumns.has(k));
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map((k) => slipGaji[k]);

        const [result] = await conn.query(
          `INSERT INTO slip_gaji (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        slipGaji.id = result.insertId;
      }
      
      conn.release();
      return slipGaji;
    } catch (err) {
      console.error('Error in slipGajiDB.save:', err);
      throw err;
    }
  }
};

// Cuti Database Operations
const cutiDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM cuti');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in cutiDB.getAll:', err);
      return [];
    }
  },

  findById: async (id) => {
    try {
      console.log('cutiDB.findById called with id:', id, 'type:', typeof id);
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM cuti WHERE id = ?', [id]);
      console.log('cutiDB.findById result rows:', rows?.length || 0, 'rows:', rows);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in cutiDB.findById:', err);
      return null;
    }
  },

  findByKaryawanId: async (karyawanId) => {
    try {
      return await findRowsByField('cuti', 'karyawan_id', karyawanId);
    } catch (err) {
      console.error('Error in cutiDB.findByKaryawanId:', err);
      return [];
    }
  },

  delete: async (id) => {
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM cuti WHERE id = ?', [id]);
      conn.release();
    } catch (err) {
      console.error('Error in cutiDB.delete:', err);
      throw err;
    }
  },

  save: async (cuti) => {
    try {
      const conn = await pool.getConnection();
      const tableColumns = await getTableColumns('cuti');
      cuti.created_at = new Date();
      
      if (cuti.id) {
        const fields = Object.keys(cuti).filter((k) => k !== 'id' && tableColumns.has(k));
        const values = fields.map((k) => cuti[k]);
        values.push(cuti.id);
        
        const setClause = fields.map((f) => `${f} = ?`).join(', ');
        await conn.query(`UPDATE cuti SET ${setClause} WHERE id = ?`, values);
      } else {
        const keys = Object.keys(cuti).filter((k) => k !== 'created_at' && tableColumns.has(k));
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map((k) => cuti[k]);
        
        const [result] = await conn.query(
          `INSERT INTO cuti (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        cuti.id = result.insertId;
      }
      
      conn.release();
      return cuti;
    } catch (err) {
      console.error('Error in cutiDB.save:', err);
      throw err;
    }
  }
};

// Absensi Database Operations
const absensiDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM absensi');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in absensiDB.getAll:', err);
      return [];
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM absensi WHERE id = ?', [id]);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in absensiDB.findById:', err);
      return null;
    }
  },

  findByKaryawanId: async (karyawanId) => {
    try {
      return await findRowsByField('absensi', 'karyawan_id', karyawanId);
    } catch (err) {
      console.error('Error in absensiDB.findByKaryawanId:', err);
      return [];
    }
  },

  delete: async (id) => {
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM absensi WHERE id = ?', [id]);
      conn.release();
    } catch (err) {
      console.error('Error in absensiDB.delete:', err);
      throw err;
    }
  },

  save: async (absensi) => {
    try {
      const conn = await pool.getConnection();
      const tableColumns = await getTableColumns('absensi');
      absensi.created_at = new Date();
      
      if (absensi.id) {
        const fields = Object.keys(absensi).filter((k) => k !== 'id' && tableColumns.has(k));
        const values = fields.map((k) => absensi[k]);
        values.push(absensi.id);
        
        const setClause = fields.map((f) => `${f} = ?`).join(', ');
        await conn.query(`UPDATE absensi SET ${setClause} WHERE id = ?`, values);
      } else {
        const keys = Object.keys(absensi).filter((k) => k !== 'created_at' && tableColumns.has(k));
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map((k) => absensi[k]);
        
        const [result] = await conn.query(
          `INSERT INTO absensi (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        absensi.id = result.insertId;
      }
      
      conn.release();
      return absensi;
    } catch (err) {
      console.error('Error in absensiDB.save:', err);
      throw err;
    }
  }
};

// Gaji Database Operations
const gajiDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query(
        'SELECT gaji.*, karyawan.nama AS nama FROM gaji LEFT JOIN karyawan ON gaji.karyawan_id = karyawan.id'
      );
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in gajiDB.getAll:', err);
      return [];
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query(
        'SELECT gaji.*, karyawan.nama AS nama FROM gaji LEFT JOIN karyawan ON gaji.karyawan_id = karyawan.id WHERE gaji.id = ?',
        [id]
      );
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in gajiDB.findById:', err);
      return null;
    }
  },

  findByKaryawanId: async (karyawanId) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query(
        'SELECT gaji.*, karyawan.nama AS nama FROM gaji LEFT JOIN karyawan ON gaji.karyawan_id = karyawan.id WHERE gaji.karyawan_id = ?',
        [karyawanId]
      );
      conn.release();
      return Array.isArray(rows) ? rows : [];
    } catch (err) {
      console.error('Error in gajiDB.findByKaryawanId:', err);
      return [];
    }
  },

  delete: async (id) => {
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM gaji WHERE id = ?', [id]);
      conn.release();
    } catch (err) {
      console.error('Error in gajiDB.delete:', err);
      throw err;
    }
  },

  save: async (gaji) => {
    try {
      const conn = await pool.getConnection();
      // Force refresh columns for gaji table to pick up any schema changes
      const tableColumns = await getTableColumns('gaji', true);
      
      if (!gaji.created_at) {
        gaji.created_at = new Date();
      }
      
      if (gaji.id) {
        // Check if record exists first
        const [existingRows] = await conn.query('SELECT id FROM gaji WHERE id = ?', [gaji.id]);
        
        if (existingRows && existingRows.length > 0) {
          // Record exists, do UPDATE
          const fields = Object.keys(gaji).filter((k) => k !== 'id' && tableColumns.has(k));
          const values = fields.map((k) => gaji[k]);
          values.push(gaji.id);
          
          const setClause = fields.map((f) => `${f} = ?`).join(', ');
          console.log('Updating gaji with fields:', fields);
          await conn.query(`UPDATE gaji SET ${setClause} WHERE id = ?`, values);
        } else {
          // Record doesn't exist, do INSERT with the provided ID
          const keys = Object.keys(gaji).filter((k) => tableColumns.has(k));
          const placeholders = keys.map(() => '?').join(', ');
          const values = keys.map((k) => gaji[k]);
          
          console.log('Inserting gaji with fields:', keys);
          await conn.query(
            `INSERT INTO gaji (${keys.join(', ')}) VALUES (${placeholders})`,
            values
          );
        }
      } else {
        // No ID provided, do INSERT and let DB generate one
        const keys = Object.keys(gaji).filter((k) => k !== 'created_at' && tableColumns.has(k));
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map((k) => gaji[k]);
        
        console.log('Inserting new gaji with auto-increment ID. Fields:', keys);
        const [result] = await conn.query(
          `INSERT INTO gaji (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        gaji.id = result.insertId;
      }
      
      conn.release();
      return gaji;
    } catch (err) {
      console.error('Error in gajiDB.save:', err);
      throw err;
    }
  }
};

// Treatment Database Operations
const treatmentDB = {
  getAll: async () => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM treatment');
      conn.release();
      return rows;
    } catch (err) {
      console.error('Error in treatmentDB.getAll:', err);
      return [];
    }
  },

  findById: async (id) => {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM treatment WHERE id = ?', [id]);
      conn.release();
      return rows[0] || null;
    } catch (err) {
      console.error('Error in treatmentDB.findById:', err);
      return null;
    }
  },

  findByKaryawanId: async (karyawanId) => {
    try {
      return await findRowsByField('treatment', 'karyawan_id', karyawanId);
    } catch (err) {
      console.error('Error in treatmentDB.findByKaryawanId:', err);
      return [];
    }
  },

  delete: async (id) => {
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM treatment WHERE id = ?', [id]);
      conn.release();
    } catch (err) {
      console.error('Error in treatmentDB.delete:', err);
      throw err;
    }
  },

  save: async (treatment) => {
    try {
      const conn = await pool.getConnection();
      // Force refresh columns for treatment table
      const tableColumns = await getTableColumns('treatment', true);
      
      if (!treatment.created_at) {
        treatment.created_at = new Date();
      }
      
      console.log('Treatment save - tableColumns:', Array.from(tableColumns));
      console.log('Treatment save - treatment keys:', Object.keys(treatment));
      
      if (treatment.id) {
        // Check if record exists first
        const [existingRows] = await conn.query('SELECT id FROM treatment WHERE id = ?', [treatment.id]);
        
        if (existingRows && existingRows.length > 0) {
          // Record exists, do UPDATE
          const fields = Object.keys(treatment).filter((k) => k !== 'id' && tableColumns.has(k));
          const values = fields.map((k) => treatment[k]);
          values.push(treatment.id);
          
          const setClause = fields.map((f) => `${f} = ?`).join(', ');
          console.log('Updating treatment with fields:', fields);
          await conn.query(`UPDATE treatment SET ${setClause} WHERE id = ?`, values);
        } else {
          // Record doesn't exist, do INSERT with the provided ID
          const keys = Object.keys(treatment).filter((k) => tableColumns.has(k));
          const placeholders = keys.map(() => '?').join(', ');
          const values = keys.map((k) => treatment[k]);
          
          console.log('Inserting treatment with ID. Fields:', keys);
          await conn.query(
            `INSERT INTO treatment (${keys.join(', ')}) VALUES (${placeholders})`,
            values
          );
        }
      } else {
        const keys = Object.keys(treatment).filter((k) => k !== 'created_at' && tableColumns.has(k));
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map((k) => treatment[k]);
        
        if (keys.length === 0) {
          console.error('ERROR: No matching columns found in treatment table!');
          console.error('Available columns:', Array.from(tableColumns));
          console.error('Provided fields:', Object.keys(treatment));
          throw new Error(`No matching columns. Available: ${Array.from(tableColumns).join(', ')}`);
        }
        
        console.log('Inserting new treatment with auto-increment ID. Fields:', keys);
        const [result] = await conn.query(
          `INSERT INTO treatment (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
        treatment.id = result.insertId;
      }
      
      conn.release();
      return treatment;
    } catch (err) {
      console.error('Error in treatmentDB.save:', err);
      throw err;
    }
  }
};

export { usersDB, karyawanDB, slipGajiDB, cutiDB, absensiDB, gajiDB, treatmentDB, clearTableColumnsCache };
export default { usersDB, karyawanDB, slipGajiDB, cutiDB, absensiDB, gajiDB, treatmentDB, clearTableColumnsCache };
