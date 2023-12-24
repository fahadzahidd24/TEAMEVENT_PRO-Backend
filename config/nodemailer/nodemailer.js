const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'xtremearena24@gmail.com',
        pass: process.env.MAIL_APP_PASSWORD
    }
});

async function sendEmail(toEmail, subject, body) {
    return new Promise((resolve, reject) => {
        let body_string = body.toString();
        const mailOptions = {
            from: 'xtremearena24@gmail.com',
            to: toEmail,
            subject: subject,
            html: body_string
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log('Email sent: ' + info.response);
                resolve(info);
            }
        });
    });
}

module.exports = sendEmail;
