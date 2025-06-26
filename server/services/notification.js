import nodemailer from 'nodemailer';
import twilio from 'twilio';
import Settings from '../models/Settings.js';

// Email configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// SMS configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendNotification = async (student, status, date, type = 'both') => {
  try {
    const settings = await Settings.findOne();
    const formattedDate = new Date(date).toLocaleDateString();
    
    if ((type === 'email' || type === 'both') && settings?.emailSettings?.enabled) {
      await sendEmail(student, status, formattedDate, settings.emailSettings.template);
    }
    
    if ((type === 'sms' || type === 'both') && settings?.smsSettings?.enabled) {
      await sendSMS(student, status, formattedDate, settings.smsSettings.template);
    }
  } catch (error) {
    console.error('Notification error:', error);
    throw error;
  }
};

const sendEmail = async (student, status, date, template) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email credentials not configured');
      return;
    }

    const transporter = createEmailTransporter();
    
    const message = template
      .replace('{{parentName}}', student.parentName)
      .replace('{{studentName}}', student.name)
      .replace('{{status}}', status)
      .replace('{{date}}', date);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.parentEmail,
      subject: `Attendance Alert - ${student.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Attendance Notification</h2>
          <p>${message}</p>
          <p>If you have any questions, please contact the school.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is an automated message from the school attendance system.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${student.parentEmail}`);
  } catch (error) {
    console.error('Email sending error:', error);
  }
};

const sendSMS = async (student, status, date, template) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.log('Twilio credentials not configured');
      return;
    }

    const message = template
      .replace('{{parentName}}', student.parentName)
      .replace('{{studentName}}', student.name)
      .replace('{{status}}', status)
      .replace('{{date}}', date);

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: student.parentPhone
    });

    console.log(`SMS sent to ${student.parentPhone}`);
  } catch (error) {
    console.error('SMS sending error:', error);
  }
};