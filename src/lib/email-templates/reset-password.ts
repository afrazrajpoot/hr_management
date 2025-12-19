export const getPasswordResetEmailHtml = (otp: string, recipientName?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Genius Factor AI</title>
    <style>
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
            }
            .header {
                padding: 30px 20px !important;
            }
            .content {
                padding: 40px 20px !important;
            }
            .footer {
                padding: 30px 20px !important;
            }
            .otp-code {
                font-size: 28px !important;
                letter-spacing: 6px !important;
                padding: 20px 30px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155;">
    
    <!-- Pre-header Text (Shows in email preview) -->
    <div style="display: none; max-height: 0; overflow: hidden;">
        Password reset requested for your Genius Factor AI account. Your verification code is: ${otp}
    </div>
    
    <!-- Main Container -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f8fafc">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="container">
                    <!-- Header -->
                    <tr>
                        <td bgcolor="#ffffff" class="header" style="padding: 40px 50px 30px; border-bottom: 1px solid #e2e8f0;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <div style="font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 5px;">
                                            Genius Factor AI
                                        </div>
                                        <div style="font-size: 13px; color: #64748b; font-weight: 500; letter-spacing: 0.5px;">
                                            ACCOUNT SECURITY
                                        </div>
                                    </td>
                                    <td align="right" style="font-size: 12px; color: #94a3b8;">
                                        ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td bgcolor="#ffffff" class="content" style="padding: 50px;">
                            <!-- Security Alert -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                                <tr>
                                    <td style="
                                        background-color: #fef2f2;
                                        border: 1px solid #fecaca;
                                        border-left: 4px solid #dc2626;
                                        padding: 20px;
                                        border-radius: 6px;
                                    ">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td width="24" valign="top" style="padding-right: 12px;">
                                                    <div style="color: #dc2626; font-size: 16px;">⚠️</div>
                                                </td>
                                                <td>
                                                    <div style="font-size: 15px; font-weight: 600; color: #991b1b; margin-bottom: 5px;">
                                                        Security Action Required
                                                    </div>
                                                    <div style="font-size: 14px; color: #7f1d1d; line-height: 1.5;">
                                                        A password reset has been requested for your account. If you did not initiate this request, please contact security immediately.
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Greeting -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 30px;">
                                        <h1 style="font-size: 24px; font-weight: 600; color: #0f172a; margin: 0 0 15px; line-height: 1.3;">
                                            Password Reset Verification
                                        </h1>
                                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0;">
                                            ${recipientName ? `Dear ${recipientName},` : 'Hello,'}<br>
                                            To reset your password, please use the verification code below. This code is valid for 1 hour.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- OTP Section -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 40px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="text-align: center;">
                                            <div style="font-size: 13px; color: #475569; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 10px; text-transform: uppercase;">
                                                Verification Code
                                            </div>
                                            <div class="otp-code" style="
                                                background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
                                                color: #ffffff;
                                                font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
                                                font-size: 32px;
                                                font-weight: 600;
                                                letter-spacing: 8px;
                                                padding: 25px 40px;
                                                border-radius: 8px;
                                                display: inline-block;
                                                box-shadow: 0 4px 20px rgba(220, 38, 38, 0.15);
                                                margin: 10px 0;
                                            ">
                                                ${otp}
                                            </div>
                                            <div style="font-size: 14px; color: #dc2626; font-weight: 500; margin-top: 10px;">
                                                ⏰ Expires in 1 hour
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Instructions -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 40px 0;">
                                <tr>
                                    <td>
                                        <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 20px;">
                                            Next Steps
                                        </h2>
                                        
                                        <!-- Step 1 -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                                            <tr>
                                                <td valign="top" width="40" style="padding-right: 15px;">
                                                    <div style="
                                                        width: 32px;
                                                        height: 32px;
                                                        background-color: #fef2f2;
                                                        border-radius: 50%;
                                                        text-align: center;
                                                        line-height: 32px;
                                                        color: #dc2626;
                                                        font-weight: 600;
                                                        font-size: 14px;
                                                    ">1</div>
                                                </td>
                                                <td valign="top">
                                                    <div style="color: #0f172a; font-weight: 600; margin-bottom: 5px;">
                                                        Return to Password Reset Page
                                                    </div>
                                                    <div style="color: #64748b; font-size: 15px; line-height: 1.5;">
                                                        Navigate back to the password reset screen in your browser.
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Step 2 -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                                            <tr>
                                                <td valign="top" width="40" style="padding-right: 15px;">
                                                    <div style="
                                                        width: 32px;
                                                        height: 32px;
                                                        background-color: #fef2f2;
                                                        border-radius: 50%;
                                                        text-align: center;
                                                        line-height: 32px;
                                                        color: #dc2626;
                                                        font-weight: 600;
                                                        font-size: 14px;
                                                    ">2</div>
                                                </td>
                                                <td valign="top">
                                                    <div style="color: #0f172a; font-weight: 600; margin-bottom: 5px;">
                                                        Enter Verification Code
                                                    </div>
                                                    <div style="color: #64748b; font-size: 15px; line-height: 1.5;">
                                                        Enter the 6-digit code shown above to verify your identity.
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Step 3 -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td valign="top" width="40" style="padding-right: 15px;">
                                                    <div style="
                                                        width: 32px;
                                                        height: 32px;
                                                        background-color: #fef2f2;
                                                        border-radius: 50%;
                                                        text-align: center;
                                                        line-height: 32px;
                                                        color: #dc2626;
                                                        font-weight: 600;
                                                        font-size: 14px;
                                                    ">3</div>
                                                </td>
                                                <td valign="top">
                                                    <div style="color: #0f172a; font-weight: 600; margin-bottom: 5px;">
                                                        Create New Password
                                                    </div>
                                                    <div style="color: #64748b; font-size: 15px; line-height: 1.5;">
                                                        Follow the prompts to create a new strong password for your account.
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Notice -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 40px 0;">
                                <tr>
                                    <td style="
                                        background-color: #fef2f2;
                                        border-left: 4px solid #dc2626;
                                        padding: 20px;
                                        border-radius: 4px;
                                    ">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td width="24" valign="top" style="padding-right: 12px;">
                                                    <div style="color: #dc2626; font-size: 16px;">🔒</div>
                                                </td>
                                                <td>
                                                    <div style="font-size: 15px; font-weight: 600; color: #991b1b; margin-bottom: 5px;">
                                                        Important Security Information
                                                    </div>
                                                    <div style="font-size: 14px; color: #7f1d1d; line-height: 1.5;">
                                                        <ul style="margin: 0; padding-left: 20px;">
                                                            <li style="margin-bottom: 5px;">Never share this verification code with anyone</li>
                                                            <li style="margin-bottom: 5px;">This code is for one-time use only</li>
                                                            <li>Genius Factor AI will never ask for this code via email or phone</li>
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Support Section -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                                <tr>
                                    <td>
                                        <div style="font-size: 15px; color: #475569; margin-bottom: 15px;">
                                            <strong>Didn't request this?</strong> Contact our security team immediately.
                                        </div>
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-right: 20px;">
                                                    <a href="mailto:security@geniusfactorai.com" style="
                                                        color: #dc2626;
                                                        text-decoration: none;
                                                        font-size: 14px;
                                                        font-weight: 500;
                                                    ">
                                                        🛡️ security@geniusfactorai.com
                                                    </a>
                                                </td>
                                                <td>
                                                    <a href="tel:+1-800-XXX-XXXX" style="
                                                        color: #dc2626;
                                                        text-decoration: none;
                                                        font-size: 14px;
                                                        font-weight: 500;
                                                    ">
                                                        📞 +1 (800) XXX-XXXX
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td bgcolor="#f1f5f9" class="footer" style="padding: 40px 50px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="text-align: center;">
                                        <!-- Company Info -->
                                        <div style="font-size: 14px; color: #475569; margin-bottom: 20px; line-height: 1.5;">
                                            <strong>Genius Factor AI Security Team</strong><br>
                                            This is an automated security notification.
                                        </div>
                                        
                                        <!-- Legal Links -->
                                        <div style="margin-bottom: 25px;">
                                            <a href="https://geniusfactorai.com/privacy" style="
                                                color: #64748b;
                                                text-decoration: none;
                                                font-size: 12px;
                                                margin: 0 10px;
                                            ">Privacy Policy</a>
                                            <span style="color: #cbd5e1;">•</span>
                                            <a href="https://geniusfactorai.com/terms" style="
                                                color: #64748b;
                                                text-decoration: none;
                                                font-size: 12px;
                                                margin: 0 10px;
                                            ">Terms of Service</a>
                                            <span style="color: #cbd5e1;">•</span>
                                            <a href="https://geniusfactorai.com/security" style="
                                                color: #64748b;
                                                text-decoration: none;
                                                font-size: 12px;
                                                margin: 0 10px;
                                            ">Security Policy</a>
                                        </div>
                                        
                                        <!-- Copyright -->
                                        <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                                            <p style="margin: 0 0 10px;">
                                                This email was triggered by a password reset request for your account.
                                                If you did not initiate this request, your account may be compromised.
                                            </p>
                                            <p style="margin: 0;">
                                                © ${new Date().getFullYear()} Genius Factor AI. All rights reserved.
                                                This is an automated security email. Do not reply to this message.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const resetPasswordStyles = {
  primaryColor: "#dc2626",
  secondaryColor: "#ea580c",
  backgroundColor: "#f8fafc",
  alertBackground: "#fef2f2",
  alertBorder: "#fecaca",
  textDark: "#0f172a",
  textAlert: "#7f1d1d",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  dangerGradient: "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)"
};