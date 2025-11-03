const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/billing.controller');
const requireAuth = require('../../middlewares/requireAuth');

router.post('/create-checkout-session', requireAuth, ctrl.createCheckout);
router.post('/create-portal', requireAuth, ctrl.createPortal);

// Webhook route must be mounted with raw body in server entrypoint
module.exports = router;
