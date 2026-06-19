import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET not set' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user?.role || req.user.role.toString().toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Hanya admin yang bisa akses' });
  }
  next();
};
