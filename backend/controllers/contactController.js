import sendEmail from '../utils/sendEmail.js';

/**
 * Handle contact form submission
 * @route POST /api/contact/send
 * @access Public
 */
export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Email content to admin (you)
    const adminEmailHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
          }
          .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
          }
          .info-box strong {
            color: #667eea;
            display: block;
            margin-bottom: 5px;
          }
          .message-box {
            background-color: #e9ecef;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Contact Form Submission</h1>
          </div>
          <div class="content">
            <p>You have received a new message from the EduPath contact form:</p>
            
            <div class="info-box">
              <strong>👤 Name:</strong>
              ${name}
            </div>
            
            <div class="info-box">
              <strong>📧 Email:</strong>
              <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
            </div>
            
            ${phone ? `
            <div class="info-box">
              <strong>📞 Phone:</strong>
              <a href="tel:${phone}" style="color: #667eea; text-decoration: none;">${phone}</a>
            </div>
            ` : ''}
            
            <div class="info-box">
              <strong>💬 Message:</strong>
              <div class="message-box">${message}</div>
            </div>
            
            <p><strong>📅 Received:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div class="footer">
            <p>This is an automated message from EduPath Contact Form</p>
            <p>EduPath © ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Confirmation email to user
    const userEmailHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #667eea;
            margin-top: 0;
          }
          .message-copy {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Thank You!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for contacting <strong>EduPath</strong>! We have successfully received your message and our team will review it shortly.</p>
            
            <p>We aim to respond to all inquiries within <strong>24-48 hours</strong> during business days.</p>
            
            <div class="message-copy">
              <strong>Your message:</strong>
              <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <p>In the meantime, feel free to explore our platform and discover personalized learning paths tailored just for you!</p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}" class="button">Visit EduPath</a>
            </center>
            
            <p style="margin-top: 30px;">If you have any urgent questions, please call us at <strong>+91 9512842105</strong>.</p>
            
            <p>Best regards,<br><strong>The EduPath Team</strong></p>
          </div>
          <div class="footer">
            <p><strong>EduPath</strong> - Your Personal Learning Journey</p>
            <p>CHARUSAT University, Changa, Anand, Gujarat-388421</p>
            <p>© ${new Date().getFullYear()} EduPath. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin (you)
    await sendEmail({
      email: process.env.EMAIL_USER, // Your Gmail
      subject: `🔔 New Contact Form Submission from ${name}`,
      html: adminEmailHTML
    });

    // Send confirmation email to user
    await sendEmail({
      email: email,
      subject: 'Thank you for contacting EduPath! ✨',
      html: userEmailHTML
    });

    // Success response
    res.status(200).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};
