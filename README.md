# Gaji Demara - Backend Setup

Backend untuk Sistem Manajemen Gaji & HR Demara

## Struktur Folder

```
server/
├── models/              # Database schemas
│   ├── User.js
│   ├── Karyawan.js
│   ├── Absensi.js
│   ├── Cuti.js
│   ├── Gaji.js
│   ├── Treatment.js
│   └── SlipGaji.js
├── controllers/         # Business logic
│   ├── authController.js
│   ├── karyawanController.js
│   ├── cutiController.js
│   ├── absensiController.js
│   ├── gajiController.js
│   ├── treatmentController.js
│   └── slipGajiController.js
├── routes/              # API routes
│   ├── auth.js
│   ├── karyawan.js
│   ├── cuti.js
│   ├── absensi.js
│   ├── gaji.js
│   ├── treatment.js
│   └── slipGaji.js
├── middleware/          # Custom middleware
│   └── auth.js
├── server.js            # Main server file
├── package.json         # Dependencies
├── .env                 # Environment variables
└── API_DOCUMENTATION.md # API documentation
```

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Setup MySQL

**Option A: Local MySQL (Windows)**
- Buka Laragon, XAMPP, atau layanan MySQL lainnya dan jalankan MySQL.
- Jika MySQL diinstall sebagai service Windows, gunakan:
```powershell
net start mysql
```

**Option A: Local MySQL (Mac/Linux)**
```bash
mysql.server start
```

**Option B: Remote MySQL**
1. Gunakan layanan MySQL yang tersedia.
2. Catat host, port, user, password, dan nama database.
3. Update variabel database di `server/.env`.

### 3. Configure Environment

Buat file `server/.env` dari contoh `server/.env.example`:
```bash
cd server
copy .env.example .env
```

Kemudian edit `server/.env`:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=demara_gaji
NODE_ENV=development
JWT_SECRET=your_secure_jwt_secret_key_here_minimum_32_characters
ADMIN_REGISTER_KEY=change_this_to_secret_key
```

### 4. Setup Database

Jalankan:
```bash
cd server
npm run setup-db
```

Perintah ini akan membuat database `demara_gaji` dan tabel-tabel yang dibutuhkan secara otomatis.

### 5. Start Server

**Development Mode:**
```bash
npm run dev
```

### 4. Start Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Server akan berjalan di: `http://localhost:5000`

## Initial Setup - Create Admin User

Setelah server berjalan, buat user admin melalui API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Admin Demara",
    "email": "admin@demara.com",
    "password": "admin123",
    "role": "admin"
  }'
```

Login dengan credentials:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demara.com",
    "password": "admin123"
  }'
```

Gunakan token yang diberikan untuk request selanjutnya:
```bash
Authorization: Bearer <token_dari_login>
```

## API Testing

### Menggunakan Postman
1. Import API ke Postman
2. Set variable: `base_url` = `http://localhost:5000`
3. Test endpoints

### Menggunakan cURL
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demara.com","password":"admin123"}'

# Get all karyawan (requires token)
curl http://localhost:5000/api/karyawan \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (admin only)
- `PUT /api/auth/profile` - Update profile

### Karyawan
- `GET /api/karyawan` - Get all
- `GET /api/karyawan/:id` - Get by ID
- `POST /api/karyawan` - Create (admin only)
- `PUT /api/karyawan/:id` - Update (admin only)
- `DELETE /api/karyawan/:id` - Delete (admin only)

### Cuti
- `GET /api/cuti` - Get all
- `GET /api/cuti/karyawan/:karyawanId` - Get by karyawan
- `POST /api/cuti` - Create
- `PUT /api/cuti/:id` - Update status (admin only)
- `DELETE /api/cuti/:id` - Delete (admin only)

### Absensi
- `GET /api/absensi` - Get all
- `GET /api/absensi/karyawan/:karyawanId` - Get by karyawan
- `POST /api/absensi` - Create (admin only)
- `PUT /api/absensi/:id` - Update (admin only)
- `DELETE /api/absensi/:id` - Delete (admin only)

### Gaji
- `GET /api/gaji` - Get all
- `GET /api/gaji/karyawan/:karyawanId` - Get by karyawan
- `POST /api/gaji` - Create (admin only)
- `PUT /api/gaji/:id` - Update (admin only)
- `DELETE /api/gaji/:id` - Delete (admin only)

### Treatment
- `GET /api/treatment` - Get all
- `GET /api/treatment/karyawan/:karyawanId` - Get by karyawan
- `POST /api/treatment` - Create (admin only)
- `PUT /api/treatment/:id` - Update (admin only)
- `DELETE /api/treatment/:id` - Delete (admin only)

### Slip Gaji
- `GET /api/slip-gaji` - Get all
- `GET /api/slip-gaji/karyawan/:karyawanId` - Get by karyawan
- `POST /api/slip-gaji` - Create (admin only)
- `PUT /api/slip-gaji/:id` - Update (admin only)
- `DELETE /api/slip-gaji/:id` - Delete (admin only)

## Frontend Integration

Update frontend API base URL di `.env` atau file config:

```javascript
// Contoh untuk React
const API_URL = 'http://localhost:5000/api';

// Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
localStorage.setItem('token', data.data.token);

// Fetch dengan token
const response = await fetch(`${API_URL}/karyawan`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Troubleshooting

### MySQL Connection Error
- Pastikan MySQL sudah running di laptop tersebut.
- Cek nilai `DB_HOST`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` di `server/.env`.
- Pastikan database `demara_gaji` dibuat dengan `npm run setup-db`.

### Port Already in Use
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### JWT Token Error
- Pastikan token ada di header: `Authorization: Bearer <token>`
- Pastikan `JWT_SECRET` sama di `server/.env`
- Token memiliki expiry 7 hari

## Production Deployment

### Environment Setup
```env
NODE_ENV=production
JWT_SECRET=generate_new_strong_key
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=demara_gaji
```

### Recommendations
- Use environment variables untuk sensitive data
- Enable HTTPS
- Setup logging dan monitoring
- Use process manager (PM2)
- Setup database backups
- Configure firewall & security

## Development Notes

- Models: Menggunakan MySQL untuk database

- Routes: Express Router untuk modular routing
- Controllers: Separation of concerns
- Middleware: Custom auth middleware untuk JWT
- Error Handling: Centralized error handling

## Support

Untuk pertanyaan atau issues, hubungi tim development.

---

Happy coding! 🚀
