import { emailStyles, commonHead, getHeader, getFooter } from './styles';

export const getVerificationEmailHtml = (verificationUrl: string) => `
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
    
    .btn-gradient-primary {
      background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
      border-radius: var(--radius);
      padding: 16px 40px;
      color: hsl(var(--primary-foreground));
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
      transition: all 0.3s ease;
      border: none;
    }
    
    .btn-gradient-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
      background: linear-gradient(135deg, hsl(217 91% 45%), hsl(142 76% 35%));
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
    
    .feature-card {
      background: hsl(var(--muted));
      border-radius: calc(var(--radius) - 0.25rem);
      padding: 20px;
      border: 1px solid hsl(var(--border));
      margin: 20px 0;
    }
    
    .feature-icon {
      background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1));
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
    }
    
    .footer-gradient {
      background: linear-gradient(to right, transparent, hsl(var(--primary) / 0.1), transparent);
      height: 1px;
      width: 100%;
      margin: 30px 0;
    }
    
    .countdown-badge {
      background: linear-gradient(135deg, hsl(var(--warning)), hsl(var(--destructive)));
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
      margin-left: 8px;
    }
    
    .link-copy {
      background: hsl(var(--muted));
      border: 1px solid hsl(var(--border));
      border-radius: var(--radius);
      padding: 12px 16px;
      font-family: monospace;
      font-size: 14px;
      word-break: break-all;
      color: hsl(var(--muted-foreground));
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
      
      .feature-card {
        padding: 15px;
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
          Welcome to <span class="gradient-text">Genius Factor</span>
        </h1>
        
        <p style="color: hsl(var(--muted-foreground)); font-size: 18px; margin: 0 0 30px; line-height: 1.6;">
          Complete your registration to unlock the full potential
        </p>
      </div>
      
      <!-- Main Content -->
      <div class="content-wrapper" style="margin: 0 40px 40px;">
        <div style="padding: 40px;">
          <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: hsl(var(--card-foreground));">
            Verify Your Email Address
          </h2>
          
          <p style="color: hsl(var(--muted-foreground)); margin: 0 0 25px; line-height: 1.6;">
            Thank you for joining Genius Factor! We're excited to help you discover and develop your unique talents. 
            To ensure your account security and activate all features, please verify your email address.
          </p>
          
          <!-- Feature Highlights -->
          <div class="feature-card">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"/>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Secure Access</h3>
                <p style="margin: 5px 0 0; font-size: 14px; color: hsl(var(--muted-foreground));">
                  Protect your personal data and assessment results
                </p>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-width="2"/>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 600;">AI-Powered Insights</h3>
                <p style="margin: 5px 0 0; font-size: 14px; color: hsl(var(--muted-foreground));">
                  Unlock personalized talent analysis and recommendations
                </p>
              </div>
            </div>
            
            <div style="display: flex; align-items: center;">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--warning))">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"/>
                </svg>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Timely Access</h3>
                <p style="margin: 5px 0 0; font-size: 14px; color: hsl(var(--muted-foreground));">
                  Link expires in <strong>24 hours</strong> <span class="countdown-badge">ACT NOW</span>
                </p>
              </div>
            </div>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationUrl}" class="btn-gradient-primary">
              Verify Email & Get Started
              <svg width="16" height="16" style="margin-left: 8px; vertical-align: -2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>
          </div>
          
          <div class="footer-gradient"></div>
          
          <!-- Alternative Link -->
          <div style="text-align: center;">
            <p style="color: hsl(var(--muted-foreground)); margin: 0 0 15px; font-size: 14px;">
              If the button doesn't work, copy and paste this URL into your browser:
            </p>
            <div class="link-copy">
              ${verificationUrl}
            </div>
            <p style="color: hsl(var(--muted-foreground)); margin: 15px 0 0; font-size: 12px;">
              This link is unique to you and should not be shared with others.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="padding: 30px 40px; text-align: center; background: hsl(var(--muted)); border-top: 1px solid hsl(var(--border));">
        <p style="color: hsl(var(--muted-foreground)); margin: 0 0 20px; font-size: 14px;">
          Need help? Contact our support team at 
          <a href="mailto:support@geniusfactor.com" style="color: hsl(var(--primary)); text-decoration: none; font-weight: 500;">
            support@geniusfactor.com
          </a>
        </p>
        
        <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
          <a href="#" style="color: hsl(var(--muted-foreground)); text-decoration: none; font-size: 12px;">
            Privacy Policy
          </a>
          <span style="color: hsl(var(--border));">•</span>
          <a href="#" style="color: hsl(var(--muted-foreground)); text-decoration: none; font-size: 12px;">
            Terms of Service
          </a>
          <span style="color: hsl(var(--border));">•</span>
          <a href="#" style="color: hsl(var(--muted-foreground)); text-decoration: none; font-size: 12px;">
            Unsubscribe
          </a>
        </div>
        
        <p style="color: hsl(var(--muted-foreground)); margin: 0; font-size: 12px;">
          © ${new Date().getFullYear()} Genius Factor. All rights reserved.
        </p>
        
        <div style="margin-top: 20px; display: flex; justify-content: center; gap: 15px;">
          <a href="#" style="display: inline-block;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="hsl(var(--primary))">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </a>
          <a href="#" style="display: inline-block;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="hsl(var(--primary))">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a href="#" style="display: inline-block;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="hsl(var(--primary))">
              <path d="M22.23 0H1.77C.8 0 0 .8 0 1.77v20.46C0 23.2.8 24 1.77 24h20.46c.98 0 1.77-.8 1.77-1.77V1.77C24 .8 23.2 0 22.23 0zM7.27 20.1H3.65V9.24h3.62V20.1zM5.47 7.76c-1.15 0-2.08-.94-2.08-2.08 0-1.15.93-2.08 2.08-2.08 1.15 0 2.08.93 2.08 2.08 0 1.15-.93 2.08-2.08 2.08zm14.63 12.34h-3.62v-5.8c0-1.38-.03-3.16-1.93-3.16-1.93 0-2.23 1.5-2.23 3.06v5.9h-3.62V9.24h3.48v1.56h.05c.48-.9 1.64-1.84 3.37-1.84 3.6 0 4.27 2.37 4.27 5.45v6.69z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </body>
</html>
`;