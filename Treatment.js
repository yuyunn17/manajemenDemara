import mongoose from 'mongoose';

const treatmentSchema = new mongoose.Schema({
  karyawanId: {
    type: String,
    required: true
  },
  nama: {
    type: String,
    required: true
  },
  tipeLayanan: {
    type: String,
    required: true
  },
  tanggal: {
    type: Date,
    required: true
  },
  rumahSakit: String,
  dokter: String,
  diagnosis: String,
  treatment: String,
  biaya: {
    type: Number,
    default: 0
  },
  asuransiMenanggung: {
    type: Number,
    default: 0
  },
  biayaPasien: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Diproses', 'Selesai'],
    default: 'Pending'
  },
  keterangan: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Treatment', treatmentSchema);
