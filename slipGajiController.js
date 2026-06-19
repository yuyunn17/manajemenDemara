import { gajiDB, slipGajiDB } from '../database/mysqlDb.js';

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

// Get all slip gaji
export const getAllSlipGaji = async (req, res) => {
  try {
    const slip = await slipGajiDB.getAll();
    res.json({
      success: true,
      message: 'Data slip gaji berhasil diambil',
      data: slip.map(snakeToCamel)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get slip gaji by karyawan
export const getSlipGajiByKaryawan = async (req, res) => {
  try {
    const slip = await slipGajiDB.findByKaryawanId(req.params.karyawanId);
    res.json({
      success: true,
      message: 'Data slip gaji karyawan berhasil diambil',
      data: slip.map(snakeToCamel)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create slip gaji from gaji data
export const createSlipGaji = async (req, res) => {
  try {
    const { gajiId, karyawanId, nama, periode } = req.body;

    if (!karyawanId || !nama || !periode) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    const slipPayload = {
      ...req.body,
      karyawanId,
      createdAt: new Date()
    };

    if (gajiId) {
      try {
        const gajiDataRaw = await gajiDB.findById(gajiId);
        const gajiData = gajiDataRaw ? snakeToCamel(gajiDataRaw) : null;
        if (gajiData) {
          slipPayload.gajiPokok = gajiData.gajiPokok;
          slipPayload.tunjangan = gajiData.tunjangan;
          slipPayload.bonus = gajiData.bonus;
          slipPayload.totalPenghasilan = gajiData.gajiKotor;
          slipPayload.potonganAsuransi = gajiData.potonganAsuransi;
          slipPayload.potonganTax = gajiData.potonganTax;
          slipPayload.totalPotongan = (gajiData.potonganAsuransi || 0) + (gajiData.potonganTax || 0);
          slipPayload.gajiNetto = gajiData.gajiNetto;
          slipPayload.tanggalGajian = slipPayload.tanggalGajian ? new Date(slipPayload.tanggalGajian) : new Date();
        }
      } catch (err) {
        console.warn('Warning: could not load related gaji data for slip creation:', err.message);
      }
    }

    if (!slipPayload.tanggalGajian) {
      slipPayload.tanggalGajian = new Date();
    }

    const newSlip = await slipGajiDB.save(camelToSnake(slipPayload));
    res.status(201).json({
      success: true,
      message: 'Slip gaji berhasil dibuat',
      data: snakeToCamel(newSlip)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update slip gaji
export const updateSlipGaji = async (req, res) => {
  try {
    const existingSlip = await slipGajiDB.findById(req.params.id);
    if (!existingSlip) {
      return res.status(404).json({ success: false, message: 'Slip gaji tidak ditemukan' });
    }

    const updatedSlip = await slipGajiDB.save({
      ...existingSlip,
      ...camelToSnake(req.body),
      id: req.params.id,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Slip gaji berhasil diperbarui',
      data: snakeToCamel(updatedSlip)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete slip gaji
export const deleteSlipGaji = async (req, res) => {
  try {
    const existingSlip = await slipGajiDB.findById(req.params.id);
    if (!existingSlip) {
      return res.status(404).json({ success: false, message: 'Slip gaji tidak ditemukan' });
    }

    await slipGajiDB.delete(req.params.id);
    res.json({
      success: true,
      message: 'Slip gaji berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
