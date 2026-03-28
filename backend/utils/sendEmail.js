const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // TLS
            auth: {
                user: (process.env.SMTP_EMAIL || '').trim(),
                pass: (process.env.SMTP_PASSWORD || '').replace(/\s/g, '').trim(),
            },
            tls: {
                rejectUnauthorized: false // Helps in some local development environments
            }
        });

        const message = {
            from: `${process.env.SMTP_EMAIL}`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
            attachments: options.attachments || []
        };

        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Email could not be sent', error);
        return false;
    }
};

module.exports = sendEmail;
