// src/routes/v1/upload.route.js
const express = require('express');
const multer = require('multer');
const { validateUpload } = require('../../controllers/uploadValidate.controller'); // or ...controller.js

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

router.post('/validate', upload.single('file'), validateUpload);

module.exports = router;
