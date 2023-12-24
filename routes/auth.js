const express = require('express');
const router = express.Router();
const { registerUser, login, verifyOtp, resendOtp, setUser, forgotPassword, newPassword } = require('../controllers/Auth/Auth');
const { upload } = require('../config/multer');


router.post('/setUser', upload.array("photo"), setUser);
router.post('/resendOTP', resendOtp);
router.post('/verifyOTP', verifyOtp);
router.post('/register', registerUser);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.post('/newPassword', newPassword);

module.exports = router;