import { karyawanDB, usersDB } from '../database/mysqlDb.js';

const enrichKaryawanWithUser = async (karyawan) => {
  if (!karyawan) return karyawan;
  if (!karyawan.user_id) return karyawan;
  try {
    const user = await usersDB.findById(karyawan.user_id);
    if (!user) return karyawan;
    return {
      ...karyawan,
      email: karyawan.email || user.email || null
    };
  } catch (error) {
    return karyawan;
  }
};

// Get all karyawan
export const getAllKaryawan = async (req, res) => {
  try {
    const karyawan = await karyawanDB.getAll();
    const enrichedKaryawan = await Promise.all(
      (Array.isArray(karyawan) ? karyawan : []).map((item) => enrichKaryawanWithUser(item))
    );
    res.json({
      success: true,
      message: 'Data karyawan berhasil diambil',
      data: enrichedKaryawan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get karyawan by ID
export const getKaryawanById = async (req, res) => {
  try {
    const karyawan = await karyawanDB.findById(req.params.id);
    if (!karyawan) {
      return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
    }
    const enrichedKaryawan = await enrichKaryawanWithUser(karyawan);
    res.json({ success: true, data: enrichedKaryawan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create karyawan
export const createKaryawan = async (req, res) => {
  try {
    const { nama, email, nip, posisi, departemen, tanggalMasuk, gajiPokok } = req.body;

    if (!nama || !email || !nip || !posisi || !departemen || !tanggalMasuk || !gajiPokok) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    const existingEmail = await karyawanDB.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan' });
    }

    const existingNip = await karyawanDB.findOne({ nip });
    if (existingNip) {
      return res.status(400).json({ success: false, message: 'NIP sudah digunakan' });
    }

    const newKaryawan = {
      ...req.body,
      nama,
      email,
      nip,
      posisi,
      departemen,
      tanggalMasuk,
      gajiPokok
    };

    await karyawanDB.save(newKaryawan);

    res.status(201).json({
      success: true,
      message: 'Karyawan berhasil ditambahkan',
      data: newKaryawan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update karyawan
export const updateKaryawan = async (req, res) => {
  try {
    const karyawan = await karyawanDB.findById(req.params.id);

    if (!karyawan) {
      return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
    }

    const updatedKaryawan = {
      ...karyawan,
      ...req.body
    };

    await karyawanDB.save(updatedKaryawan);

    res.json({
      success: true,
      message: 'Karyawan berhasil diperbarui',
      data: updatedKaryawan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete karyawan
export const deleteKaryawan = async (req, res) => {
  try {
    await karyawanDB.deleteWithAccountAndRelations(req.params.id);

    res.json({
      success: true,
      message: 'Karyawan, akun, dan seluruh data terkait berhasil dihapus'
    });
  } catch (error) {
    if (String(error?.message || '').toLowerCase().includes('tidak ditemukan')) {
      return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update karyawan profile (karyawan can update their own profile)
export const updateKaryawanProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const karyawan = await karyawanDB.findOne({ user_id: userId });

    if (!karyawan) {
      return res.status(404).json({ success: false, message: 'Data karyawan tidak ditemukan' });
    }

    // For self-service profile update, always update the karyawan record linked by user_id.
    // This prevents stale/incorrect local karyawanId from silently blocking updates.
    const allowedFields = ['nama', 'no_hp', 'alamat', 'email', 'jabatan', 'posisi', 'tempatLahir', 'tanggalLahir', 'tanggalMasuk', 'tanggalKontrak', 'lamaKontrak', 'foto', 'status'];
    const updates = {};

    // Hanya proses field yang diizinkan
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data yang perlu diperbarui' });
    }

    // Normalize alias fields
    if (updates.posisi !== undefined && updates.jabatan === undefined) {
      updates.jabatan = updates.posisi;
    }
    if (updates.tempatLahir !== undefined && updates.tempat_lahir === undefined) {
      updates.tempat_lahir = updates.tempatLahir;
    }
    if (updates.tanggalLahir !== undefined && updates.tanggal_lahir === undefined) {
      updates.tanggal_lahir = updates.tanggalLahir;
    }
    if (updates.tanggalMasuk !== undefined && updates.tgl_masuk === undefined) {
      updates.tgl_masuk = updates.tanggalMasuk;
    }
    if (updates.tanggalKontrak !== undefined && updates.tgl_kontrak === undefined) {
      updates.tgl_kontrak = updates.tanggalKontrak;
    }
    if (updates.lamaKontrak !== undefined && updates.lama_kontrak === undefined) {
      updates.lama_kontrak = updates.lamaKontrak;
    }

    const updatedKaryawan = {
      ...karyawan,
      ...updates
    };

    await karyawanDB.save(updatedKaryawan);

    if (updates.email !== undefined) {
      const user = await usersDB.findById(userId);
      if (user) {
        user.email = updates.email;
        await usersDB.save(user);
      }
    }

    const enrichedKaryawan = await enrichKaryawanWithUser(updatedKaryawan);

    res.json({
      success: true,
      message: 'Profil karyawan berhasil diperbarui',
      data: enrichedKaryawan
    });
  } catch (error) {
    console.error('Update karyawan profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dropdown options for profile fields
export const getProfileOptions = async (req, res) => {
  try {
    const options = {
      status: [
        { value: 'aktif', label: 'Aktif' },
        { value: 'cuti', label: 'Cuti' },
        { value: 'resign', label: 'Resign' },
        { value: 'nonaktif', label: 'Nonaktif' },
        { value: 'kontrak_selesai', label: 'Kontrak Selesai' }
      ],
      posisi: [
        { value: 'admin', label: 'Admin' },
        { value: 'karyawan', label: 'Karyawan' }
      ],
      tempatLahir: [
        { value: 'jakarta', label: 'Jakarta' },
        { value: 'bandung', label: 'Bandung' },
        { value: 'surabaya', label: 'Surabaya' },
        { value: 'medan', label: 'Medan' },
        { value: 'yogyakarta', label: 'Yogyakarta' },
        { value: 'semarang', label: 'Semarang' },
        { value: 'makassar', label: 'Makassar' },
        { value: 'bali', label: 'Bali' },
        { value: 'palembang', label: 'Palembang' },
        { value: 'batam', label: 'Batam' },
        { value: 'lainnya', label: 'Lainnya' }
      ]
    };

    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAllKaryawan,
  getKaryawanById,
  createKaryawan,
  updateKaryawan,
  updateKaryawanProfile,
  deleteKaryawan,
  getProfileOptions
};
