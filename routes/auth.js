const express = require('express');
const router = express.Router();
const { checkNumberAvailability, resendOTP, verifyOTP, registerUser, login } = require('../controllers/Auth/Auth');
const { upload } = require('../config/multer');


router.post('/register/checkNumber', checkNumberAvailability);
router.post('/register/resendOTP', resendOTP);
router.post('/register/verifyOTP', verifyOTP);
router.post('/register/registerUser',upload.array("photo"), registerUser);
router.post('/login', login);

module.exports = router;