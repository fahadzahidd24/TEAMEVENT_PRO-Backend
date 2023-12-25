const { uploadToCloudinary } = require('../../config/cloudinary');
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../config/nodemailer/nodemailer');
const otpGenerator = require('otp-generator');

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // const file = req.files[0];
        if (!name || !email || !password)
            return res.status(400).json({ message: "Please enter all fields" });

        const existingUser = await User.find({ email });
        if (existingUser.length > 0)
            return res.status(409).json({ message: "This email is already taken" });

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false, digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false });
        const subject = "OTP for Registration of TEAMEVENT PRO";
        const body = `<h3>Your OTP for Registration is ${otp}</h3>`;
        const toEmail = email;
        await sendEmail(toEmail, subject, body);
        // const cloudinaryResponse = await uploadToCloudinary(file.path, "user-image");
        // console.log(cloudinaryResponse.secure_url);
        const newUser = new User({
            name,
            email,
            password: passwordHash,
            otp,
            isVerified: false,
        });

        await newUser.save();
        return res.status(200).json({ message: "User is registered successfully" });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: `Internal Server Error` });
    }
}

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp)
            return res.status(400).json({ message: "Please enter all fields" });

        const existingUser = await User.findOne({ email });
        if (!existingUser)
            return res.status(404).json({ message: "This email does not exist" });

        if (existingUser.otp !== otp)
            return res.status(400).json({ message: "Invalid OTP" });

        existingUser.isVerified = true;
        existingUser.otp = "";
        await existingUser.save();
        return res.status(200).json({ message: "User is verified successfully" });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: `Internal Server Error` });
    }
}

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: "Please enter all fields" });

        const existingUser = await User.findOne({ email });
        if (!existingUser)
            return res.status(404).json({ message: "This email does not exist" });

        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false, digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false });
        const subject = "OTP for Registration of TEAMEVENT PRO";
        const body = `<h3>Your OTP for Registration is ${otp}</h3>`;
        const toEmail = email;
        await sendEmail(toEmail, subject, body);
        existingUser.otp = otp;
        await existingUser.save();
        return res.status(200).json({ message: "OTP is sent successfully" });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: `Internal Server Error` });
    }
}

exports.setUser = async (req, res) => {
    try {
        const { email } = req.body;
        const file = req.files[0];
        if (!file)
            return res.status(400).json({ message: "Please upload a file" });

        const existingUser = await User.findOne({ email });
        if (!existingUser)
            return res.status(404).json({ message: "This email does not exist" });

        const cloudinaryResponse = await uploadToCloudinary(file.path, "user-image");
        console.log(cloudinaryResponse.secure_url);
        existingUser.profilePicture = cloudinaryResponse.secure_url;
        await existingUser.save();

        return res.status(200).json({ message: "User is registered successfully" });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: `Internal Server Error` });
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Please enter all fields" });

        let existingUser = await User.findOne({ email: email.trim() });
        if (!existingUser)
            return res.status(404).json({ message: "This email does not exist" });

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect)
            return res.status(400).json({ message: "Invalid Credentials" });

        if (!existingUser.isVerified)
            return res.status(400).json({ message: "User is not verified" });

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET);
        existingUser = { ...existingUser._doc, password: null };
        return res.status(200).json({ message: "User has logged in successfully", token, user: existingUser });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: `Internal Server Error` });
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: "Please enter Email" });

        const existingUser = await User.findOne({ email });
        if (!existingUser)
            return res.status(404).json({ message: "This email does not exist" });

        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false, digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false });
        const subject = "OTP for Reset Password of TEAMEVENT PRO";
        const body = `<h3>Your OTP for Reset Password is ${otp}</h3>`;
        const toEmail = email;
        await sendEmail(toEmail, subject, body);
        existingUser.otp = otp;
        await existingUser.save();
        return res.status(200).json({ message: "OTP is sent successfully" });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: `Internal Server Error` });
    }
}

exports.newPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Please enter all fields" });

        const existingUser = await User.findOne({ email });
        if (!existingUser)
            return res.status(404).json({ message: "This email does not exist" });

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        existingUser.password = passwordHash;
        await existingUser.save();
        return res.status(200).json({ message: "Password is updated successfully" });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: `Internal Server Error` });
    }
}