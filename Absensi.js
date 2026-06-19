import mongoose from 'mongoose';

const absensiSchema = new mongoose.Schema({
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
  jamMasuk: String,
  jamKeluar: String,
  status: {
    type: String,
    enum: ['Hadir', 'Libur', 'Sakit', 'Izin', 'Cuti'],
    default: 'Hadir'
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

export default mongoose.model('Absensi', absensiSchema);
