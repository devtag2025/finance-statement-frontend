const jwt = require('jsonwebtoken');
const Users = require('../models/user.model');

module.exports = async function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ ok:false, reason:'NO_TOKEN' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findById(payload.sub);
    if (!user) return res.status(401).json({ ok:false, reason:'USER_NOT_FOUND' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ ok:false, reason:'INVALID_TOKEN' });
  }
};
