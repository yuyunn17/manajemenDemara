import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'karyawan'],
    default: 'karyawan'
  },
  karyawanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Karyawan'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Profile fields for admin/karyawan
  telepon: {
    type: String,
    default: null
  },
  alamat: {
    type: String,
    default: null
  },
  biografi: {
    type: String,
    default: null
  },
  departemen: {
    type: String,
    enum: ['HR', 'Keuangan', 'IT', 'Operasional', 'Admin', 'Kesehatan', 'Pendidikan', 'Lainnya'],
    default: null
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password sebelum disimpan
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method untuk membandingkan password
userSchema.methods.comparePassword = async function(password) {
  return await bcryptjs.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
