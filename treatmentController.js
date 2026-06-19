import { treatmentDB } from '../database/mysqlDb.js';

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

// Get all treatment
export const getAllTreatment = async (req, res) => {
  try {
    const treatment = await treatmentDB.getAll();
    res.json({
      success: true,
      message: 'Data treatment berhasil diambil',
      data: treatment.map(snakeToCamel)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get treatment by karyawan
export const getTreatmentByKaryawan = async (req, res) => {
  try {
    const treatment = await treatmentDB.findByKaryawanId(req.params.karyawanId);
    res.json({
      success: true,
      message: 'Data treatment karyawan berhasil diambil',
      data: treatment.map(snakeToCamel)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create treatment
export const createTreatment = async (req, res) => {
  try {
    const { karyawanId, nama, tipeLayanan, tanggal, harga } = req.body;
    
    // Use nama for nama_treatment if namaTreatment not provided
    const namaTreatment = req.body.namaTreatment || nama;
    const treatmentHarga = harga || req.body.harga || 0;
    
    if (!namaTreatment) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap: nama treatment wajib diisi' });
    }
    
    const newTreatment = await treatmentDB.save({
      nama_treatment: namaTreatment,
      harga: treatmentHarga,
      created_at: new Date()
    });
    
    res.status(201).json({
      success: true,
      message: 'Data treatment berhasil ditambahkan',
      data: snakeToCamel(newTreatment)
    });
  } catch (error) {
    console.error('Error in createTreatment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update treatment
export const updateTreatment = async (req, res) => {
  try {
    const treatment = await treatmentDB.findById(req.params.id);
    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Data treatment tidak ditemukan' });
    }

    const updatedTreatment = await treatmentDB.save({
      ...treatment,
      ...camelToSnake(req.body),
      id: req.params.id,
      updated_at: new Date()
    });
    
    res.json({
      success: true,
      message: 'Data treatment berhasil diperbarui',
      data: snakeToCamel(updatedTreatment)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete treatment
export const deleteTreatment = async (req, res) => {
  try {
    const treatment = await treatmentDB.findById(req.params.id);
    
    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Data treatment tidak ditemukan' });
    }

    await treatmentDB.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Data treatment berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
