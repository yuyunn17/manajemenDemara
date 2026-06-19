import { usersDB, karyawanDB } from '../database/mysqlDb.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Register
export const register = async (req, res) => {
  try {
    const { nama, email, password, role, adminKey } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    if (role && role.toString().toLowerCase() === 'admin') {
      const requiredKey = process.env.ADMIN_REGISTER_KEY;
      const allUsers = await usersDB.getAll();
      const anyAdminExists = allUsers.some(u => u.role && u.role.toString().toLowerCase() === 'admin');

      if (!requiredKey) {
        if (!anyAdminExists) {
          console.warn('?? ADMIN_REGISTER_KEY not set � allowing first admin registration without key');
        } else {
          return res.status(500).json({ success: false, message: 'Server not configured for admin registration' });
        }
      } else {
        if (!adminKey || adminKey !== requiredKey) {
          return res.status(403).json({ success: false, message: 'Kunci registrasi admin tidak valid' });
        }
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      name: nama,
      email,
      password: hashedPassword,
      role: (role || 'karyawan').toString().toLowerCase()
    };

    const savedUser = await usersDB.save(newUser);
    let savedKaryawan = null;

    if (savedUser.role && savedUser.role.toString().toLowerCase() === 'karyawan') {
      const karyawanPayload = {
        user_id: savedUser.id, // Link to users table
        nama,
        jabatan: 'Karyawan',
        gaji_pokok: 0.00,
        tunjangan: 0.00,
        no_hp: null,
        alamat: null
      };
      savedKaryawan = await karyawanDB.save(karyawanPayload);
    }

    return res.status(201).json({
      success: true,
      message: 'User berhasil terdaftar',
      data: {
        user: {
          id: savedUser.id,
          nama: savedUser.name,
          email: savedUser.email,
          role: savedUser.role
        },
        karyawan: savedKaryawan
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error.message || error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      debug: error.message 
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password harus diisi' });
    }

    const candidates = await usersDB.findMany({ email });
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    let user = null;
    for (const candidate of candidates) {
      const isPasswordValid = await bcrypt.compare(password, candidate.password);
      if (isPasswordValid) {
        user = candidate;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Server configuration error: JWT_SECRET not set' });
    }

    let karyawanInfo = null;
    if (user.role && user.role.toString().toLowerCase() === 'karyawan') {
      // Prefer stable link by user_id; fallback by name only for legacy rows.
      karyawanInfo = await karyawanDB.findOne({ user_id: user.id });
      if (!karyawanInfo) {
        karyawanInfo = await karyawanDB.findOne({ nama: user.name });
      }

      // If employee profile is deleted, block login for that karyawan account.
      if (!karyawanInfo) {
        return res.status(403).json({
          success: false,
          message: 'Akun karyawan sudah dinonaktifkan atau dihapus. Silakan hubungi admin.'
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nama: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          nama: user.name,
          email: user.email,
          role: user.role,
          karyawanId: karyawanInfo?.id || null,
          karyawan: karyawanInfo ? {
            id: karyawanInfo.id,
            nama: karyawanInfo.nama,
            jabatan: karyawanInfo.jabatan,
            gaji_pokok: karyawanInfo.gaji_pokok,
            tunjangan: karyawanInfo.tunjangan,
            no_hp: karyawanInfo.no_hp,
            alamat: karyawanInfo.alamat
          } : null
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await usersDB.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    const { password, ...userWithoutPassword } = user;

    if (user.role && user.role.toString().toLowerCase() === 'karyawan') {
      let karyawanInfo = await karyawanDB.findOne({ user_id: user.id });
      if (!karyawanInfo) {
        karyawanInfo = await karyawanDB.findOne({ nama: user.name });
      }
      if (karyawanInfo) {
        userWithoutPassword.karyawanId = karyawanInfo.id;
        userWithoutPassword.karyawan = {
          id: karyawanInfo.id,
          nama: karyawanInfo.nama,
          jabatan: karyawanInfo.jabatan,
          gaji_pokok: karyawanInfo.gaji_pokok,
          tunjangan: karyawanInfo.tunjangan,
          no_hp: karyawanInfo.no_hp,
          alamat: karyawanInfo.alamat
        };
      }
    }

    return res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await usersDB.getAll();
    const usersWithoutPassword = users.map(u => {
      const { password, ...user } = u;
      return user;
    });

    return res.json({ success: true, message: 'Data user berhasil diambil', data: usersWithoutPassword });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update user profile (including admin profile fields)
export const updateUser = async (req, res) => {
  try {
    const { nama, email, telepon, alamat, biografi, departemen } = req.body;

    const user = await usersDB.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    if (nama) user.name = nama;
    if (email) user.email = email;
    if (telepon !== undefined) user.telepon = telepon || null;
    if (alamat !== undefined) user.alamat = alamat || null;
    if (biografi !== undefined) user.biografi = biografi || null;
    if (departemen !== undefined) {
      const validDepartements = ['HR', 'Keuangan', 'IT', 'Operasional', 'Admin', 'Kesehatan', 'Pendidikan', 'Lainnya'];
      user.departemen = validDepartements.includes(departemen) ? departemen : null;
    }

    await usersDB.save(user);

    const { password, ...userWithoutPassword } = user;
    return res.json({ success: true, message: 'Profil berhasil diperbarui', data: userWithoutPassword });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default {
  register,
  login,
  getCurrentUser,
  getAllUsers,
  updateUser
};
