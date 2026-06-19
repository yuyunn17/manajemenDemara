import mongoose from 'mongoose';

const cutiSchema = new mongoose.Schema({
  karyawanId: {
    type: String,
    required: true
  },
  nama: {
    type: String,
    required: true
  },
  tanggal: {
    type: Date,
    required: true
  },
  lama: {
    type: Number,
    required: true
  },
  alasan: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Disetujui', 'Ditolak'],
    default: 'Pending'
  },
  rejectionReason: String,
  updatedBy: String,
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Cuti', cutiSchema);
