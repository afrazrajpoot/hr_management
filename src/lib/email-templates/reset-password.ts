import { emailStyles, commonHead, getHeader, getFooter } from './styles';

export const getPasswordResetEmailHtml = (resetUrl: string, recipientName?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoa UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #fef3c7 0%, #ffedd5 50%, #fee2e2 100%);">
  <!-- Email Container -->
  <div style="max-width: 500px; margin: 40px auto; padding: 20px;">
    
    <!-- Security Banner -->
    <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); border-radius: 12px; padding: 12px 20px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(220, 38, 38, 0.2);">
      <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" stroke-width="2"/>
          <path d="M12 8v4M12 16h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span style="color: white; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
          SECURITY ALERT • ACTION REQUIRED
        </span>
      </div>
    </div>
    
    <!-- Main Card -->
    <div style="background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(220, 38, 38, 0.1); position: relative;">
      
      <!-- Decorative Top Border -->
      <div style="height: 6px; background: linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%); width: 100%;"></div>
      
      <!-- Header Section -->
      <div style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(to bottom, white, #fefaf5);">
        <!-- Shield Icon -->
        <div style="margin-bottom: 25px;">
          <div style="display: inline-block; padding: 16px; background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%); border-radius: 20px; border: 2px solid rgba(245, 158, 11, 0.3); position: relative;">
            <!-- Animated Rings -->
            <div style="position: absolute; top: -6px; left: -6px; right: -6px; bottom: -6px; border: 2px solid rgba(245, 158, 11, 0.2); border-radius: 24px; animation: pulse-ring 2s infinite;"></div>
            <div style="position: absolute; top: -12px; left: -12px; right: -12px; bottom: -12px; border: 1px solid rgba(245, 158, 11, 0.1); border-radius: 28px; animation: pulse-ring 3s infinite;"></div>
            
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="url(#gradient)" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round"/>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        
        <!-- Greeting -->
        <h1 style="margin: 0 0 12px; font-size: 32px; font-weight: 800; color: #1a202c; letter-spacing: -0.5px; background: linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
          ${recipientName ? `Hi ${recipientName},` : 'Password Reset'}
        </h1>
        <p style="margin: 0; color: #4a5568; font-size: 18px; font-weight: 500; line-height: 1.5;">
          Secure your Genius Factor account
        </p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 0 40px 40px;">
        
        <!-- Expiry Timer -->
        <div style="margin-bottom: 30px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-flex; align-items: center; gap: 8px; background: #fee2e2; padding: 10px 20px; border-radius: 20px; border: 2px solid #dc2626;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span style="font-size: 14px; font-weight: 700; color: #dc2626; letter-spacing: 0.5px;">
                EXPIRES IN: <span style="font-size: 16px;">1 HOUR</span>
              </span>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div style="background: #f3f4f6; height: 8px; border-radius: 4px; overflow: hidden; margin: 10px 0 25px;">
            <div style="width: 25%; height: 100%; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); border-radius: 4px; animation: progress-shrink 60s linear infinite;"></div>
          </div>
        </div>
        
        <!-- Warning Section -->
        <div style="background: linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%); border-radius: 16px; padding: 25px; border: 2px solid #fed7aa; margin-bottom: 30px; position: relative; overflow: hidden;">
          <!-- Warning Icon -->
          <div style="position: absolute; top: -12px; right: -12px; width: 40px; height: 40px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-weight: 700; font-size: 18px;">!</span>
          </div>
          
          <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #92400e; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Security Notice
          </h3>
          <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.5;">
            A password reset was requested for your account. If this wasn't you, please secure your account immediately and contact support.
          </p>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%); border-radius: 16px; padding: 20px 50px; color: white; text-decoration: none; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3); transition: all 0.3s ease; position: relative; overflow: hidden;">
            <!-- Shine effect -->
            <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%); transform: rotate(30deg); animation: shine 3s infinite;"></div>
            
            <span style="position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 12px;">
              Reset Password Now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 7L19 13M19 13L13 19M19 13L5 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </a>
          <p style="margin: 15px 0 0; color: #9ca3af; font-size: 14px; font-weight: 500;">
            Click the button above to create a new secure password
          </p>
        </div>
        
        <!-- Alternative Link -->
        <div style="margin-top: 40px; padding-top: 40px; border-top: 2px dashed #e5e7eb;">
          <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; text-align: center; font-weight: 500;">
            Or copy and paste this link:
          </p>
          <div style="background: #f9fafb; border-radius: 12px; padding: 18px; border: 2px solid #e5e7eb; position: relative;">
            <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: white; padding: 0 12px; color: #9ca3af; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">
              SECURE LINK
            </div>
            <div style="font-family: 'SF Mono', Monaco, monospace; font-size: 13px; word-break: break-all; color: #374151; text-align: center; line-height: 1.4;">
              ${resetUrl}
            </div>
            <button onclick="navigator.clipboard.writeText('${resetUrl}')" style="position: absolute; bottom: -12px; right: 20px; background: #10b981; color: white; border: none; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="white" stroke-width="2"/>
                <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="white" stroke-width="2"/>
              </svg>
              Copy
            </button>
          </div>
        </div>
        
        <!-- Security Tips -->
        <div style="margin-top: 40px;">
          <h3 style="margin: 0 0 20px; font-size: 20px; font-weight: 700; color: #1a202c; text-align: center; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Password Best Practices
          </h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; border: 1px solid #bbf7d0;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                <div style="width: 32px; height: 32px; background: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-weight: 700; font-size: 14px;">12+</span>
                </div>
                <span style="font-weight: 600; color: #065f46;">Length Matters</span>
              </div>
              <p style="margin: 0; color: #047857; font-size: 13px; line-height: 1.4;">
                Use at least 12 characters. Longer passwords are exponentially harder to crack.
              </p>
            </div>
            
            <div style="background: #eff6ff; border-radius: 12px; padding: 20px; border: 1px solid #bfdbfe;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                <div style="width: 32px; height: 32px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-weight: 700; font-size: 18px;">#</span>
                </div>
                <span style="font-weight: 600; color: #1e40af;">Mix Characters</span>
              </div>
              <p style="margin: 0; color: #1d4ed8; font-size: 13px; line-height: 1.4;">
                Combine uppercase, lowercase, numbers, and symbols for maximum security.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="padding: 30px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
        <!-- Support Section -->
        <div style="text-align: center; margin-bottom: 25px;">
          <h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #6b7280;">Need Help?</h4>
          <a href="mailto:support@geniusfactor.com" style="display: inline-flex; align-items: center; gap: 8px; color: #3b82f6; text-decoration: none; font-weight: 600; font-size: 16px; padding: 10px 20px; background: white; border-radius: 10px; border: 1px solid #d1d5db;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Contact Support
          </a>
        </div>
        
        <!-- Legal Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px; line-height: 1.5;">
            This email was sent because a password reset was requested for your account.
          </p>
          <div style="display: flex; justify-content: center; gap: 20px; margin: 15px 0;">
            <a href="#" style="color: #6b7280; font-size: 12px; text-decoration: none;">Privacy Policy</a>
            <a href="#" style="color: #6b7280; font-size: 12px; text-decoration: none;">Terms of Service</a>
            <a href="#" style="color: #6b7280; font-size: 12px; text-decoration: none;">Security</a>
          </div>
          <p style="margin: 15px 0 0; color: #9ca3af; font-size: 12px; font-weight: 500;">
            © ${new Date().getFullYear()} Genius Factor. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Animation Styles -->
  <style>
    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.2); opacity: 0; }
    }
    
    @keyframes progress-shrink {
      0% { width: 100%; }
      100% { width: 0%; }
    }
    
    @keyframes shine {
      0% { left: -100%; }
      100% { left: 100%; }
    }
  </style>
</body>
</html>
`