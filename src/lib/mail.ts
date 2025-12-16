// // lib/mail.ts
// import nodemailer from 'nodemailer';
// import { google } from 'googleapis';
// import { getVerificationEmailHtml } from './email-templates/verification';
// import { getPasswordResetEmailHtml } from './email-templates/reset-password';
// import { getWelcomeEmailHtml } from './email-templates/welcome';

// const OAuth2 = google.auth.OAuth2;

// // Retry configuration
// const RETRY_CONFIG = {
//   maxRetries: 3,
//   baseDelay: 1000, // 1 second
//   maxDelay: 10000, // 10 seconds
//   timeout: 15000, // 15 seconds
// };

// // Exponential backoff with jitter
// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// const retryWithBackoff = async <T>(
//   fn: () => Promise<T>,
//   operationName: string,
//   retries = RETRY_CONFIG.maxRetries
// ): Promise<T> => {
//   for (let attempt = 0; attempt <= retries; attempt++) {
//     try {
//       return await fn();
//     } catch (error: any) {
//       // Don't retry on invalid credentials or permanent errors
//       if (error.message?.includes('invalid_grant') ||
//         error.message?.includes('Invalid refresh token')) {
//         console.error(`❌ Permanent error in ${operationName}:`, error.message);
//         throw error;
//       }

//       if (attempt === retries) {
//         console.error(`❌ ${operationName} failed after ${retries + 1} attempts:`, error);
//         throw error;
//       }

//       // Calculate backoff with jitter
//       const delay = Math.min(
//         RETRY_CONFIG.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
//         RETRY_CONFIG.maxDelay
//       );

//       console.warn(`⚠️ ${operationName} attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms:`, error.message);
//       await sleep(delay);
//     }
//   }

//   throw new Error(`Failed to execute ${operationName} after ${retries + 1} attempts`);
// };

// // Create OAuth2 client with improved timeout and retry
// const createTransporter = async (): Promise<nodemailer.Transporter | null> => {
//   // Skip email in development if credentials not configured
//   if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_CLIENT_ID) {
//     console.warn('⚠️  Email service not configured - skipping in development mode');
//     return null;
//   }

//   // Check for required environment variables
//   const requiredEnvVars = [
//     'GOOGLE_CLIENT_ID',
//     'GOOGLE_CLIENT_SECRET',
//     'GOOGLE_REFRESH_TOKEN',
//     'GOOGLE_SENDER_EMAIL'
//   ];

//   const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
//   if (missingVars.length > 0) {
//     console.error('❌ Missing required email configuration:', missingVars);
//     console.error('📧 Email service unavailable - check environment variables');
//     return null;
//   }

//   try {
//     const oauth2Client = new OAuth2(
//       process.env.GOOGLE_CLIENT_ID,
//       process.env.GOOGLE_CLIENT_SECRET,
//       process.env.GOOGLE_REDIRECT_URL || 'https://developers.google.com/oauthplayground'
//     );

//     oauth2Client.setCredentials({
//       refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
//     });

//     // Get access token with retry and timeout
//     const getAccessTokenWithRetry = async (): Promise<any> => {
//       const accessToken = await retryWithBackoff(
//         async () => {
//           // Wrap getAccessToken in a promise that can timeout
//           return new Promise((resolve, reject) => {
//             const timeoutId = setTimeout(() => {
//               reject(new Error('OAuth2 access token request timeout'));
//             }, RETRY_CONFIG.timeout);

//             oauth2Client.getAccessToken()
//               .then(token => {
//                 clearTimeout(timeoutId);
//                 resolve(token);
//               })
//               .catch(reject);
//           });
//         },
//         'getAccessToken'
//       );

//       if (!accessToken || typeof accessToken !== 'object') {
//         throw new Error('Invalid access token response');
//       }

//       return accessToken;
//     };

//     const accessToken = await getAccessTokenWithRetry();

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: process.env.GOOGLE_SENDER_EMAIL,
//         clientId: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
//         accessToken: accessToken.token || '',
//       },
//       // Additional transport options for reliability
//       pool: true,
//       maxConnections: 1,
//       rateDelta: 1000,
//       rateLimit: 5,
//     });

//     // Verify transporter configuration
//     await retryWithBackoff(
//       async () => {
//         try {
//           await transporter.verify();
//           console.log('✅ Email transporter verified successfully');
//         } catch (verifyError: any) {
//           console.error('❌ Email transporter verification failed:', verifyError);
//           throw verifyError;
//         }
//       },
//       'transporterVerification',
//       1 // Only retry verification once
//     );

//     return transporter;
//   } catch (error: any) {
//     console.error('❌ Error creating email transporter:', error);

//     // Provide specific guidance based on error type
//     if (error.message?.includes('invalid_grant') || error.message?.includes('Invalid refresh token')) {
//       console.error('🔑 OAuth2 credentials are invalid. Please check:');
//       console.error('1. Refresh token is valid and not expired');
//       console.error('2. OAuth2 client is properly configured in Google Cloud Console');
//       console.error('3. Gmail API is enabled for the project');
//     } else if (error.message?.includes('access token')) {
//       console.error('🔑 Failed to get access token. Please check OAuth2 configuration');
//     }

//     console.warn('📧 Email service unavailable - continuing without email');
//     // Return null to allow graceful degradation
//     return null;
//   }
// };

// // Cache the transporter to avoid recreating for each email
// let transporterCache: nodemailer.Transporter | null = null;
// let lastTransporterTime = 0;
// const TRANSPORTER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// const getTransporter = async (): Promise<nodemailer.Transporter | null> => {
//   const now = Date.now();

//   // Use cached transporter if available and not expired
//   if (transporterCache && (now - lastTransporterTime) < TRANSPORTER_CACHE_TTL) {
//     try {
//       // Quick check if transporter is still valid
//       await transporterCache.verify();
//       return transporterCache;
//     } catch {
//       // Transporter is stale, create new one
//       transporterCache = null;
//     }
//   }

//   const transporter = await createTransporter();
//   if (transporter) {
//     transporterCache = transporter;
//     lastTransporterTime = now;
//   }

//   return transporter;
// };

// // Send verification email with retry
// export const sendVerificationEmail = async (email: string, token: string): Promise<{
//   messageId: string;
//   success: boolean;
//   error?: any;
// }> => {
//   try {
//     const transporter = await getTransporter();

//     // Skip if no transporter (development mode or transporter creation failed)
//     if (!transporter) {
//       console.log('📧 Email service unavailable - verification link logged below:');
//       console.log('📧 Email would be sent to:', email);
//       const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
//       console.log('🔗 Verification link:', verificationUrl);
//       return { messageId: 'no-transporter', success: false };
//     }

//     const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

//     const mailOptions = {
//       from: `"Genius Factor" <${process.env.GOOGLE_SENDER_EMAIL}>`,
//       to: email,
//       subject: 'Verify Your Email Address',
//       html: getVerificationEmailHtml(verificationUrl),
//       text: `
//         Verify Your Email Address

//         Thank you for signing up for Genius Factor!

//         Please verify your email address by clicking the link below:
//         ${verificationUrl}

//         This verification link will expire in 24 hours.

//         If you didn't create an account, you can safely ignore this email.

//         © ${new Date().getFullYear()} Genius Factor. All rights reserved.
//       `,
//       // Set delivery optimization
//       priority: 'high' as const,
//       headers: {
//         'X-Priority': '1',
//         'X-MSMail-Priority': 'High',
//       },
//     };

//     const result = await retryWithBackoff(
//       async () => {
//         try {
//           const sendResult = await transporter.sendMail(mailOptions);
//           return sendResult;
//         } catch (sendError: any) {
//           // If send fails due to auth error, clear cached transporter
//           if (sendError.code === 'EAUTH' || sendError.message?.includes('auth')) {
//             transporterCache = null;
//           }
//           throw sendError;
//         }
//       },
//       'sendVerificationEmail'
//     );

//     console.log('✅ Verification email sent successfully:', result.messageId);
//     return { ...result, success: true };
//   } catch (error: any) {
//     console.error('❌ Error sending verification email:', error);

//     // Log the verification link for development purposes
//     const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
//     console.log('📧 User can use this verification link:', verificationUrl);

//     // Return error info instead of throwing to allow user flow to continue
//     return { messageId: 'error', success: false, error };
//   }
// };

// // Send password reset email with retry
// export const sendPasswordResetEmail = async (email: string, token: string): Promise<{
//   messageId: string;
//   success: boolean;
//   error?: any;
// }> => {
//   try {
//     const transporter = await getTransporter();

//     // Skip if no transporter (development mode)
//     if (!transporter) {
//       console.log('📧 Email service unavailable - password reset link logged below:');
//       console.log('📧 Email would be sent to:', email);
//       const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
//       console.log('🔗 Reset link:', resetUrl);
//       return { messageId: 'no-transporter', success: false };
//     }

//     const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

//     const mailOptions = {
//       from: `"Genius Factor" <${process.env.GOOGLE_SENDER_EMAIL}>`,
//       to: email,
//       subject: 'Reset Your Password',
//       html: getPasswordResetEmailHtml(resetUrl),
//       text: `
//         Reset Your Password

//         We received a request to reset your password for your Genius Factor account.

//         Click the link below to create a new password:
//         ${resetUrl}

//         This reset link will expire in 1 hour.

//         If you didn't request a password reset, you can safely ignore this email.

//         © ${new Date().getFullYear()} Genius Factor. All rights reserved.
//       `,
//       priority: 'high' as const,
//       headers: {
//         'X-Priority': '1',
//         'X-MSMail-Priority': 'High',
//       },
//     };

//     const result = await retryWithBackoff(
//       async () => {
//         try {
//           const sendResult = await transporter.sendMail(mailOptions);
//           return sendResult;
//         } catch (sendError: any) {
//           if (sendError.code === 'EAUTH' || sendError.message?.includes('auth')) {
//             transporterCache = null;
//           }
//           throw sendError;
//         }
//       },
//       'sendPasswordResetEmail'
//     );

//     console.log('✅ Password reset email sent successfully:', result.messageId);
//     return { ...result, success: true };
//   } catch (error: any) {
//     console.error('❌ Error sending password reset email:', error);

//     // Log the reset link for user
//     const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
//     console.log('📧 User can use this reset link:', resetUrl);

//     return { messageId: 'error', success: false, error };
//   }
// };

// // Send welcome email with retry
// export const sendWelcomeEmail = async (email: string, firstName: string): Promise<{
//   messageId: string;
//   success: boolean;
//   error?: any;
// }> => {
//   try {
//     const transporter = await getTransporter();

//     // Skip if no transporter (development mode)
//     if (!transporter) {
//       console.log('📧 Email service unavailable - welcome email would be sent to:', email);
//       return { messageId: 'no-transporter', success: false };
//     }

//     const mailOptions = {
//       from: `"Genius Factor" <${process.env.GOOGLE_SENDER_EMAIL}>`,
//       to: email,
//       subject: 'Welcome to Genius Factor!',
//       html: getWelcomeEmailHtml(firstName, `${process.env.NEXT_PUBLIC_APP_URL}/auth/sign-in`),
//       text: `
//         Welcome to Genius Factor, ${firstName}!

//         Your account is now fully activated and ready to use.

//         Get started by logging in and completing your profile:
//         ${process.env.NEXT_PUBLIC_APP_URL}/auth/sign-in

//         We're excited to help you discover and develop your unique talents!

//         If you have any questions, feel free to reply to this email.

//         © ${new Date().getFullYear()} Genius Factor. All rights reserved.
//       `,
//     };

//     const result = await retryWithBackoff(
//       async () => {
//         try {
//           const sendResult = await transporter.sendMail(mailOptions);
//           return sendResult;
//         } catch (sendError: any) {
//           if (sendError.code === 'EAUTH' || sendError.message?.includes('auth')) {
//             transporterCache = null;
//           }
//           throw sendError;
//         }
//       },
//       'sendWelcomeEmail'
//     );

//     console.log('✅ Welcome email sent successfully:', result.messageId);
//     return { ...result, success: true };
//   } catch (error: any) {
//     console.error('❌ Error sending welcome email:', error);
//     return { messageId: 'error', success: false, error };
//   }
// };

// // Test email service connection
// export const testEmailService = async (): Promise<{
//   success: boolean;
//   message: string;
//   details?: string;
//   error?: string;
//   messageId?: string;
// }> => {
//   try {
//     const transporter = await getTransporter();

//     if (!transporter) {
//       return {
//         success: false,
//         message: 'Email service not configured',
//         details: 'Check environment variables and OAuth2 setup'
//       };
//     }

//     // Try to verify connection
//     await transporter.verify();

//     // Try to send a test email
//     const testResult = await transporter.sendMail({
//       from: `"Genius Factor Test" <${process.env.GOOGLE_SENDER_EMAIL}>`,
//       to: process.env.GOOGLE_SENDER_EMAIL, // Send to ourselves
//       subject: 'Test Email from Genius Factor',
//       text: 'This is a test email to verify the email service is working correctly.',
//     });

//     return {
//       success: true,
//       message: 'Email service is working correctly',
//       messageId: testResult.messageId,
//     };
//   } catch (error: any) {
//     return {
//       success: false,
//       message: 'Email service test failed',
//       error: error.message,
//       details: error.toString()
//     };
//   }
// };

// // Export transporter getter for direct access if needed
// export { getTransporter };












































// lib/mail.ts
import nodemailer from 'nodemailer';
import { getVerificationEmailHtml } from './email-templates/verification';
import { getPasswordResetEmailHtml } from './email-templates/reset-password';
import { getWelcomeEmailHtml } from './email-templates/welcome';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  timeout: 15000, // 15 seconds
};

// Exponential backoff with jitter
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  operationName: string,
  retries = RETRY_CONFIG.maxRetries
): Promise<T> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // Don't retry on authentication errors
      if (error.code === 'EAUTH' || error.message?.includes('Invalid login')) {
        console.error(`❌ Authentication error in ${operationName}:`, error.message);
        throw error;
      }

      if (attempt === retries) {
        console.error(`❌ ${operationName} failed after ${retries + 1} attempts:`, error);
        throw error;
      }

      // Calculate backoff with jitter
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        RETRY_CONFIG.maxDelay
      );

      console.warn(`⚠️ ${operationName} attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms:`, error.message);
      await sleep(delay);
    }
  }

  throw new Error(`Failed to execute ${operationName} after ${retries + 1} attempts`);
};

// SMTP Configuration
const SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 465, // Use 465 for SSL, or 587 for TLS
  secure: true, // true for 465, false for other ports (587 requires secure: false)
  auth: {
    user: process.env.SMTP_USER || 'info@geniusfactoracademy.com',
    pass: process.env.SMTP_PASSWORD || 'cutthecheck',
  },
  // Additional connection options
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false,
  },
  // Connection pool options
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 10,
};

// Alternative TLS configuration (port 587)
const SMTP_CONFIG_TLS = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // false for STARTTLS
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER || 'info@geniusfactoracademy.com',
    pass: process.env.SMTP_PASSWORD || 'cutthecheck',
  },
  tls: {
    rejectUnauthorized: false,
  },
};

// Create transporter with SMTP
const createTransporter = async (): Promise<nodemailer.Transporter | null> => {
  // Skip email in development if credentials not configured
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
    console.warn('⚠️  SMTP service not configured - skipping in development mode');
    return null;
  }

  // Check for required environment variables
  const requiredEnvVars = [
    'SMTP_USER',
    'SMTP_PASSWORD'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('❌ Missing required SMTP configuration:', missingVars);
    console.error('📧 Email service unavailable - check environment variables');
    return null;
  }

  try {
    // Use SSL (port 465) by default, fall back to TLS (port 587)
    let transporter: nodemailer.Transporter;

    if (process.env.SMTP_PORT === '587') {
      console.log('📧 Using TLS configuration (port 587)');
      transporter = nodemailer.createTransport(SMTP_CONFIG_TLS);
    } else {
      console.log('📧 Using SSL configuration (port 465)');
      transporter = nodemailer.createTransport(SMTP_CONFIG);
    }

    // Verify transporter configuration
    await retryWithBackoff(
      async () => {
        try {
          await transporter.verify();
          console.log('✅ SMTP transporter verified successfully');
        } catch (verifyError: any) {
          console.error('❌ SMTP transporter verification failed:', verifyError);

          // Provide helpful error messages
          if (verifyError.code === 'ECONNREFUSED') {
            console.error('🔌 Connection refused. Check:');
            console.error('1. Firewall settings (port 465 or 587 should be open)');
            console.error('2. SMTP server is running');
          } else if (verifyError.code === 'EAUTH') {
            console.error('🔑 Authentication failed. Check:');
            console.error('1. Email and password are correct');
            console.error('2. "Less secure app access" is enabled in Google Account');
            console.error('3. Or use App Password if 2FA is enabled');
          }

          throw verifyError;
        }
      },
      'transporterVerification',
      1 // Only retry verification once
    );

    return transporter;
  } catch (error: any) {
    console.error('❌ Error creating SMTP transporter:', error);

    // Provide specific guidance based on error type
    if (error.code === 'EAUTH' || error.message?.includes('Invalid login')) {
      console.error('🔑 SMTP authentication failed. Please check:');
      console.error('1. Email and password are correct');
      console.error('2. For Gmail, you need to enable "Less secure app access"');
      console.error('   OR use an App Password if you have 2FA enabled');
      console.error('   App Password guide: https://support.google.com/accounts/answer/185833');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused. Please check:');
      console.error('1. Port 465 or 587 is not blocked by firewall');
      console.error('2. You are using the correct host: smtp.gmail.com');
    }

    console.warn('📧 Email service unavailable - continuing without email');
    // Return null to allow graceful degradation
    return null;
  }
};

// Cache the transporter to avoid recreating for each email
let transporterCache: nodemailer.Transporter | null = null;
let lastTransporterTime = 0;
const TRANSPORTER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getTransporter = async (): Promise<nodemailer.Transporter | null> => {
  const now = Date.now();

  // Use cached transporter if available and not expired
  if (transporterCache && (now - lastTransporterTime) < TRANSPORTER_CACHE_TTL) {
    try {
      // Quick check if transporter is still valid
      await transporterCache.verify();
      return transporterCache;
    } catch {
      // Transporter is stale, create new one
      transporterCache = null;
    }
  }

  const transporter = await createTransporter();
  if (transporter) {
    transporterCache = transporter;
    lastTransporterTime = now;
  }

  return transporter;
};

// Send verification email with retry
export const sendVerificationEmail = async (email: string, token: string): Promise<{
  messageId: string;
  success: boolean;
  error?: any;
}> => {
  try {
    const transporter = await getTransporter();

    // Skip if no transporter (development mode or transporter creation failed)
    if (!transporter) {
      console.log('📧 Email service unavailable - verification link logged below:');
      console.log('📧 Email would be sent to:', email);
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
      console.log('🔗 Verification link:', verificationUrl);
      return { messageId: 'no-transporter', success: false };
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Genius Factor" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: getVerificationEmailHtml(verificationUrl),
      text: `
        Verify Your Email Address
        
        Thank you for signing up for Genius Factor!
        
        Please verify your email address by clicking the link below:
        ${verificationUrl}
        
        This verification link will expire in 24 hours.
        
        If you didn't create an account, you can safely ignore this email.
        
        © ${new Date().getFullYear()} Genius Factor. All rights reserved.
      `,
      // Set delivery optimization
      priority: 'high' as const,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
      },
    };

    const result = await retryWithBackoff(
      async () => {
        try {
          const sendResult = await transporter.sendMail(mailOptions);
          return sendResult;
        } catch (sendError: any) {
          // If send fails due to auth error, clear cached transporter
          if (sendError.code === 'EAUTH' || sendError.message?.includes('auth')) {
            transporterCache = null;
          }
          throw sendError;
        }
      },
      'sendVerificationEmail'
    );

    console.log('✅ Verification email sent successfully:', result.messageId);
    return { ...result, success: true };
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error);

    // Log the verification link for development purposes
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;
    console.log('📧 User can use this verification link:', verificationUrl);

    // Return error info instead of throwing to allow user flow to continue
    return { messageId: 'error', success: false, error };
  }
};

// Send password reset email with retry
export const sendPasswordResetEmail = async (email: string, token: string): Promise<{
  messageId: string;
  success: boolean;
  error?: any;
}> => {
  try {
    const transporter = await getTransporter();

    // Skip if no transporter (development mode)
    if (!transporter) {
      console.log('📧 Email service unavailable - password reset link logged below:');
      console.log('📧 Email would be sent to:', email);
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
      console.log('🔗 Reset link:', resetUrl);
      return { messageId: 'no-transporter', success: false };
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Genius Factor" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html: getPasswordResetEmailHtml(resetUrl),
      text: `
        Reset Your Password
        
        We received a request to reset your password for your Genius Factor account.
        
        Click the link below to create a new password:
        ${resetUrl}
        
        This reset link will expire in 1 hour.
        
        If you didn't request a password reset, you can safely ignore this email.
        
        © ${new Date().getFullYear()} Genius Factor. All rights reserved.
      `,
      priority: 'high' as const,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
      },
    };

    const result = await retryWithBackoff(
      async () => {
        try {
          const sendResult = await transporter.sendMail(mailOptions);
          return sendResult;
        } catch (sendError: any) {
          if (sendError.code === 'EAUTH' || sendError.message?.includes('auth')) {
            transporterCache = null;
          }
          throw sendError;
        }
      },
      'sendPasswordResetEmail'
    );

    console.log('✅ Password reset email sent successfully:', result.messageId);
    return { ...result, success: true };
  } catch (error: any) {
    console.error('❌ Error sending password reset email:', error);

    // Log the reset link for user
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
    console.log('📧 User can use this reset link:', resetUrl);

    return { messageId: 'error', success: false, error };
  }
};

// Send welcome email with retry
export const sendWelcomeEmail = async (email: string, firstName: string): Promise<{
  messageId: string;
  success: boolean;
  error?: any;
}> => {
  try {
    const transporter = await getTransporter();

    // Skip if no transporter (development mode)
    if (!transporter) {
      console.log('📧 Email service unavailable - welcome email would be sent to:', email);
      return { messageId: 'no-transporter', success: false };
    }

    const mailOptions = {
      from: `"Genius Factor" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Genius Factor!',
      html: getWelcomeEmailHtml(firstName, `${process.env.NEXT_PUBLIC_APP_URL}/auth/sign-in`),
      text: `
        Welcome to Genius Factor, ${firstName}!
        
        Your account is now fully activated and ready to use.
        
        Get started by logging in and completing your profile:
        ${process.env.NEXT_PUBLIC_APP_URL}/auth/sign-in
        
        We're excited to help you discover and develop your unique talents!
        
        If you have any questions, feel free to reply to this email.
        
        © ${new Date().getFullYear()} Genius Factor. All rights reserved.
      `,
    };

    const result = await retryWithBackoff(
      async () => {
        try {
          const sendResult = await transporter.sendMail(mailOptions);
          return sendResult;
        } catch (sendError: any) {
          if (sendError.code === 'EAUTH' || sendError.message?.includes('auth')) {
            transporterCache = null;
          }
          throw sendError;
        }
      },
      'sendWelcomeEmail'
    );

    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { ...result, success: true };
  } catch (error: any) {
    console.error('❌ Error sending welcome email:', error);
    return { messageId: 'error', success: false, error };
  }
};

// Test email service connection
export const testEmailService = async (): Promise<{
  success: boolean;
  message: string;
  details?: string;
  error?: string;
  messageId?: string;
}> => {
  try {
    const transporter = await getTransporter();

    if (!transporter) {
      return {
        success: false,
        message: 'Email service not configured',
        details: 'Check SMTP environment variables'
      };
    }

    // Try to verify connection
    await transporter.verify();

    // Try to send a test email
    const testResult = await transporter.sendMail({
      from: `"Genius Factor Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to ourselves
      subject: 'Test Email from Genius Factor',
      text: 'This is a test email to verify the SMTP service is working correctly.',
    });

    return {
      success: true,
      message: 'SMTP service is working correctly',
      messageId: testResult.messageId,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'SMTP service test failed',
      error: error.message,
      details: error.toString()
    };
  }
};

// Export transporter getter for direct access if needed
export { getTransporter };