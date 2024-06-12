const express = require('express');
const { apiKey, permission } = require('../auth/checkAuth');

const router = express.Router();

// check apikey

router.use('/v1/api/chat', require('./chat'));
router.use('/v1/api/vnpay', require('./VnPay'));

router.use(apiKey);

// // check permission

router.use(permission('0000'));

router.use('/v1/api/discount', require('./discount'));
router.use('/v1/api/product', require('./product'));
router.use('/v1/api/shop', require('./access'));
router.use('/v1/api/cart', require('./cart'));
router.use('/v1/api/transaction', require('./transaction'));
router.use('/v1/api/contact', require('./contacts'));
router.use('/v1/api/users', require('./users'));

module.exports = router;
