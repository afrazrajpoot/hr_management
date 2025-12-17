import { emailStyles, commonHead, getHeader, getFooter } from './styles';

export const getVerificationEmailHtml = (otp: string, recipientName?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #9f7aea 50%, #d6bcfa 100%); background-size: 400% 400%; animation: gradient 15s ease infinite;">
  <!-- Email Container -->
  <div style="max-width: 500px; margin: 40px auto; padding: 20px;">
    
    <!-- Header Card -->
    <div style="background: #ffffff; border-radius: 20px 20px 0 0; padding: 40px 40px 30px; box-shadow: 0 10px 40px rgba(102, 126, 234, 0.1); border-bottom: 1px solid rgba(226, 232, 240, 0.5);">
      <!-- Logo/Brand -->
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px; border-radius: 16px; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15V19M12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15Z" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="12" r="9" stroke="white" stroke-width="2"/>
          </svg>
        </div>
      </div>
      
      <!-- Greeting -->
      <div style="text-align: center;">
        <h1 style="margin: 0 0 10px; font-size: 28px; font-weight: 700; color: #1a202c; letter-spacing: -0.5px;">
          ${recipientName ? `Hi ${recipientName},` : 'Hi there,'}
        </h1>
        <p style="margin: 0; color: #718096; font-size: 16px; line-height: 1.5;">
          Welcome to Genius Factor! Let's get you verified
        </p>
      </div>
    </div>
    
    <!-- Main Content Card -->
    <div style="background: #ffffff; border-radius: 0 0 20px 20px; padding: 40px; box-shadow: 0 10px 40px rgba(102, 126, 234, 0.1);">
      
      <!-- Verification Badge -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-flex; align-items: center; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); padding: 8px 20px; border-radius: 20px; border: 1px solid rgba(102, 126, 234, 0.2);">
          <span style="display: inline-block; width: 8px; height: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite;"></span>
          <span style="color: #667eea; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">EMAIL VERIFICATION</span>
        </div>
      </div>
      
      <!-- Instruction -->
      <p style="text-align: center; color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
        Enter this verification code in the application to complete your registration:
      </p>
      
      <!-- OTP Display -->
      <div style="margin: 0 0 40px;">
        <div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%); border-radius: 16px; padding: 30px; border: 2px solid rgba(102, 126, 234, 0.1); text-align: center; position: relative; overflow: hidden;">
          <!-- Decorative background pattern -->
          <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border-radius: 50%;"></div>
          
          <!-- OTP Code -->
          <div style="position: relative; z-index: 1;">
            <div style="display: inline-flex; gap: 12px; margin-bottom: 15px;">
              ${otp.split('').map((char, index) => `
                <div style="width: 50px; height: 60px; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid #e2e8f0; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);">
                  <span style="font-family: 'SF Mono', Monaco, monospace; font-size: 28px; font-weight: 700; color: #1a202c; letter-spacing: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    ${char}
                  </span>
                </div>
              `).join('')}
            </div>
            <p style="margin: 0; color: #667eea; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
              ${otp}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Timer & Info -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-flex; align-items: center; gap: 8px; background: #fef3c7; padding: 8px 16px; border-radius: 12px; border: 1px solid #fbbf24;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#d97706" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span style="color: #92400e; font-size: 13px; font-weight: 600;">
            Expires in: <span style="color: #dc2626;">24 hours</span>
          </span>
        </div>
      </div>
      
      <!-- Security Note -->
      <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.5; display: flex; align-items: flex-start; justify-content: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0; margin-top: 2px;">
            <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="#667eea" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>
            <strong style="color: #475569;">Security notice:</strong> This code is unique to your account and should not be shared with anyone.
          </span>
        </p>
      </div>
      
      <!-- Support Section -->
      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0 0 15px; color: #64748b; font-size: 14px; text-align: center;">
          Having trouble? We're here to help!
        </p>
        <div style="display: flex; justify-content: center; gap: 15px;">
          <a href="mailto:support@geniusfactor.com" style="display: inline-flex; align-items: center; gap: 6px; color: #667eea; font-size: 14px; font-weight: 600; text-decoration: none; padding: 8px 16px; border: 1px solid rgba(102, 126, 234, 0.2); border-radius: 8px; transition: all 0.3s ease;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Email Support
          </a>
          <a href="#" style="display: inline-flex; align-items: center; gap: 6px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 8px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; transition: all 0.3s ease;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Visit Help Center
          </a>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 30px 0 20px;">
      <p style="margin: 0 0 15px; color: rgba(255, 255, 255, 0.8); font-size: 13px; line-height: 1.5;">
        © ${new Date().getFullYear()} Genius Factor. All rights reserved.
      </p>
      <div style="display: flex; justify-content: center; gap: 20px;">
        <a href="#" style="color: rgba(255, 255, 255, 0.7); font-size: 12px; text-decoration: none;">Privacy Policy</a>
        <a href="#" style="color: rgba(255, 255, 255, 0.7); font-size: 12px; text-decoration: none;">Terms of Service</a>
        <a href="#" style="color: rgba(255, 255, 255, 0.7); font-size: 12px; text-decoration: none;">Unsubscribe</a>
      </div>
    </div>
  </div>
  
  <!-- Animation Styles -->
  <style>
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes pulse {
      0% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
      100% { opacity: 0.6; transform: scale(1); }
    }
  </style>
</body>
</html>
`;