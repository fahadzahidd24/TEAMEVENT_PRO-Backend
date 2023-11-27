const { uploadToCloudinary } = require('../../config/cloudinary');
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.VERIFY_SID;
const client = require("twilio")(accountSid, authToken);
const jwt = require('jsonwebtoken');


exports.checkNumberAvailability = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: "Please enter Valid Phone Number" });
        else if (phone.length !== 10) return res.status(400).json({ message: "Phone Number is Invalid" });

        const existingUser = await User.find({ phone });

        if (existingUser.length > 0)
            return res.status(409).json({ message: "User with this Phone Number already exists" });

        client.verify.v2
            .services(verifySid)
            .verifications.create({ to: `+92${phone}`, channel: "sms" })
            .then((verification) => console.log(verification.status))

        return res.status(200).json({ message: "Phone number is good to go" });
    } catch (error) {
        return res.status(500).json({ message: `Internal Server Error` });
    }
}

exports.resendOTP = (req, res) => {
    try {
        const { phone } = req.body;
        client.verify.v2
            .services(verifySid)
            .verifications.create({ to: `+92${phone}`, channel: "sms" })
            .then((verification) => {
                console.log(verification.status);
                return res.status(200).json({ message: "OTP is sent" });
            }).catch((err) => console.log(err));

    } catch (error) {
        return res.status(500).json({ message: `Internal Server Error` });
    }
}

exports.verifyOTP = async (req, res) => {
    console.log("agya");
    try {
        const { phone, otp } = req.body;
        client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: `+92${phone}`, code: otp })
            .then((verification_check) => {
                console.log(verification_check.status);
                if (verification_check.status === "approved") {
                    return res.status(200).json({ message: "OTP is verified" });
                } else {
                    return res.status(400).json({ message: "OTP is not verified" });
                }
            }).catch((err) => console.log(err));

    } catch (error) {
        return res.status(500).json({ message: `Internal Server Error` });
    }
}

exports.registerUser = async (req, res) => {
    try {
        const { name, phone, password, username } = req.body;
        const file = req.files[0];
        if (!name || !phone || !password || !username)
            return res.status(400).json({ message: "Please enter all fields" });

        const existingUser = await User.find({ username });
        if (existingUser.length > 0)
            return res.status(409).json({ message: "This username is already taken" });


        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const cloudinaryResponse = await uploadToCloudinary(file.path, "user-image");
        console.log(cloudinaryResponse.secure_url);
        const newUser = new User({
            name,
            phone,
            password: passwordHash,
            username,
            profilePicture: cloudinaryResponse.secure_url,
        });

        const savedUser = await newUser.save();
        return res.status(200).json({ message: "User is registered successfully" });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: `Internal Server Error` });
    }
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ message: "Please enter all fields" });

        let existingUser = await User.findOne({ username });
        if (!existingUser)
            return res.status(404).json({ message: "This username does not exist" });

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect)
            return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET);
        existingUser = { ...existingUser._doc, password: null };
        return res.status(200).json({ message: "User has logged in successfully", token, user: existingUser });

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: `Internal Server Error` });
    }
}
