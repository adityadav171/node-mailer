// server.js
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

    });

    const mailOptions = {
    
      // 1. Send it FROM your authenticated Hostinger email
      from: `"TechHubbix Website" <${process.env.SMTP_USER}>`, 
      
      // 2. When you click 'Reply' in your inbox, it will reply to the customer
      replyTo: email, 
      
      // 3. Send it TO yourself
      to: process.env.RECEIVER_EMAIL, 
      
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
   
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!' });
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email.', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});