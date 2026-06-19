import mongoose from 'mongoose';

const gajiSchema = new mongoose.Schema({
  karyawanId: {
    type: String,
    required: true
  },
  nama: {
    type: String,
    required: true
  },
  periode: {
    type: String,
    required: true
  },
  gajiPokok: {
    type: Number,
    required: true
  },
  tunjangan: {
    type: Number,
    default: 0
  },
  harga: {
    type: Number,
    default: 0
  },
  fee: {
    type: Number,
    default: 0
  },
  feePercent: {
    type: Number,
    default: 0
  },
  feeAmount: {
    type: Number,
    default: 0
  },
  treatment: {
    type: String,
    default: ""
  },
  pasien: {
    type: String,
    default: ""
  },
  bonus: {
    type: Number,
    default: 0
  },
  potonganAsuransi: {
    type: Number,
    default: 0
  },
  potonganTax: {
    type: Number,
    default: 0
  },
  gajiKotor: {
    type: Number,
    required: true
  },
  gajiNetto: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Proses', 'Selesai'],
    default: 'Draft'
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

export default mongoose.model('Gaji', gajiSchema);
