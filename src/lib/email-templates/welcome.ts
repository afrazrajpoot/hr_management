export const getWelcomeEmailHtml = (firstName: string, loginUrl: string) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const fallbackUrl = appUrl ? `${appUrl}/dashboard` : '#';
  const safeLoginUrl =
    loginUrl && loginUrl !== 'undefined' && loginUrl !== 'null'
      ? loginUrl
      : fallbackUrl;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Genius Factor AI</title>
    <style>
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
            }
            .header {
                padding: 40px 20px !important;
            }
            .content {
                padding: 40px 20px !important;
            }
            .footer {
                padding: 30px 20px !important;
            }
            .feature-grid td {
                display: block !important;
                width: 100% !important;
                padding: 10px 0 !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155;">
    
    <!-- Pre-header Text -->
    <div style="display: none; max-height: 0; overflow: hidden;">
        Welcome to Genius Factor AI! Your account is now active. Access your dashboard to begin.
    </div>
    
    <!-- Main Container -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f8fafc">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="container">
                    <!-- Header -->
                    <tr>
                        <td bgcolor="#ffffff" class="header" style="padding: 50px; border-bottom: 1px solid #e2e8f0; text-align: center;">
                            <!-- Company Logo -->
                            <div style="margin-bottom: 20px;">
                                <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                    <tr>
                                        <td valign="middle" style="padding-right: 12px;">
                                            <img src="https://geniusfactor.ai/logo.png" alt="Genius Factor AI Logo" width="70" height="70" style="display: block; border: 0;" />
                                        </td>
                                        <td valign="middle">
                                            <div style="font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 5px;">
                                                Genius Factor AI
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                                <div style="font-size: 13px; color: #6366f1; font-weight: 500; letter-spacing: 0.5px;">
                                    UNLOCK YOUR POTENTIAL
                                </div>
                            </div>
                            
                            <!-- Welcome Banner -->
                            <div style="
                                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                                border-radius: 12px;
                                padding: 40px 30px;
                                margin: 20px 0 30px;
                                border: 1px solid #bae6fd;
                                text-align: center;
                            ">
                                <h1 style="font-size: 32px; font-weight: 700; color: #0f172a; margin: 0 0 15px; line-height: 1.3;">
                                    Welcome, ${firstName}!
                                </h1>
                                <p style="color: #475569; font-size: 16px; margin: 0; line-height: 1.5;">
                                    Your Genius Factor AI account is now active and ready.
                                </p>
                            </div>
                            
                            <!-- Success Badge -->
                            <div style="
                                background: linear-gradient(135deg, #10b981, #059669);
                                color: white;
                                padding: 12px 28px;
                                border-radius: 20px;
                                font-size: 14px;
                                font-weight: 600;
                                margin: 0 auto 30px;
                                text-align: center;
                                display: inline-block;
                                letter-spacing: 0.5px;
                            ">
                                ACCOUNT ACTIVATED • PREMIUM ACCESS
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td bgcolor="#ffffff" class="content" style="padding: 50px;">
                            <!-- Introductory Message -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 40px;">
                                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                                            Thank you for joining Genius Factor AI. We're excited to help you discover and maximize your unique potential through our AI-powered platform.
                                        </p>
                                        
                                        <div style="
                                            background-color: #f0f9ff;
                                            border-left: 4px solid #0ea5e9;
                                            padding: 20px;
                                            border-radius: 4px;
                                            margin: 25px 0;
                                        ">
                                            <div style="color: #0369a1; font-size: 15px; font-weight: 600; margin: 0 0 10px;">
                                                Your Journey Begins Today
                                            </div>
                                            <div style="color: #475569; font-size: 14px; margin: 0; line-height: 1.5;">
                                                You now have access to our complete suite of AI-powered assessment tools, personalized insights, and growth tracking features.
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Getting Started -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 40px 0;">
                                <tr>
                                    <td>
                                        <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin: 0 0 25px; text-align: center;">
                                            Get Started in 3 Steps
                                        </h2>
                                        
                                        <!-- Step 1 -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                                            <tr>
                                                <td valign="top" width="40" style="padding-right: 15px;">
                                                    <div style="
                                                        width: 32px;
                                                        height: 32px;
                                                        background: linear-gradient(135deg, #6366f1, #8b5cf6);
                                                        border-radius: 50%;
                                                        text-align: center;
                                                        line-height: 32px;
                                                        color: white;
                                                        font-weight: 600;
                                                        font-size: 14px;
                                                    ">1</div>
                                                </td>
                                                <td valign="top">
                                                    <div style="color: #0f172a; font-weight: 600; margin-bottom: 5px;">
                                                        Complete Your Profile
                                                    </div>
                                                    <div style="color: #64748b; font-size: 15px; line-height: 1.5;">
                                                        Set up your preferences and goals to personalize your experience.
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
                                                        background: linear-gradient(135deg, #6366f1, #8b5cf6);
                                                        border-radius: 50%;
                                                        text-align: center;
                                                        line-height: 32px;
                                                        color: white;
                                                        font-weight: 600;
                                                        font-size: 14px;
                                                    ">2</div>
                                                </td>
                                                <td valign="top">
                                                    <div style="color: #0f172a; font-weight: 600; margin-bottom: 5px;">
                                                        Take Initial Assessment
                                                    </div>
                                                    <div style="color: #64748b; font-size: 15px; line-height: 1.5;">
                                                        Complete your first AI-powered assessment to establish your baseline.
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
                                                        background: linear-gradient(135deg, #6366f1, #8b5cf6);
                                                        border-radius: 50%;
                                                        text-align: center;
                                                        line-height: 32px;
                                                        color: white;
                                                        font-weight: 600;
                                                        font-size: 14px;
                                                    ">3</div>
                                                </td>
                                                <td valign="top">
                                                    <div style="color: #0f172a; font-weight: 600; margin-bottom: 5px;">
                                                        Explore Recommendations
                                                    </div>
                                                    <div style="color: #64748b; font-size: 15px; line-height: 1.5;">
                                                        Discover personalized growth paths and resources based on your results.
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Primary CTA -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 50px 0 40px;">
                                <tr>
                                    <td align="center">
                                        <a href="${safeLoginUrl}" style="
                                            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                                            color: white;
                                            text-decoration: none;
                                            font-weight: 600;
                                            font-size: 16px;
                                            padding: 18px 48px;
                                            border-radius: 8px;
                                            display: inline-block;
                                            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
                                            transition: all 0.3s ease;
                                        ">
                                            Access Your Dashboard
                                        </a>
                                        <p style="color: #64748b; font-size: 14px; margin: 15px 0 0; line-height: 1.5;">
                                            Complete your setup in 20 minutes and start your first assessment.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Feature Highlights -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 40px 0;">
                                <tr>
                                    <td>
                                        <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin: 0 0 30px; text-align: center;">
                                            What You Can Expect
                                        </h2>
                                        
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="feature-grid">
                                            <tr>
                                                <td width="50%" valign="top" style="padding: 10px;">
                                                    <div style="
                                                        background-color: #f8fafc;
                                                        border-radius: 8px;
                                                        padding: 25px 20px;
                                                        border: 1px solid #e2e8f0;
                                                        height: 100%;
                                                    ">
                                                        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #0f172a;">
                                                            AI-Powered Assessments
                                                        </h3>
                                                        <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                                                            Discover your unique cognitive strengths and growth opportunities through our advanced assessment tools.
                                                        </p>
                                                    </div>
                                                </td>
                                                <td width="50%" valign="top" style="padding: 10px;">
                                                    <div style="
                                                        background-color: #f8fafc;
                                                        border-radius: 8px;
                                                        padding: 25px 20px;
                                                        border: 1px solid #e2e8f0;
                                                        height: 100%;
                                                    ">
                                                        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #0f172a;">
                                                            Personalized Insights
                                                        </h3>
                                                        <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                                                            Receive tailored recommendations and growth strategies based on your unique profile.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="50%" valign="top" style="padding: 10px;">
                                                    <div style="
                                                        background-color: #f8fafc;
                                                        border-radius: 8px;
                                                        padding: 25px 20px;
                                                        border: 1px solid #e2e8f0;
                                                        height: 100%;
                                                    ">
                                                        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #0f172a;">
                                                            Expert Community
                                                        </h3>
                                                        <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                                                            Connect with professionals and experts on similar growth journeys for collaboration and learning.
                                                        </p>
                                                    </div>
                                                </td>
                                                <td width="50%" valign="top" style="padding: 10px;">
                                                    <div style="
                                                        background-color: #f8fafc;
                                                        border-radius: 8px;
                                                        padding: 25px 20px;
                                                        border: 1px solid #e2e8f0;
                                                        height: 100%;
                                                    ">
                                                        <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #0f172a;">
                                                            Progress Tracking
                                                        </h3>
                                                        <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                                                            Monitor your development with detailed analytics and milestone tracking features.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Closing Message -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 40px 0;">
                                <tr>
                                    <td style="
                                        background-color: #f0f9ff;
                                        border-radius: 8px;
                                        padding: 30px;
                                        text-align: center;
                                        border: 1px solid #bae6fd;
                                    ">
                                        <p style="font-size: 16px; font-style: italic; color: #0369a1; margin: 0 0 15px; line-height: 1.6;">
                                            "Greatness grows when insight meets consistent action. Your journey to unlocking full potential starts with a single step."
                                        </p>
                                        <p style="font-size: 14px; font-weight: 600; color: #0f172a; margin: 0;">
                                            — The Genius Factor AI Team
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Support Section -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                                <tr>
                                    <td>
                                        <h3 style="font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 20px;">
                                            Need Assistance?
                                        </h3>
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-right: 20px; padding-bottom: 10px;">
                                                    <a href="mailto:onboarding@geniusfactorai.com" style="
                                                        color: #6366f1;
                                                        text-decoration: none;
                                                        font-size: 14px;
                                                        font-weight: 500;
                                                    ">
                                                        Onboarding Support
                                                    </a>
                                                </td>
                                                <td style="padding-bottom: 10px;">
                                                    <a href="https://help.geniusfactorai.com/getting-started" style="
                                                        color: #6366f1;
                                                        text-decoration: none;
                                                        font-size: 14px;
                                                        font-weight: 500;
                                                    ">
                                                        Getting Started Guide
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
                        <td bgcolor="#f1f5f9" class="footer" style="padding: 40px 50px; border-top: 1px solid #e2e8f0;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="text-align: center;">
                                        <!-- Brand Footer -->
                                        <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 20px;">
                                            Genius Factor AI
                                        </div>
                                        
                                        <!-- Links -->
                                        <div style="margin-bottom: 25px;">
                                            <a href="https://geniusfactorai.com/about" style="
                                                color: #64748b;
                                                text-decoration: none;
                                                font-size: 12px;
                                                margin: 0 10px;
                                            ">About Us</a>
                                            <span style="color: #cbd5e1;">•</span>
                                            <a href="https://geniusfactorai.com/blog" style="
                                                color: #64748b;
                                                text-decoration: none;
                                                font-size: 12px;
                                                margin: 0 10px;
                                            ">Blog</a>
                                            <span style="color: #cbd5e1;">•</span>
                                            <a href="https://geniusfactorai.com/contact" style="
                                                color: #64748b;
                                                text-decoration: none;
                                                font-size: 12px;
                                                margin: 0 10px;
                                            ">Contact</a>
                                        </div>
                                        
                                        <!-- Welcome Message -->
                                        <div style="font-size: 14px; color: #475569; margin-bottom: 20px; line-height: 1.5;">
                                            Welcome to our community of forward-thinkers and growth-oriented professionals.
                                        </div>
                                        
                                        <!-- Copyright -->
                                        <div style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                                            <p style="margin: 0 0 10px;">
                                                This welcome email was sent to ${firstName} as part of your account activation.
                                                You're receiving this because you signed up for Genius Factor AI.
                                            </p>
                                            <p style="margin: 0;">
                                                Copyright © 2026 Genius Factor Academy, LLC. All rights reserved.
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

export const welcomeEmailStyles = {
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  backgroundColor: "#f8fafc",
  successColor: "#10b981",
  textDark: "#0f172a",
  textMedium: "#475569",
  textLight: "#64748b",
  borderColor: "#e2e8f0",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  brandGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
};