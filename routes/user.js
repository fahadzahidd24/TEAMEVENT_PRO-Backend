const express = require('express');
const router = express.Router();
const { upload } = require('../config/multer');
const { UpdateProfile } = require('../controllers/User/User');

router.put('/user/updateProfile', upload.array("photo"), UpdateProfile);

module.exports = router;