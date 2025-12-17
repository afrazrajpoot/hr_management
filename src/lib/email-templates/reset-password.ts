import { emailStyles } from "./styles";

export const getPasswordResetEmailHtml = (otp: string, recipientName?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password | Genius Factor AI</title>
</head>
<body style="margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc;">
  
  <!-- Main Container -->
  <div style="max-width: 480px; margin: 0 auto;">
    
    <!-- Logo Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <div style="
        display: inline-block;
        background: ${emailStyles.headerGradient};
        padding: 16px 32px;
        border-radius: 20px;
        margin-bottom: 24px;
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.25);
      ">
        <div style="
          font-size: 28px;
          font-weight: 800;
          color: white;
          letter-spacing: 1px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          <span style="color: #ffffff;">GENIUS</span>
          <span style="color: #fbbf24; margin: 0 8px;">⚡</span>
          <span style="color: #ffffff;">FACTOR</span>
          <span style="color: #60a5fa; margin-left: 12px; font-size: 20px;">AI</span>
        </div>
      </div>
      
      <h1 style="
        margin: 0 0 12px;
        font-size: 32px;
        font-weight: 800;
        color: #1a202c;
        letter-spacing: -0.02em;
      ">
        Password Reset
      </h1>
      <p style="
        margin: 0;
        color: #64748b;
        font-size: 16px;
        font-weight: 500;
        line-height: 1.5;
      ">
        ${recipientName ? `Hi ${recipientName}` : 'Reset your password'}
      </p>
    </div>
    
    <!-- Main Card -->
    <div style="
      background: white;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 
        0 20px 60px rgba(220, 38, 38, 0.15),
        0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(254, 202, 202, 0.6);
      margin-bottom: 32px;
      position: relative;
      overflow: hidden;
    ">
      
      <!-- Urgent Banner -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6px;
        background: linear-gradient(90deg, #dc2626, #ea580c, #f59e0b);
        border-radius: 3px;
      "></div>
      
      <!-- Security Alert -->
      <div style="
        background: linear-gradient(135deg, #fef2f2, #fee2e2);
        border-radius: 16px;
        padding: 20px 24px;
        margin-bottom: 32px;
        border: 2px solid #fca5a5;
        text-align: center;
      ">
        <div style="
          display: inline-block;
          background: #dc2626;
          color: white;
          padding: 6px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        ">
          URGENT ACTION REQUIRED
        </div>
        <p style="
          margin: 0;
          color: #7f1d1d;
          font-size: 14px;
          font-weight: 600;
        ">
          Expires in 1 hour • Immediate action required
        </p>
      </div>
      
      <!-- OTP Display -->
      <div style="margin: 0 0 48px;">
        <p style="
          text-align: center;
          color: #374151;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 24px;
        ">
          Use this verification code to reset your password:
        </p>
        
        <!-- Individual OTP Boxes -->
        <div style="
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        ">
          ${otp.split('').map((char, index) => `
            <div style="
              width: 56px;
              height: 72px;
              background: linear-gradient(145deg, #ffffff, #fef2f2);
              border-radius: 16px;
              border: 2px solid #fecaca;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 
                0 6px 12px rgba(220, 38, 38, 0.1),
                0 2px 4px rgba(0, 0, 0, 0.05);
              position: relative;
              overflow: hidden;
              transition: all 0.3s ease;
            ">
              <!-- Gradient Corner -->
              <div style="
                position: absolute;
                top: 0;
                left: 0;
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #dc2626, #ea580c);
                border-radius: 0 0 16px 0;
                opacity: 0.1;
              "></div>
              
              <!-- Perfectly Centered Number -->
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
              ">
                <span style="
                  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
                  font-size: 32px;
                  font-weight: 700;
                  color: #7f1d1d;
                  line-height: 1;
                  text-align: center;
                  display: block;
                  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                  margin-top: 4px;
                ">
                  ${char}
                </span>
              </div>
              
              <!-- Number Indicator -->
              <div style="
                position: absolute;
                bottom: 8px;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 11px;
                color: #f87171;
                font-weight: 600;
              ">
                ${index + 1}
              </div>
            </div>
          `).join('')}
        </div>
        

      </div>
      
      <!-- Instructions -->
      <div style="
        background: #f8fafc;
        border-radius: 12px;
        padding: 20px;
        margin-top: 24px;
        border-left: 4px solid #dc2626;
      ">
        <p style="
          margin: 0;
          color: #374151;
          font-size: 14px;
          line-height: 1.5;
          text-align: center;
        ">
          Enter this 6-digit code in the password reset page to continue.
        </p>
      </div>
    </div>
    
    <!-- Simple Footer -->
    <div style="text-align: center;">
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(245, 158, 11, 0.1));
        border-radius: 16px;
        border: 1px solid rgba(220, 38, 38, 0.2);
        margin-bottom: 16px;
      ">
        <span style="
          color: #dc2626;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.5px;
        ">
          Genius Factor AI
        </span>
        <span style="
          color: #fbbf24;
          font-size: 14px;
        ">⚡</span>
      </div>
      
      <!-- Copyright -->
      <div style="padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="
          margin: 0;
          color: #9ca3af;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.3px;
        ">
          © ${new Date().getFullYear()} Genius Factor AI. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

