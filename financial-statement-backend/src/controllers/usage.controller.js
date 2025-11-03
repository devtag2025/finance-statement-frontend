const User = require('../models/user.model');
exports.summary = async (req, res) => {
  const u = await User.findById(req.user._id);
  res.json({
    ok:true,
    data: {
      exportsUsed: u?.exportsUsed ?? 0,
      exportsLimit: u?.exportsLimit ?? 0,
      periodStart: u?.usagePeriod?.periodStart,
      periodEnd: u?.usagePeriod?.periodEnd,
    }
  });
};