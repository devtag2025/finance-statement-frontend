const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/plan.controller');
const auth = require('../../middlewares/auth');

router.get('/', ctrl.listActivePlans);
router.post('/post', ctrl.adminUpsertPlan);

module.exports = router;
