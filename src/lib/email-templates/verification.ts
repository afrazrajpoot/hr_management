export const getVerificationEmailHtml = (otp: string, recipientName?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify Your Email | Genius Factor AI</title>
</head>
<body style="margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #f6f9ff 0%, #f0f4ff 100%);">
  
  <!-- Main Container -->
  <div style="max-width: 480px; margin: 0 auto;">
    
    <!-- Top Header with Logo -->
    <div style="text-align: center; margin-bottom: 40px;">
      <!-- Logo Container -->
      <div style="
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 16px 32px;
        border-radius: 20px;
        margin-bottom: 24px;
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.25);
        position: relative;
        overflow: hidden;
      ">
        <!-- Glow Effect -->
        <div style="
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
        "></div>
        
        <div style="
          font-size: 28px;
          font-weight: 800;
          color: white;
          letter-spacing: 1px;
          position: relative;
          z-index: 1;
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
        Email Verification
      </h1>
      <p style="
        margin: 0;
        color: #64748b;
        font-size: 16px;
        font-weight: 500;
        line-height: 1.5;
      ">
        ${recipientName ? `Hi ${recipientName}, let's verify your account!` : 'Welcome! Let\'s verify your account.'}
      </p>
    </div>
    
    <!-- Main Card -->
    <div style="
      background: white;
      border-radius: 24px;
      padding: 40px;
      box-shadow: 
        0 20px 60px rgba(102, 126, 234, 0.15),
        0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(226, 232, 240, 0.6);
      margin-bottom: 32px;
    ">
      
      <!-- Decorative Top Accent -->
      <div style="
        height: 6px;
        background: linear-gradient(90deg, #667eea, #9f7aea, #764ba2);
        border-radius: 3px;
        margin: -40px -40px 32px -40px;
      "></div>
      
      <!-- Instruction -->
      <div style="text-align: center; margin-bottom: 40px;">
        <p style="
          color: #475569;
          font-size: 18px;
          line-height: 1.6;
          margin: 0 0 8px;
          padding: 0 20px;
        ">
          Enter this verification code to complete your setup:
        </p>
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f1f5f9;
          padding: 8px 16px;
          border-radius: 12px;
          margin-top: 12px;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
          <span style="
            color: #4f46e5;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
          ">
            6-DIGIT CODE REQUIRED
          </span>
        </div>
      </div>
      
      <!-- OTP Display -->
      <div style="margin: 0 0 48px;">
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
              background: linear-gradient(145deg, #ffffff, #f8fafc);
              border-radius: 16px;
              border: 2px solid #e2e8f0;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 
                0 6px 12px rgba(102, 126, 234, 0.1),
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
                background: linear-gradient(135deg, #667eea, #764ba2);
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
                  color: #1e293b;
                  line-height: 1;
                  text-align: center;
                  display: block;
                  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                  margin-top: 4px;
                ">
                  ${char}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- Full Code Display -->
        <div style="text-align: center;">
          <div style="
            display: inline-block;
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            padding: 16px 32px;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
            margin-bottom: 12px;
          ">
            <span style="
              font-family: 'SF Mono', Monaco, 'Courier New', monospace;
              font-size: 18px;
              font-weight: 600;
              color: #4f46e5;
              letter-spacing: 4px;
            ">
              ${otp}
            </span>
          </div>
          <p style="
            margin: 0;
            color: #64748b;
            font-size: 14px;
            font-weight: 500;
          ">
            Copy and paste if needed
          </p>
        </div>
      </div>
      
      <!-- Timer Section -->
      <div style="
        background: linear-gradient(135deg, #fffbeb, #fef3c7);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 32px;
        border: 2px solid #fbbf24;
        text-align: center;
        position: relative;
        overflow: hidden;
      ">
        <div style="display: inline-flex; align-items: center; gap: 16px;">
          <div style="
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
          ">
         
          </div>
          <div style="text-align: left;">
            <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
              EXPIRES IN
            </p>
            <p style="margin: 4px 0 0; color: #dc2626; font-size: 20px; font-weight: 800;">
              24 HOURS
            </p>
          </div>
        </div>
      </div>
      
      <!-- Security Info -->
      <div style="
        background: linear-gradient(135deg, #eff6ff, #f0f9ff);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 40px;
        border-left: 6px solid #3b82f6;
      ">
        <div style="display: flex; align-items: flex-start; gap: 16px;">
          <div style="
            flex-shrink: 0;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          ">
          
          </div>
          <div>
            <h3 style="margin: 0 0 8px; color: #1e40af; font-size: 18px; font-weight: 700;">
              Security First
            </h3>
            <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.5;">
              This code is unique to your account. Never share it. Genius Factor AI will never ask for your verification code.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Support Section -->
      <div style="
        border-top: 2px dashed #e2e8f0;
        padding-top: 32px;
        text-align: center;
      ">
        <p style="
          margin: 0 0 20px;
          color: #64748b;
          font-size: 16px;
          font-weight: 500;
        ">
          Need help with verification?
        </p>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <a href="mailto:support@geniusfactor.com" style="
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 14px 28px;
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            color: #475569;
            text-decoration: none;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          ">
            <span style="color: #3b82f6; font-size: 18px;">✉️</span>
            Email Support
          </a>
          <a href="#" style="
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 14px 28px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            color: white;
            text-decoration: none;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 
              0 8px 24px rgba(102, 126, 234, 0.3),
              0 4px 12px rgba(102, 126, 234, 0.2);
          ">
            <span style="font-size: 18px;">❓</span>
            Help Center
          </a>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center;">
      <!-- Mini Logo -->
      <div style="
        display: inline-block;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
        padding: 12px 24px;
        border-radius: 16px;
        margin-bottom: 24px;
        border: 1px solid rgba(102, 126, 234, 0.2);
      ">
        <span style="
          color: #667eea;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 0.5px;
        ">
          Genius Factor AI
        </span>
        <span style="
          color: #fbbf24;
          margin-left: 8px;
          font-size: 14px;
        ">⚡</span>
      </div>
      
      <!-- Links -->
      <div style="
        display: flex;
        justify-content: center;
        gap: 24px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      ">
        <a href="#" style="
          color: #64748b;
          font-size: 13px;
          text-decoration: none;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(100, 116, 139, 0.05);
          transition: all 0.3s ease;
        ">
          Privacy
        </a>
        <a href="#" style="
          color: #64748b;
          font-size: 13px;
          text-decoration: none;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(100, 116, 139, 0.05);
          transition: all 0.3s ease;
        ">
          Terms
        </a>
        <a href="#" style="
          color: #64748b;
          font-size: 13px;
          text-decoration: none;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(100, 116, 139, 0.05);
          transition: all 0.3s ease;
        ">
          Contact
        </a>
        <a href="#" style="
          color: #64748b;
          font-size: 13px;
          text-decoration: none;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(100, 116, 139, 0.05);
          transition: all 0.3s ease;
        ">
          Unsubscribe
        </a>
      </div>
      
      <!-- Copyright -->
      <div style="
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        margin-top: 8px;
      ">
        <p style="
          margin: 0;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.6;
        ">
          © ${new Date().getFullYear()} Genius Factor AI. All rights reserved.
        </p>
        <p style="
          margin: 8px 0 0;
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 500;
        ">
          This email was sent to verify your account. If you didn't request this, please ignore it.
        </p>
      </div>
    </div>
  </div>
  
  <!-- Animation Styles -->
  <style>
    @keyframes pulse {
      0% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
      100% { opacity: 0.6; transform: scale(1); }
    }
  </style>
</body>
</html>
`;

export const emailStyles = {
  mainBackground: 'linear-gradient(135deg, #f6f9ff 0%, #f0f4ff 100%)',
  primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  accentColor: '#fbbf24',
  textColor: '#1a202c',
  textMuted: '#64748b',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  borderRadius: '16px',
  boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)'
};