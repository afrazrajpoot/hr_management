import { emailStyles, commonHead, getHeader, getFooter } from './styles';

export const getPasswordResetEmailHtml = (resetUrl: string) => `
<!DOCTYPE html>
<html>
  ${commonHead}
  <style>
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, hsl(var(--muted)), hsl(var(--background)));
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }
    
    .security-gradient {
      background: linear-gradient(135deg, hsl(var(--warning)), hsl(var(--destructive) / 0.8));
      height: 6px;
      width: 100%;
    }
    
    .content-wrapper {
      background: hsl(var(--card));
      border-radius: var(--radius);
      border: 1px solid hsl(var(--border));
      margin: 20px;
      position: relative;
      overflow: hidden;
    }
    
    .security-shield {
      position: absolute;
      top: -20px;
      right: -20px;
      width: 120px;
      height: 120px;
      opacity: 0.1;
      pointer-events: none;
    }
    
    .gradient-text-warning {
      background: linear-gradient(135deg, hsl(var(--warning)), hsl(var(--destructive)));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-weight: 700;
    }
    
    .btn-gradient-security {
      background: linear-gradient(135deg, hsl(var(--warning)), hsl(var(--destructive)));
      border-radius: var(--radius);
      padding: 16px 40px;
      color: white;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
      transition: all 0.3s ease;
      border: none;
      position: relative;
      overflow: hidden;
    }
    
    .btn-gradient-security:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: 0.5s;
    }
    
    .btn-gradient-security:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(245, 158, 11, 0.4);
    }
    
    .btn-gradient-security:hover:before {
      left: 100%;
    }
    
    .icon-shield {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, hsl(var(--warning) / 0.1), hsl(var(--destructive) / 0.1));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 30px;
      border: 2px solid hsl(var(--warning) / 0.3);
      position: relative;
    }
    
    .icon-shield:after {
      content: '';
      position: absolute;
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 2px solid hsl(var(--warning) / 0.1);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(1.2); opacity: 0; }
    }
    
    .security-tip {
      background: linear-gradient(135deg, hsl(var(--warning) / 0.05), hsl(var(--destructive) / 0.05));
      border-radius: calc(var(--radius) - 0.25rem);
      padding: 20px;
      border-left: 4px solid hsl(var(--warning));
      margin: 25px 0;
    }
    
    .countdown-timer {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, hsl(var(--destructive) / 0.1), hsl(var(--warning) / 0.1));
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid hsl(var(--destructive) / 0.2);
    }
    
    .timer-icon {
      animation: spin 2s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .link-box {
      background: hsl(var(--muted));
      border: 2px dashed hsl(var(--warning) / 0.3);
      border-radius: var(--radius);
      padding: 16px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 13px;
      word-break: break-all;
      color: hsl(var(--muted-foreground));
      position: relative;
      padding-left: 40px;
    }
    
    .copy-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: hsl(var(--warning));
    }
    
    .step-indicator {
      display: flex;
      justify-content: space-between;
      margin: 30px 0;
      position: relative;
    }
    
    .step-indicator:before {
      content: '';
      position: absolute;
      top: 15px;
      left: 20%;
      right: 20%;
      height: 2px;
      background: linear-gradient(90deg, hsl(var(--warning)), hsl(var(--destructive)));
      z-index: 1;
    }
    
    .step {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: hsl(var(--background));
      border: 2px solid hsl(var(--warning));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: hsl(var(--warning));
      z-index: 2;
    }
    
    .step.active {
      background: linear-gradient(135deg, hsl(var(--warning)), hsl(var(--destructive)));
      color: white;
      transform: scale(1.1);
    }
    
    .urgency-badge {
      background: linear-gradient(135deg, hsl(var(--destructive)), hsl(var(--warning)));
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      animation: pulse-badge 2s infinite;
    }
    
    @keyframes pulse-badge {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @media (max-width: 600px) {
      .content-wrapper {
        margin: 10px;
      }
      
      .security-tip {
        padding: 15px;
      }
      
      .step-indicator:before {
        left: 15%;
        right: 15%;
      }
    }
  </style>
  <body style="margin: 0; padding: 20px; font-family: ${emailStyles.fontFamily}; background-color: hsl(var(--background)); color: hsl(var(--foreground));">
    <div class="email-container">
      <!-- Security Gradient Header -->
      <div class="security-gradient"></div>
      
      <!-- Security Shield Background -->
      <svg class="security-shield" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--warning))">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="1"/>
      </svg>
      
      <!-- Header -->
      <div style="padding: 40px 40px 20px; text-align: center;">
        <div class="icon-shield">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#shieldGradient)" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M12 8v4M12 16h.01" stroke-linecap="round"/>
            <defs>
              <linearGradient id="shieldGradient" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                <stop stop-color="hsl(var(--warning))"/>
                <stop offset="1" stop-color="hsl(var(--destructive))"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <div class="urgency-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
          SECURE REQUEST • EXPIRES SOON
        </div>
        
        <h1 style="margin: 15px 0 10px; font-size: 32px; font-weight: 700;">
          Password <span class="gradient-text-warning">Reset</span>
        </h1>
        
        <p style="color: hsl(var(--muted-foreground)); font-size: 18px; margin: 0 0 30px; line-height: 1.6;">
          Secure your Genius Factor account
        </p>
      </div>
      
      <!-- Main Content -->
      <div class="content-wrapper" style="margin: 0 40px 40px;">
        <div style="padding: 40px;">
          <!-- Progress Steps -->
          <div class="step-indicator">
            <div class="step active">1</div>
            <div class="step">2</div>
            <div class="step">3</div>
          </div>
          
          <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: hsl(var(--card-foreground));">
            Account Security Request
          </h2>
          
          <p style="color: hsl(var(--muted-foreground)); margin: 0 0 20px; line-height: 1.6;">
            We received a request to reset your Genius Factor account password. For your security, this link expires in:
          </p>
          
          <div class="countdown-timer" style="margin-bottom: 25px;">
            <svg class="timer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--destructive))">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span style="font-weight: 600; color: hsl(var(--destructive));">
              <strong>1 HOUR</strong>
            </span>
          </div>
          
          <!-- Security Tip -->
          <div class="security-tip">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--warning))">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-width="2"/>
              </svg>
              <div>
                <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: hsl(var(--warning))">
                  Security Notice
                </h3>
                <p style="margin: 0; font-size: 14px; color: hsl(var(--muted-foreground)); line-height: 1.5;">
                  If you didn't request this password reset, your account may be at risk. Please secure your account immediately and contact support.
                </p>
              </div>
            </div>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" class="btn-gradient-security">
              <span style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                Reset Password Now
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.5 12H3"/>
                </svg>
              </span>
            </a>
            <p style="color: hsl(var(--muted-foreground)); margin: 15px 0 0; font-size: 12px;">
              Click to create a new secure password
            </p>
          </div>
          
          <!-- Alternative Link -->
          <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid hsl(var(--border) / 0.5);">
            <p style="color: hsl(var(--muted-foreground)); margin: 0 0 15px; font-size: 14px; text-align: center;">
              Or copy and paste this secure link:
            </p>
            <div class="link-box">
              <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              ${resetUrl}
            </div>
          </div>
          
          <!-- Security Checklist -->
          <div style="margin-top: 40px; padding: 20px; background: hsl(var(--muted)); border-radius: var(--radius);">
            <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: hsl(var(--card-foreground));">
              🔐 Password Best Practices
            </h3>
            <div style="display: grid; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--success))">
                  <path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span style="font-size: 14px; color: hsl(var(--muted-foreground));">
                  Use at least 12 characters
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--success))">
                  <path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span style="font-size: 14px; color: hsl(var(--muted-foreground));">
                  Include numbers and symbols
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--success))">
                  <path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span style="font-size: 14px; color: hsl(var(--muted-foreground));">
                  Avoid common words and patterns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="padding: 30px 40px; text-align: center; background: hsl(var(--muted)); border-top: 1px solid hsl(var(--border));">
        <div style="margin-bottom: 20px; display: flex; justify-content: center; gap: 30px;">
          <div>
            <h4 style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: hsl(var(--muted-foreground));">
              Need Help?
            </h4>
            <a href="mailto:support@geniusfactor.com" style="color: hsl(var(--primary)); text-decoration: none; font-size: 14px;">
              support@geniusfactor.com
            </a>
          </div>
          <div>
            <h4 style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: hsl(var(--muted-foreground));">
              Emergency?
            </h4>
            <a href="#" style="color: hsl(var(--destructive)); text-decoration: none; font-size: 14px; font-weight: 500;">
              Report Security Issue
            </a>
          </div>
        </div>
        
        <div style="border-top: 1px solid hsl(var(--border) / 0.3); padding-top: 20px;">
          <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 15px;">
            <a href="#" style="color: hsl(var(--muted-foreground)); text-decoration: none; font-size: 12px;">
              Privacy Policy
            </a>
            <span style="color: hsl(var(--border));">•</span>
            <a href="#" style="color: hsl(var(--muted-foreground)); text-decoration: none; font-size: 12px;">
              Security Center
            </a>
            <span style="color: hsl(var(--border));">•</span>
            <a href="#" style="color: hsl(var(--muted-foreground)); text-decoration: none; font-size: 12px;">
              Account Settings
            </a>
          </div>
          
          <p style="color: hsl(var(--muted-foreground)); margin: 0; font-size: 12px;">
            For your security, this email was sent to you because a password reset was requested.
          </p>
          <p style="color: hsl(var(--muted-foreground)); margin: 5px 0 0; font-size: 12px;">
            © ${new Date().getFullYear()} Genius Factor. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
`;