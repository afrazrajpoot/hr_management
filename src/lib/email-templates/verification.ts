import { emailStyles, commonHead, getHeader, getFooter } from './styles';

export const getVerificationEmailHtml = (otp: string) => `
<!DOCTYPE html>
<html>
  ${commonHead}
  <style>
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(to bottom right, hsl(var(--secondary)), hsl(var(--background)));
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }
    
    .hero-gradient {
      background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
      height: 8px;
      width: 100%;
    }
    
    .content-wrapper {
      background: hsl(var(--card));
      border-radius: var(--radius);
      border: 1px solid hsl(var(--border));
      margin: 20px;
    }
    
    .gradient-text {
      background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-weight: 700;
    }
    
    .otp-code {
      background: hsl(var(--muted));
      border: 2px dashed hsl(var(--primary));
      border-radius: var(--radius);
      padding: 20px;
      font-family: monospace;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 8px;
      color: hsl(var(--primary));
      text-align: center;
      margin: 30px 0;
    }
    
    .icon-circle {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 30px;
      border: 2px solid hsl(var(--primary) / 0.2);
    }
    
    .footer-gradient {
      background: linear-gradient(to right, transparent, hsl(var(--primary) / 0.1), transparent);
      height: 1px;
      width: 100%;
      margin: 30px 0;
    }
    
    .badge {
      background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1));
      color: hsl(var(--primary));
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid hsl(var(--primary) / 0.2);
    }
    
    @media (max-width: 600px) {
      .content-wrapper {
        margin: 10px;
      }
    }
  </style>
  <body style="margin: 0; padding: 20px; font-family: ${emailStyles.fontFamily}; background-color: hsl(var(--background)); color: hsl(var(--foreground));">
    <div class="email-container">
      <!-- Hero Gradient Line -->
      <div class="hero-gradient"></div>
      
      <!-- Header -->
      <div style="padding: 40px 40px 20px; text-align: center;">
        <div class="icon-circle">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15L12 19M12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15Z" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round"/>
            <path d="M19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12Z" stroke="url(#gradient)" stroke-width="2"/>
            <defs>
              <linearGradient id="gradient" x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
                <stop stop-color="hsl(var(--primary))"/>
                <stop offset="1" stop-color="hsl(var(--accent))"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <span class="badge" style="margin-bottom: 15px; display: inline-block;">
          🔐 Account Verification
        </span>
        
        <h1 style="margin: 0 0 10px; font-size: 32px; font-weight: 700;">
          Verify Your Email
        </h1>
        
        <p style="color: hsl(var(--muted-foreground)); font-size: 18px; margin: 0 0 30px; line-height: 1.6;">
          Use the code below to complete your registration
        </p>
      </div>
      
      <!-- Main Content -->
      <div class="content-wrapper" style="margin: 0 40px 40px;">
        <div style="padding: 40px;">
          <p style="color: hsl(var(--muted-foreground)); margin: 0 0 25px; line-height: 1.6; text-align: center;">
            Please enter this verification code in the application:
          </p>
          
          <div class="otp-code">
            ${otp}
          </div>
          
          <p style="color: hsl(var(--muted-foreground)); margin: 0; font-size: 14px; text-align: center;">
            This code will expire in 24 hours. If you didn't request this code, you can safely ignore this email.
          </p>
          
          <div class="footer-gradient"></div>
          
          <div style="text-align: center;">
            <p style="color: hsl(var(--muted-foreground)); margin: 0; font-size: 12px;">
              This code is unique to your account and should not be shared with anyone.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="padding: 30px 40px; text-align: center; background: hsl(var(--muted)); border-top: 1px solid hsl(var(--border));">
        <p style="color: hsl(var(--muted-foreground)); margin: 0; font-size: 12px;">
          © ${new Date().getFullYear()} Genius Factor. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
`;