const { uploadToCloudinary } = require("../../config/cloudinary");
const User = require("../../models/user");
const bcrypt = require('bcrypt');

exports.UpdateProfile = async (req, res) => {
    try {
        console.log("agya");
        const { name, phone, currentPassword, password, CPassword } = req.body;
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: "This phone number is no longer registered" });
        }
        if (!name || !phone)
            return res.status(400).json({ message: "Please fill all the fields" });
        if (password && CPassword && currentPassword) {
            const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordCorrect)
                return res.status(400).json({ message: "Current Password is not correct" });
            else if (password !== CPassword)
                return res.status(400).json({ message: "Confirm Password and Password must Match" });
            else {
                const salt = await bcrypt.genSalt();
                const passwordHash = await bcrypt.hash(password, salt);
                user.password = passwordHash;
            }
        }

        user.name = name;
        user.phone = phone;
        await user.save();
        user.password = undefined;

        return res.status(200).json({ message: "Profile Updated Successfully", user });



        // const file = req.files[0];
        // if (!file) {
        //     user.name = name;
        //     user.phone = phone;

        //     user.save();
        //     return res.status(200).json({ message: "Profile Updated Successfully" });
        // }
        // const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        // if (!isPasswordCorrect)
        // return res.status(400).json({ message: "Invalid Credentials" });
        // const salt = await bcrypt.genSalt();
        // const passwordHash = await bcrypt.hash(password, salt);
        // const cloudinaryResponse = await uploadToCloudinary(file.path, "user-image");
        // console.log(cloudinaryResponse.secure_url);
        // user.name = name;
        // user.phone = phone;
        // user.password = passwordHash;
        // user.profilePicture = cloudinaryResponse.secure_url;
        // user.save();
        // return res.status(200).json({ message: "Profile Updated Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Internal Server Error` });
    }
}