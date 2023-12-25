const { uploadToCloudinary } = require("../../config/cloudinary");
const User = require("../../models/user");
const bcrypt = require('bcrypt');

exports.UpdateProfile = async (req, res) => {
    try {
        const { name, email, currentPassword, password, CPassword } = req.body;
        const file = req.files[0];

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "This Email is no longer registered" });
        }
        if (!name || !email)
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
        const cloudinaryResponse = await uploadToCloudinary(file.path, "user-image");
        user.name = name;
        user.email = email;
        user.profilePicture = cloudinaryResponse.secure_url;
        user.save();
        user = user.toObject();
        delete user.password;
        return res.status(200).json({ message: "Profile Updated Successfully", user: user  });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: `Internal Server Error` });
    }
}