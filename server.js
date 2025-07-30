// Backend server for handling email requests
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true
}));
app.use(express.json());

// Email configuration
const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY || 're_NaXikq5T_kAw6o9izRNUA8vE3AUxn2sDM';
const FROM_EMAIL = process.env.VITE_FROM_EMAIL || 'noreply@skillo.com';
const RESEND_API_URL = 'https://api.resend.com/emails';

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, from } = req.body;

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, html'
      });
    }

    // Send email via Resend API
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || FROM_EMAIL,
        to: [to],
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Resend API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('✅ Email sent successfully:', {
      id: result.id,
      to: to,
      subject: subject,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      id: result.id,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Email server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email server running on http://localhost:${PORT}`);
  console.log(`📧 Ready to send emails via Resend API`);
  console.log(`🔑 Using API key: ${RESEND_API_KEY ? 'Configured' : 'Missing'}`);
});

export default app;