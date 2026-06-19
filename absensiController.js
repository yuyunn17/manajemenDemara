import { absensiDB } from '../database/mysqlDb.js';

const snakeToCamel = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      value
    ])
  );

const camelToSnake = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/([A-Z])/g, '_$1').toLowerCase(),
      value
    ])
  );

// Get all absensi
export const getAllAbsensi = async (req, res) => {
  try {
    const absensi = await absensiDB.getAll();
    res.json({
      success: true,
      message: 'Data absensi berhasil diambil',
      data: absensi.map(snakeToCamel)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get absensi by karyawan
export const getAbsensiByKaryawan = async (req, res) => {
  try {
    const absensi = await absensiDB.findByKaryawanId(req.params.karyawanId);
    res.json({
      success: true,
      message: 'Data absensi karyawan berhasil diambil',
      data: absensi.map(snakeToCamel)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create absensi
export const createAbsensi = async (req, res) => {
  try {
    const { karyawanId, nama, tanggal, status } = req.body;
    
    if (!karyawanId || !nama || !tanggal || !status) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    const newAbsensi = await absensiDB.save({
      ...camelToSnake(req.body),
      karyawan_id: karyawanId,
      created_at: new Date()
    });
    
    res.status(201).json({
      success: true,
      message: 'Absensi berhasil ditambahkan',
      data: snakeToCamel(newAbsensi)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update absensi
export const updateAbsensi = async (req, res) => {
  try {
    const existingAbsensi = await absensiDB.findById(req.params.id);
    if (!existingAbsensi) {
      return res.status(404).json({ success: false, message: 'Absensi tidak ditemukan' });
    }

    const updatedAbsensi = await absensiDB.save({
      ...existingAbsensi,
      ...camelToSnake(req.body),
      id: req.params.id,
      updated_at: new Date()
    });
    
    res.json({
      success: true,
      message: 'Absensi berhasil diperbarui',
      data: snakeToCamel(updatedAbsensi)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete absensi
export const deleteAbsensi = async (req, res) => {
  try {
    const existingAbsensi = await absensiDB.findById(req.params.id);
    if (!existingAbsensi) {
      return res.status(404).json({ success: false, message: 'Absensi tidak ditemukan' });
    }

    await absensiDB.delete(req.params.id);
    res.json({
      success: true,
      message: 'Absensi berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
