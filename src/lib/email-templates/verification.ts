export const getVerificationEmailHtml = (otp: string, recipientName?: string, defaultPassword?: string) => {
  // Default password section HTML (only shown if defaultPassword is provided)
  const defaultPasswordSection = defaultPassword ? `
                            <!-- Default Password Section -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                                <tr>
                                    <td style="
                                        background-color: #fef3c7;
                                        border-left: 4px solid #f59e0b;
                                        padding: 20px;
                                        border-radius: 4px;
                                    ">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td width="30" valign="top" style="padding-right: 15px;">
                                                    <div style="color: #f59e0b; font-size: 18px;">🔑</div>
                                                </td>
                                                <td>
                                                    <div style="font-size: 15px; font-weight: 600; color: #92400e; margin-bottom: 10px;">
                                                        Your Temporary Password
                                                    </div>
                                                    <div style="
                                                        background-color: #ffffff;
                                                        border: 2px dashed #f59e0b;
                                                        border-radius: 6px;
                                                        padding: 12px 20px;
                                                        margin: 10px 0;
                                                        text-align: center;
                                                    ">
                                                        <code style="
                                                            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
                                                            font-size: 18px;
                                                            font-weight: 700;
                                                            color: #92400e;
                                                            letter-spacing: 1px;
                                                        ">${defaultPassword}</code>
                                                    </div>
                                                    <div style="font-size: 13px; color: #78350f; line-height: 1.5; margin-top: 10px;">
                                                        <strong>⚠️ Important:</strong> If you haven't set your password already, you can use this default password to log in. We strongly recommend changing it from your Profile page after logging in for security purposes.
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
  ` : '';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Verification Required - Genius Factor AI</title>
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
        Complete your Genius Factor AI account setup. Your verification code is: ${otp}
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
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td valign="middle" style="padding-right: 12px;">
                                                    <img src="https://geniusfactor.ai/logo.png" alt="Genius Factor AI Logo" width="70" height="70" style="display: block; border: 0;" />
                                                </td>
                                                <td valign="middle">
                                                    <div style="font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 5px;">
                                                        Genius Factor AI
                                                    </div>
                                                    <div style="font-size: 13px; color: #64748b; font-weight: 500; letter-spacing: 0.5px;">
                                                        ENTERPRISE AI SOLUTIONS
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td align="right" style="font-size: 12px; color: #94a3b8;">
                                        ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td bgcolor="#ffffff" class="content" style="padding: 50px;">
                            <!-- Greeting -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 30px;">
                                        <h1 style="font-size: 24px; font-weight: 600; color: #0f172a; margin: 0 0 15px; line-height: 1.3;">
                                            Account Verification Required
                                        </h1>
                                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0;">
                                            ${recipientName ? `Dear ${recipientName},` : 'Hello,'}<br>
                                            To complete your account setup and access Genius Factor AI, please verify your email address using the code below.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- OTP Section -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 40px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="text-align: center; margin-bottom: 20px;">
                                            <div style="font-size: 13px; color: #475569; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 10px; text-transform: uppercase;">
                                                Verification Code
                                            </div>
                                            <div class="otp-code" style="
                                                background-color: #f1f5f9;
                                                color: #1e293b;
                                                font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
                                                font-size: 32px;
                                                font-weight: 700;
                                                letter-spacing: 8px;
                                                padding: 25px 40px;
                                                border-radius: 8px;
                                                display: inline-block;
                                                border: 2px solid #6366f1;
                                                margin: 10px 0;
                                            ">
                                                ${otp}
                                            </div>
                                            <div style="font-size: 14px; color: #64748b; margin-top: 10px;">
                                                Valid for 24 hours | One-time use only
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            ${defaultPasswordSection}
                            
                            <!-- Instructions -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 40px 0;">
                                <tr>
                                    <td>
                                        <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 20px;">
                                            How to Verify Your Account
                                        </h2>
                                        
                                        <!-- Step 1 -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                                            <tr>
                                                <td valign="top" width="40" style="padding-right: 15px;">
                                                    <div style="
                                                        width: 32px;
                                                        height: 32px;
                                                        background-color: #f1f5f9;
                                                        border-radius: 50%;
                                                        text-align: center;
                                                        line-height: 32px;
                                                        color: #6366f1;
                                                        font-weight: 600;
                                                        font-size: 14px;
                                                    ">1</div>
                                                </td>
                                                <td valign="top">
                                                    <div style="color: #0f172a; font-weight: 600; margin-bottom: 5px;">
                                                        Return to Genius Factor AI
                                                    </div>
                                                    <div style="color: #64748b; font-size: 15px; line-height: 1.5;">
                                                        Navigate back to the verification screen in your browser or application.
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
                                                        background-color: #f1f5f9;
                                                        border-radius: 50%;
                                                        text-align: center;
                                                        line-height: 32px;
                                                        color: #6366f1;
                                                        font-weight: 600;
                                                        font-size: 14px;
                                                    ">2</div>
                                                </td>
                                                <td valign="top">
                                                    <div style="color: #0f172a; font-weight: 600; margin-bottom: 5px;">
                                                        Enter Verification Code
                                                    </div>
                                                    <div style="color: #64748b; font-size: 15px; line-height: 1.5;">
                                                        Enter the 6-digit code shown above exactly as displayed.
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
                                                        background-color: #f1f5f9;
                                                        border-radius: 50%;
                                                        text-align: center;
                                                        line-height: 32px;
                                                        color: #6366f1;
                                                        font-weight: 600;
                                                        font-size: 14px;
                                                    ">3</div>
                                                </td>
                                                <td valign="top">
                                                    <div style="color: #0f172a; font-weight: 600; margin-bottom: 5px;">
                                                        Complete Setup
                                                    </div>
                                                    <div style="color: #64748b; font-size: 15px; line-height: 1.5;">
                                                        Follow the remaining prompts to finalize your account configuration.
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
                                        background-color: #f0f9ff;
                                        border-left: 4px solid #0ea5e9;
                                        padding: 20px;
                                        border-radius: 4px;
                                    ">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td width="30" valign="top" style="padding-right: 15px;">
                                                    <div style="color: #0ea5e9; font-size: 18px;">🔒</div>
                                                </td>
                                                <td>
                                                    <div style="font-size: 15px; font-weight: 600; color: #0369a1; margin-bottom: 5px;">
                                                        Security Information
                                                    </div>
                                                    <div style="font-size: 14px; color: #475569; line-height: 1.5;">
                                                        This verification code is confidential. Genius Factor AI will never ask you for this code via email, phone, or chat. If you did not initiate this request, please ignore this message and contact our security team immediately.
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
                                            <strong>Need assistance?</strong> Our support team is available to help.
                                        </div>
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-right: 20px;">
                                                    <a href="mailto:support@geniusfactorai.com" style="
                                                        color: #6366f1;
                                                        text-decoration: none;
                                                        font-size: 14px;
                                                        font-weight: 500;
                                                    ">
                                                        ✉️ support@geniusfactorai.com
                                                    </a>
                                                </td>
                                                <td>
                                                    <a href="https://help.geniusfactorai.com" style="
                                                        color: #6366f1;
                                                        text-decoration: none;
                                                        font-size: 14px;
                                                        font-weight: 500;
                                                    ">
                                                        🌐 Help Center
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
                                            <strong><a href="https://geniusfactor.ai" style="color: #475569; text-decoration: none;">Genius Factor AI Inc.</a></strong><br>
                                            123 Innovation Drive, Suite 500<br>
                                            San Francisco, CA 94107
                                        </div>
                                        
                                        <!-- Platform Link -->
                                        <div style="margin-bottom: 20px;">
                                            <a href="https://geniusfactor.ai" style="
                                                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                                                color: white;
                                                text-decoration: none;
                                                font-weight: 600;
                                                font-size: 14px;
                                                padding: 12px 24px;
                                                border-radius: 6px;
                                                display: inline-block;
                                            ">
                                                Visit Our Platform →
                                            </a>
                                        </div>
                                        
                                        <!-- Legal Links -->
                                        <div style="margin-bottom: 25px;">
                                            <a href="https://geniusfactor.ai/privacy-policy" style="
                                                color: #64748b;
                                                text-decoration: none;
                                                font-size: 12px;
                                                margin: 0 10px;
                                            ">Privacy Policy</a>
                                            <span style="color: #cbd5e1;">•</span>
                                            <a href="https://geniusfactor.ai/terms-of-service" style="
                                                color: #64748b;
                                                text-decoration: none;
                                                font-size: 12px;
                                                margin: 0 10px;
                                            ">Terms of Service</a>
                                        </div>
                                        
                                        <!-- Copyright -->
                                        <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                                            <p style="margin: 0 0 10px;">
                                                This email contains confidential information for the intended recipient only.
                                                Unauthorized access, disclosure, or distribution is prohibited.
                                            </p>
                                            <p style="margin: 0;">
                                                Copyright © 2026 Genius Factor Academy, LLC. All rights reserved.
                                                This is an automated service email. Please do not reply to this message.
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
};

export const emailStyles = {
  companyName: "Genius Factor AI",
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  backgroundColor: "#f8fafc",
  textDark: "#0f172a",
  textMedium: "#475569",
  textLight: "#64748b",
  borderColor: "#e2e8f0",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  brandGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
};