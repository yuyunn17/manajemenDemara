import { cutiDB } from '../database/mysqlDb.js';

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

// Get all cuti
export const getAllCuti = async (req, res) => {
  try {
    const cuti = await cutiDB.getAll();
    res.json({
      success: true,
      message: 'Data cuti berhasil diambil',
      data: cuti.map(snakeToCamel)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get cuti by ID
export const getCutiById = async (req, res) => {
  try {
    const cuti = await cutiDB.findById(req.params.id);
    if (!cuti) {
      return res.status(404).json({ success: false, message: 'Pengajuan cuti tidak ditemukan' });
    }
    res.json({ success: true, data: snakeToCamel(cuti) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get cuti by karyawan
export const getCutiByKaryawan = async (req, res) => {
  try {
    const cuti = await cutiDB.findByKaryawanId(req.params.karyawanId);
    res.json({
      success: true,
      message: 'Data cuti karyawan berhasil diambil',
      data: cuti.map(snakeToCamel)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create cuti
export const createCuti = async (req, res) => {
  try {
    const { karyawanId, nama, tanggal, lama, alasan } = req.body;
    
    if (!karyawanId || !nama || !tanggal || !lama || !alasan) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }
    
    const newCuti = await cutiDB.save({
      ...camelToSnake(req.body),
      karyawan_id: karyawanId,
      created_at: new Date()
    });
    
    res.status(201).json({
      success: true,
      message: 'Pengajuan cuti berhasil dibuat',
      data: snakeToCamel(newCuti)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update cuti data (karyawan bisa edit saat status masih Pending, admin bisa update status)
export const updateCuti = async (req, res) => {
  try {
    console.log('updateCuti called with id:', req.params.id, 'body:', req.body);
    const cuti = await cutiDB.findById(req.params.id);
    console.log('Found cuti:', cuti ? 'yes' : 'no', cuti);
    if (!cuti) {
      return res.status(404).json({ success: false, message: 'Pengajuan cuti tidak ditemukan', id: req.params.id });
    }

    const isAdmin = req.user?.role === 'admin';
    const cutiCamel = snakeToCamel(cuti);
    if (!isAdmin) {
      if (cutiCamel.nama !== req.user?.name) {
        return res.status(403).json({ success: false, message: 'Tidak memiliki izin untuk mengubah cuti ini' });
      }
      if (cutiCamel.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Pengajuan cuti hanya dapat diedit saat status Pending' });
      }
    }

    const updates = {};
    if (req.body.tanggal !== undefined) updates.tanggal = req.body.tanggal;
    if (req.body.lama !== undefined) updates.lama = req.body.lama;
    if (req.body.alasan !== undefined) updates.alasan = req.body.alasan;
    if (req.body.nama !== undefined) updates.nama = req.body.nama;

    if (isAdmin && req.body.status !== undefined) {
      updates.status = req.body.status;
    }
    if (isAdmin && req.body.rejectionReason !== undefined) {
      updates.rejectionReason = req.body.rejectionReason;
    }

    if (!isAdmin) {
      updates.nama = req.user?.name || updates.nama;
    }

    updates.updatedBy = req.user?.name || req.user?.email || 'System';
    updates.updatedAt = new Date();

    const updatedCuti = await cutiDB.save({
      ...cuti,
      ...camelToSnake(updates),
      id: req.params.id
    });
    res.json({ success: true, message: 'Pengajuan cuti berhasil diperbarui', data: snakeToCamel(updatedCuti) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update cuti status
export const updateCutiStatus = async (req, res) => {
  try {
    const { status, rejectionReason, updatedBy } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status harus diisi' });
    }
    
    if (status === 'Ditolak' && !rejectionReason) {
      return res.status(400).json({ success: false, message: 'Alasan penolakan harus diisi' });
    }

    const existingCuti = await cutiDB.findById(req.params.id);
    if (!existingCuti) {
      return res.status(404).json({ success: false, message: 'Pengajuan cuti tidak ditemukan' });
    }
    
    const updateData = {
      status,
      updatedBy,
      updatedAt: new Date()
    };
    
    if (status === 'Ditolak') {
      updateData.rejectionReason = rejectionReason;
    }
    
    const cuti = await cutiDB.save({
      ...existingCuti,
      ...camelToSnake(updateData),
      id: req.params.id
    });
    
    res.json({
      success: true,
      message: `Pengajuan cuti berhasil diubah menjadi ${status}`,
      data: snakeToCamel(cuti)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete cuti
export const deleteCuti = async (req, res) => {
  try {
    const cuti = await cutiDB.findById(req.params.id);
    
    if (!cuti) {
      return res.status(404).json({ success: false, message: 'Pengajuan cuti tidak ditemukan' });
    }

    await cutiDB.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Pengajuan cuti berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
