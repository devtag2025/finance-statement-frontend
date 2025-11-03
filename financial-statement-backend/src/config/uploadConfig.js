// src/config/uploadConfig.js
module.exports = {
  MAX_PAGES: 13,
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
  ALLOWED_MIME: new Set(['application/pdf', 'image/jpeg', 'image/png']),
  ALLOWED_EXT: new Set(['pdf', 'jpg', 'jpeg', 'png']),
};
