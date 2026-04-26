const adminMiddleware = (req, res, next) => {
  // req.user es inyectado previamente por authMiddleware
  if (req.user && req.user.rol.toLowerCase() === 'admin') {
    next(); // Es admin, lo dejamos pasar
  } else {
    res.status(403).json({ message: 'Acceso denegado: Requiere permisos de Administrador' });
  }
};

module.exports = adminMiddleware;