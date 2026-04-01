// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Your Contact API Route
app.post('/api/contact', async (req, res) => {
  console.log('Received contact form submission: API endpoint hit');
  const { name, email, phone, company, subject, message, service } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ message: 'Name, email, phone, and message are required fields.' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "TechHubbix Website <website@techhubbix.in>",
      to: process.env.RECEIVER_EMAIL,
      reply_to: email,
      subject: subject || `New Contact Form Submission - ${service}`,
      html: `
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // Check if Resend sent back an error
    if (error) {
      console.error('Resend API Error:', error);
      return res.status(400).json({ message: 'Resend rejected the email', error });
    }

    console.log('Email sent successfully! Resend ID:', data.id);
    res.status(200).json({ message: 'Email sent successfully!' });
    
  } catch (error) {
    console.error('Server crash sending email:', error);
    res.status(500).json({ message: 'Failed to send email.', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});