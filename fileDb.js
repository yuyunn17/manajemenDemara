import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../data');
const USERS_FILE = path.join(DB_PATH, 'users.json');
const KARYAWAN_FILE = path.join(DB_PATH, 'karyawan.json');

// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// Initialize files if they don't exist
const initializeFiles = () => {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(KARYAWAN_FILE)) {
    fs.writeFileSync(KARYAWAN_FILE, JSON.stringify([], null, 2));
  }
};

initializeFiles();

// Users Database
const usersDB = {
  getAll: () => {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  },

  findOne: (query) => {
    const users = usersDB.getAll();
    return users.find(u => {
      for (const key in query) {
        if (u[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findById: (id) => {
    const users = usersDB.getAll();
    return users.find(u => u.id === id);
  },

  save: (user) => {
    const users = usersDB.getAll();
    if (user.id) {
      // Update existing
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users[index] = { ...users[index], ...user };
      } else {
        users.push(user);
      }
    } else {
      // Create new
      user.id = `USR${Date.now()}`;
      user.createdAt = new Date().toISOString();
      users.push(user);
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return user;
  },

  delete: (id) => {
    const users = usersDB.getAll();
    const filtered = users.filter(u => u.id !== id);
    fs.writeFileSync(USERS_FILE, JSON.stringify(filtered, null, 2));
  }
};

// Karyawan Database
const karyawanDB = {
  getAll: () => {
    try {
      const data = fs.readFileSync(KARYAWAN_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  },

  findOne: (query) => {
    const karyawans = karyawanDB.getAll();
    return karyawans.find(k => {
      for (const key in query) {
        if (k[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findById: (id) => {
    const karyawans = karyawanDB.getAll();
    return karyawans.find(k => k.id === id);
  },

  save: (karyawan) => {
    const karyawans = karyawanDB.getAll();
    if (karyawan.id) {
      const index = karyawans.findIndex(k => k.id === karyawan.id);
      if (index !== -1) {
        karyawans[index] = { ...karyawans[index], ...karyawan };
      } else {
        karyawans.push(karyawan);
      }
    } else {
      karyawan.id = `EMP${Date.now()}`;
      karyawan.createdAt = new Date().toISOString();
      karyawans.push(karyawan);
    }
    fs.writeFileSync(KARYAWAN_FILE, JSON.stringify(karyawans, null, 2));
    return karyawan;
  },

  delete: (id) => {
    const karyawans = karyawanDB.getAll();
    const filtered = karyawans.filter(k => k.id !== id);
    fs.writeFileSync(KARYAWAN_FILE, JSON.stringify(filtered, null, 2));
  }
};

export { usersDB, karyawanDB };
