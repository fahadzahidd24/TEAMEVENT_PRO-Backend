const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        await mongoose.connect(`mongodb+srv://crud:apFCn3h50Hoj30iN@crud.fg66fgt.mongodb.net/TEAMEVENT_PRO?retryWrites=true&w=majority`);
        return mongoose.connection;
    } catch (error) {
        console.log("error connecting database ==>", error);
    }
}

module.exports = connectDb;