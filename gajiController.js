import { gajiDB } from '../database/mysqlDb.js';

const camelToSnake = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/([A-Z])/g, '_$1').toLowerCase(),
      value
    ])
  );

const snakeToCamel = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      value
    ])
  );

const normalizeGajiResponse = (gaji) => {
  const camelized = snakeToCamel(gaji);
  if (!camelized.periode && camelized.bulan && camelized.tahun) {
    camelized.periode = `${String(camelized.bulan).padStart(2, '0')}-${camelized.tahun}`;
  }
  return camelized;
};

// Get all gaji
export const getAllGaji = async (req, res) => {
  try {
    const gaji = await gajiDB.getAll();
    res.json({
      success: true,
      message: 'Data gaji berhasil diambil',
      data: gaji.map(normalizeGajiResponse)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get gaji by karyawan
export const getGajiByKaryawan = async (req, res) => {
  try {
    const gaji = await gajiDB.findByKaryawanId(req.params.karyawanId);
    res.json({
      success: true,
      message: 'Data gaji karyawan berhasil diambil',
      data: gaji.map(normalizeGajiResponse)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create gaji
const parsePeriodeToMonthYear = (periode, tanggal) => {
  const result = {};
  if (periode) {
    const parts = String(periode).trim().split(/[-\/]/).map((p) => p.trim());
    if (parts.length >= 2) {
      result.bulan = parts[0].padStart(2, '0');
      result.tahun = Number(parts[1]);
    }
  }
  if ((!result.bulan || !result.tahun) && tanggal) {
    const date = new Date(tanggal);
    if (!Number.isNaN(date.getTime())) {
      result.bulan = String(date.getMonth() + 1).padStart(2, '0');
      result.tahun = date.getFullYear();
    }
  }
  return result;
};

// Convert ISO datetime to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
const formatDateTimeForMySQL = (dateValue) => {
  if (!dateValue) return null;
  try {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (err) {
    console.error('Error formatting datetime:', err);
    return null;
  }
};

export const createGaji = async (req, res) => {
  try {
    const { karyawanId, nama, periode, tanggal, gajiPokok, gajiKotor, gajiNetto } = req.body;

    if (!karyawanId || !nama || (!periode && !tanggal) || gajiPokok === undefined || gajiKotor === undefined || gajiNetto === undefined) {
      console.error('Validation failed:', { karyawanId, nama, periode, tanggal, gajiPokok, gajiKotor, gajiNetto });
      return res.status(400).json({ success: false, message: 'Data tidak lengkap: karyawanId, nama, periode/tanggal, gajiPokok, gajiKotor, gajiNetto wajib diisi' });
    }

    const monthYear = parsePeriodeToMonthYear(periode, tanggal);
    const dbPayload = {
      ...camelToSnake(req.body),
      ...monthYear,
      karyawan_id: karyawanId,
      created_at: new Date()
    };
    delete dbPayload.periode;
    
    // Convert tanggal to MySQL datetime format
    if (dbPayload.tanggal) {
      dbPayload.tanggal = formatDateTimeForMySQL(dbPayload.tanggal);
    }

    console.log('Creating gaji with payload:', dbPayload);

    const newGaji = await gajiDB.save(dbPayload);
    
    console.log('Gaji created successfully:', newGaji);

    res.status(201).json({
      success: true,
      message: 'Data gaji berhasil ditambahkan',
      data: normalizeGajiResponse(newGaji)
    });
  } catch (error) {
    console.error('Error in createGaji:', error);
    res.status(500).json({ success: false, message: `Error: ${error.message}` });
  }
};

// Update gaji
export const updateGaji = async (req, res) => {
  try {
    const existingGaji = await gajiDB.findById(req.params.id);
    if (!existingGaji) {
      return res.status(404).json({ success: false, message: 'Data gaji tidak ditemukan' });
    }

    const { periode, tanggal } = req.body;
    const monthYear = parsePeriodeToMonthYear(periode, tanggal);

    const updatePayload = {
      ...existingGaji,
      ...camelToSnake(req.body),
      ...monthYear,
      id: req.params.id,
      updated_at: new Date()
    };
    
    // Convert tanggal to MySQL datetime format
    if (updatePayload.tanggal) {
      updatePayload.tanggal = formatDateTimeForMySQL(updatePayload.tanggal);
    }

    const updatedGaji = await gajiDB.save(updatePayload);

    res.json({
      success: true,
      message: 'Data gaji berhasil diperbarui',
      data: normalizeGajiResponse(updatedGaji)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete gaji
export const deleteGaji = async (req, res) => {
  try {
    await gajiDB.delete(req.params.id);
    res.json({
      success: true,
      message: 'Data gaji berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
