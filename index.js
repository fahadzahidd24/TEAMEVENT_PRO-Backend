const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDb = require('./config/db/db')
const auth = require('./routes/auth');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', auth)

const startServer = async () => {
    try {
        await connectDb();
        console.log("Database connected successfully");
        app.listen(8080, async () => {
            console.log('Server running on port 8080');
        });
    } catch (error) {
        console.log("error connecting database ==>", error);
    }
}

startServer();