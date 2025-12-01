// lib/mail.ts
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

// Create OAuth2 client with timeout
const createTransporter = async () => {
  // Skip email in development if credentials not configured
  if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_CLIENT_ID) {
    console.warn('⚠️  Email service not configured - skipping in development mode');
    return null;
  }

  const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  try {
    // Add timeout to prevent hanging
    const accessTokenPromise = oauth2Client.getAccessToken();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('OAuth2 request timeout')), 5000)
    );

    const accessToken = await Promise.race([accessTokenPromise, timeoutPromise]) as any;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_SENDER_EMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token || '',
      },
    });

    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw new Error('Failed to create email transporter');
  }
};

// Send verification email
export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const transporter = await createTransporter();

    // Skip if no transporter (development mode)
    if (!transporter) {
      console.log('📧 Development mode: Email would be sent to:', email);
      console.log('🔗 Verification link: ' + `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`);
      return { messageId: 'dev-mode-skip' };
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Genius Factor" <${process.env.GOOGLE_SENDER_EMAIL}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Genius Factor</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Verify Your Email Address</h2>
                        <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                          Thank you for signing up! Please verify your email address by clicking the button below.
                        </p>
                        <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                          This verification link will expire in 24 hours.
                        </p>
                        
                        <!-- Button -->
                        <table role="presentation" style="margin: 0 auto;">
                          <tr>
                            <td style="border-radius: 4px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                              <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 4px;">
                                Verify Email Address
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px; line-height: 1.5;">
                          If the button doesn't work, copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                          ${verificationUrl}
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                        <p style="margin: 0; color: #999999; font-size: 14px;">
                          If you didn't create an account, you can safely ignore this email.
                        </p>
                        <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px;">
                          © ${new Date().getFullYear()} Genius Factor. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `
        Verify Your Email Address
        
        Thank you for signing up for Genius Factor!
        
        Please verify your email address by clicking the link below:
        ${verificationUrl}
        
        This verification link will expire in 24 hours.
        
        If you didn't create an account, you can safely ignore this email.
        
        © ${new Date().getFullYear()} Genius Factor. All rights reserved.
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    const transporter = await createTransporter();

    // Skip if no transporter (development mode)
    if (!transporter) {
      console.log('📧 Development mode: Password reset email would be sent to:', email);
      console.log('🔗 Reset link: ' + `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`);
      return { messageId: 'dev-mode-skip' };
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Genius Factor" <${process.env.GOOGLE_SENDER_EMAIL}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Genius Factor</h1>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Reset Your Password</h2>
                        <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                          We received a request to reset your password. Click the button below to create a new password.
                        </p>
                        <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                          This reset link will expire in 1 hour.
                        </p>
                        
                        <table role="presentation" style="margin: 0 auto;">
                          <tr>
                            <td style="border-radius: 4px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                              <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 4px;">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 30px 0 0 0; color: #999999; font-size: 14px; line-height: 1.5;">
                          If the button doesn't work, copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                          ${resetUrl}
                        </p>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                        <p style="margin: 0; color: #999999; font-size: 14px;">
                          If you didn't request a password reset, you can safely ignore this email.
                        </p>
                        <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px;">
                          © ${new Date().getFullYear()} Genius Factor. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `
        Reset Your Password
        
        We received a request to reset your password for your Genius Factor account.
        
        Click the link below to create a new password:
        ${resetUrl}
        
        This reset link will expire in 1 hour.
        
        If you didn't request a password reset, you can safely ignore this email.
        
        © ${new Date().getFullYear()} Genius Factor. All rights reserved.
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email: string, firstName: string) => {
  try {
    const transporter = await createTransporter();

    // Skip if no transporter (development mode)
    if (!transporter) {
      console.log('📧 Development mode: Welcome email would be sent to:', email);
      return { messageId: 'dev-mode-skip' };
    }

    const mailOptions = {
      from: `"Genius Factor" <${process.env.GOOGLE_SENDER_EMAIL}>`,
      to: email,
      subject: 'Welcome to Genius Factor!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Welcome to Genius Factor!</h1>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hi ${firstName}! 👋</h2>
                        <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                          Thank you for verifying your email! Your account is now fully activated.
                        </p>
                        <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.5;">
                          You can now access all features of Genius Factor.
                        </p>
                        
                        <table role="presentation" style="margin: 0 auto;">
                          <tr>
                            <td style="border-radius: 4px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                              <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/sign-in" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 4px;">
                                Get Started
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                        <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                          Need help? Contact us at ${process.env.GOOGLE_SENDER_EMAIL}
                        </p>
                        <p style="margin: 0; color: #999999; font-size: 12px;">
                          © ${new Date().getFullYear()} Genius Factor. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};