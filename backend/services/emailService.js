const nodemailer = require('nodemailer');

// Create transporter (you'll need to configure this with your email service)
const createTransporter = () => {
  // For development, you can use services like Gmail, Outlook, or services like SendGrid
  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  return transporter;
};

// Email templates
const emailTemplates = {
  welcome: (user) => ({
    subject: 'Welcome to Car Rental Service!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to Car Rental Service, ${user.name}!</h2>
        <p>Thank you for registering with us. Your account has been successfully created.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse and book cars</li>
          <li>Manage your bookings</li>
          <li>View your rental history</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Happy renting!</p>
        <br>
        <p>Best regards,<br>Car Rental Service Team</p>
      </div>
    `
  }),

  bookingConfirmation: (booking, car, user) => ({
    subject: `Booking Confirmation - ${car.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Booking Confirmed!</h2>
        <p>Dear ${user.name},</p>
        <p>Your booking has been successfully confirmed. Here are the details:</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">${car.name}</h3>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          <p><strong>Pickup Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
          <p><strong>Return Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>
          <p><strong>Duration:</strong> ${booking.totalDays} days</p>
          <p><strong>Total Amount:</strong> $${booking.totalAmount}</p>
          <p><strong>Pickup Location:</strong> ${booking.pickupLocation}</p>
          <p><strong>Return Location:</strong> ${booking.returnLocation}</p>
        </div>

        <p>Please arrive at the pickup location 15 minutes before your scheduled time.</p>
        <p>Don't forget to bring:</p>
        <ul>
          <li>Your driver's license</li>
          <li>Credit card for security deposit</li>
          <li>Any additional documentation if required</li>
        </ul>

        <p>If you need to make changes to your booking, please contact us as soon as possible.</p>

        <br>
        <p>Best regards,<br>Car Rental Service Team</p>
      </div>
    `
  }),

  bookingCancelled: (booking, car, user) => ({
    subject: `Booking Cancelled - ${car.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Booking Cancelled</h2>
        <p>Dear ${user.name},</p>
        <p>Your booking has been cancelled as requested.</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">${car.name}</h3>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          <p><strong>Cancelled Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <p>If this cancellation was made in error or if you need to make a new booking, please contact us.</p>

        <br>
        <p>Best regards,<br>Car Rental Service Team</p>
      </div>
    `
  }),

  passwordReset: (user, resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">Password Reset Request</h2>
        <p>Dear ${user.name},</p>
        <p>You have requested to reset your password. Click the link below to reset it:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}"
             style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>

        <br>
        <p>Best regards,<br>Car Rental Service Team</p>
      </div>
    `
  }),

  paymentConfirmation: (booking, car, user, payment) => ({
    subject: `Payment Confirmed - Booking ${booking._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Payment Confirmed!</h2>
        <p>Dear ${user.name},</p>
        <p>Your payment has been successfully processed.</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">Payment Details</h3>
          <p><strong>Booking ID:</strong> ${booking._id}</strong></p>
          <p><strong>Car:</strong> ${car.name}</p>
          <p><strong>Amount Paid:</strong> $${payment.amount}</p>
          <p><strong>Payment Method:</strong> ${payment.method}</p>
          <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
          <p><strong>Date:</strong> ${new Date(payment.date).toLocaleDateString()}</p>
        </div>

        <p>Your booking is now confirmed and ready to go!</p>

        <br>
        <p>Best regards,<br>Car Rental Service Team</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](data);

    const mailOptions = {
      from: `"Car Rental Service" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Specific email functions
const sendWelcomeEmail = async (user) => {
  return await sendEmail(user.email, 'welcome', user);
};

const sendBookingConfirmationEmail = async (booking, car, user) => {
  return await sendEmail(user.email, 'bookingConfirmation', { booking, car, user });
};

const sendBookingCancellationEmail = async (booking, car, user) => {
  return await sendEmail(user.email, 'bookingCancelled', { booking, car, user });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  return await sendEmail(user.email, 'passwordReset', { user, resetToken });
};

const sendPaymentConfirmationEmail = async (booking, car, user, payment) => {
  return await sendEmail(user.email, 'paymentConfirmation', { booking, car, user, payment });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  sendPasswordResetEmail,
  sendPaymentConfirmationEmail
};
