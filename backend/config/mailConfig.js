import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Without these, nodemailer waits indefinitely. Hosts that throttle or block
    // outbound port 587 leave the socket open rather than refusing it, so a send
    // could hang for minutes instead of failing and letting the caller move on.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email Server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email Configuration Error:', error.message);
    console.error('Please check your email credentials in .env file');
    return false;
  }
};

export default createTransporter;