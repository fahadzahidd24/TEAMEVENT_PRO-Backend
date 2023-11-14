const User = require('../../models/user');
const bcrypt = require('bcrypt');
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.VERIFY_SID;

const client = require("twilio")(accountSid, authToken);


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
            .then((verification) => console.log(verification.status))

        return res.status(200).json({ message: "OTP has been sent" });
    } catch (error) {
        return res.status(500).json({ message: `Internal Server Error` });
    }
}

exports.verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: `+92${phone}`, code: otpCode })
        .then((verification_check) => console.log(verification_check.status))

        return res.status(200).json({ message: "OTP has been verified" });
    } catch (error) {
        return res.status(500).json({ message: `Internal Server Error` });
    }
}
