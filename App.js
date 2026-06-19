import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";

import LayoutAdmin from "./Layout/LayoutAdmin";
import LayoutKaryawan from "./Layout/LayoutKaryawan";

// LOGIN PAGE
import Login from "./Karyawan/Login";
import Register from "./Karyawan/Register";

// ADMIN PAGE
import DashboardAdmin from "./Admin/Dashboard";
import Karyawan from "./Admin/Karyawan";
import AbsensiAdmin from "./Admin/Absensi";
import CutiKaryawan from "./Admin/CutiKaryawan";
import Gaji from "./Admin/Gaji";
import SlipGajiAdmin from "./Admin/SlipGaji";
import Treatment from "./Admin/Treatment";
import AdminProfileSettings from "./Pages/AdminProfileSettings";
import AdminSecurity from "./Pages/AdminSecurity";
import AdminHelp from "./Pages/AdminHelp";

// KARYAWAN PAGE
import DashboardKaryawan from "./Karyawan/DashboardKaryawan";
import DataDiri from "./Karyawan/DataDiri";
import AbsensiKaryawan from "./Karyawan/AbsensiKaryawan";
import SlipGajiKaryawan from "./Karyawan/SlipgajiKaryawan";
import CutiKaryawanKaryawan from "./Karyawan/CutiKaryawan";
import KaryawanProfileSettings from "./Pages/KaryawanProfileSettings";
import KaryawanSecurity from "./Pages/KaryawanSecurity";
import KaryawanHelp from "./Pages/KaryawanHelp";

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-10 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Halaman tidak ditemukan</h1>
      <p className="text-gray-600 mb-6">URL yang Anda tuju tidak tersedia. Silakan kembali ke halaman login atau pilih menu yang benar.</p>
      <a href="/login" className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-white font-semibold hover:bg-gray-800 transition">Kembali ke Login</a>
    </div>
  </div>
);

function App() {
  return (
    <AppContextProvider>
      <Router>
        <Routes>

          {/* Login Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Redirect root "/" ke /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ================= ADMIN ROUTE ================= */}
          <Route path="/admin" element={<LayoutAdmin />}>

            {/* Default halaman admin → /admin/dashboard */}
            <Route index element={<DashboardAdmin />} />

            <Route path="dashboard" element={<DashboardAdmin />} />
            <Route path="karyawan" element={<Karyawan />} />
            <Route path="absensi" element={<AbsensiAdmin />} />
            <Route path="cuti" element={<CutiKaryawan />} />
            <Route path="gaji" element={<Gaji />} />
            <Route path="slip-gaji" element={<SlipGajiAdmin />} />
            <Route path="treatment" element={<Treatment />} />
            <Route path="profile" element={<AdminProfileSettings />} />
            <Route path="security" element={<AdminSecurity />} />
            <Route path="help" element={<AdminHelp />} />

          </Route>

          {/* ================= KARYAWAN ROUTE ================= */}
          <Route path="/karyawan" element={<LayoutKaryawan />}>

            {/* default → /karyawan/dashboard */}
            <Route index element={<DashboardKaryawan />} />

            <Route path="dashboard" element={<DashboardKaryawan />} />
            <Route path="datadiri" element={<DataDiri />} />
            <Route path="absensi" element={<AbsensiKaryawan />} />
            <Route path="slipgaji" element={<SlipGajiKaryawan />} />
            <Route path="cuti" element={<CutiKaryawanKaryawan />} />
            {/* Treatment (karyawan) removed from karyawan portal */}
            <Route path="profile" element={<KaryawanProfileSettings />} />
            <Route path="security" element={<KaryawanSecurity />} />
            <Route path="help" element={<KaryawanHelp />} />

          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </Router>
    </AppContextProvider>
  );
}

export default App;
