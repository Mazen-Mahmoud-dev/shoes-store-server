const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email',
      html: `<h3>Click the link to verify your email</h3>
             <a href="${process.env.CLIENT_URL}/verifiedemail/${token}">Verify Email</a>`
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:',error);
  }
};

module.exports = sendVerificationEmail;
