import transporter from "../config/mailConfig.js";

const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: `"EduPath" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html
    });
};

export default sendEmail;
