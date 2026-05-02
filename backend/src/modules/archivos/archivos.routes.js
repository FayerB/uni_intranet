const { Router } = require('express');
const ctrl = require('./archivos.controller');
const auth = require('../../middlewares/auth.middleware');
const uploadMiddleware = require('../../middlewares/upload.middleware');
const limiter = require('../../middlewares/rateLimiter.middleware');

const router = Router();
router.use(auth);

router.post('/upload', limiter.upload, uploadMiddleware.single, ctrl.upload);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
