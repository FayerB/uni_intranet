const { Router } = require('express');
const ctrl = require('./reportes.controller');
const auth = require('../../middlewares/auth.middleware');
const role = require('../../middlewares/role.middleware');

const router = Router();
router.use(auth, role('admin'));

router.get('/resumen',          ctrl.getResumen);
router.get('/exportar/excel',   ctrl.exportarExcel);
router.get('/exportar/pdf',     ctrl.exportarPDF);

module.exports = router;
