const express = require('express');
const multer = require('multer');
const router = express.Router();
const BackupController = require('../controllers/backupController');
const authMiddleware = require('../middleware/auth');

// 配置multer
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB限制
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('只支持JSON格式的备份文件'));
    }
  }
});

// 所有接口都需要认证
router.use(authMiddleware);

router.post('/create', BackupController.createBackup);
router.get('/logs', BackupController.getBackupLogs);
router.post('/restore', upload.single('file'), BackupController.restoreData);
router.delete('/logs/:id', BackupController.deleteBackup);

module.exports = router;
