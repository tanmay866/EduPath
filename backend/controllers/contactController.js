import sendEmail from '../utils/sendEmail.js';
import { layout, heading, paragraph, subtle, button, detailRows, notice } from '../utils/emailLayout.js';

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
    const adminEmailHTML = layout({
      preheader: `${name} sent a message through the EduPath contact form.`,
      eyebrow: 'Contact form',
      content: [
        heading('New contact form submission'),
        detailRows([
          { label: 'Name', value: name },
          { label: 'Email', value: email },
          { label: 'Phone', value: phone || 'Not provided' },
          { label: 'Received', value: new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }) },
        ]),
        paragraph(String(message).replace(/\n/g, '<br />')),
        button('Reply to ' + name, `mailto:${email}`),
      ].join('\n'),
    });

    const userEmailHTML = layout({
      preheader: 'We received your message and will reply soon.',
      eyebrow: 'Contact',
      content: [
        heading('Thanks for getting in touch'),
        paragraph(`Hi ${name}, we received your message and someone will reply within a couple of working days.`),
        paragraph('For reference, here is what you sent:'),
        subtle(String(message).replace(/\n/g, '<br />')),
        notice('No action is needed from you. If your question becomes urgent, simply reply to this email.'),
      ].join('\n'),
    });


    // Send email to admin (you)
    await sendEmail({
      email: process.env.EMAIL_USER, // Your Gmail
      subject: `Contact form: ${name}`,
      html: adminEmailHTML
    });

    // Send confirmation email to user
    await sendEmail({
      email: email,
      subject: 'We received your message',
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
