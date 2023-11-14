const express = require('express');
const router = express.Router();
const { checkNumberAvailability, resendOTP, verifyOTP } = require('../controllers/Auth/Auth');

router.post('/register/checkNumber', checkNumberAvailability);
router.post('/register/resentOTP', resendOTP);
router.post('/register/verifyOTP', verifyOTP);

module.exports = router;