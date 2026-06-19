import mongoose from 'mongoose';

const karyawanSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  nip: {
    type: String,
    required: true,
    unique: true
  },
  posisi: {
    type: String,
    required: true
  },
  departemen: {
    type: String,
    required: true
  },
  tanggalMasuk: {
    type: Date,
    required: true
  },
  noTelepon: String,
  alamat: String,
  statusKepegawaian: {
    type: String,
    enum: ['Aktif', 'Cuti', 'Resign'],
    default: 'Aktif'
  },
  gajiPokok: {
    type: Number,
    required: true
  },
  tunjangan: {
    type: Number,
    default: 0
  },
  asuransi: {
    type: Number,
    default: 0
  },
  pajak: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Karyawan', karyawanSchema);
