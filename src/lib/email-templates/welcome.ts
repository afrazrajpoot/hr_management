import { emailStyles, commonHead, getHeader, getFooter } from './styles';

export const getWelcomeEmailHtml = (firstName: string, loginUrl: string) => `
<!DOCTYPE html>
<html>
  ${commonHead}
  <style>
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)));
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    }
    
    .welcome-gradient {
      background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
      height: 10px;
      width: 100%;
      position: relative;
      overflow: hidden;
    }
    
    .welcome-gradient:after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: shimmer 3s infinite;
    }
    
    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    
    .content-wrapper {
      background: hsl(var(--card));
      border-radius: var(--radius);
      border: 1px solid hsl(var(--border));
      margin: 30px;
      position: relative;
      overflow: hidden;
    }
    
    .confetti-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      opacity: 0.1;
    }
    
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      background: linear-gradient(45deg, hsl(var(--primary)), hsl(var(--accent)));
      border-radius: 2px;
      animation: confetti-fall 20s infinite linear;
    }
    
    @keyframes confetti-fall {
      0% {
        transform: translateY(-100px) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(600px) rotate(720deg);
        opacity: 0;
      }
    }
    
    .gradient-text-welcome {
      background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--success)));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-weight: 800;
      background-size: 200% 200%;
      animation: gradient-shift 3s ease infinite;
    }
    
    @keyframes gradient-shift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    
    .btn-gradient-celebration {
      background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
      border-radius: var(--radius);
      padding: 18px 45px;
      color: hsl(var(--primary-foreground));
      text-decoration: none;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      position: relative;
      overflow: hidden;
      font-size: 16px;
    }
    
    .btn-gradient-celebration:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: 0.5s;
    }
    
    .btn-gradient-celebration:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 15px 40px rgba(37, 99, 235, 0.4);
    }
    
    .btn-gradient-celebration:hover:before {
      left: 100%;
    }
    
    .welcome-icon-circle {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 30px;
      border: 3px solid hsl(var(--primary) / 0.2);
      position: relative;
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .welcome-icon-circle:after {
      content: '';
      position: absolute;
      width: 110px;
      height: 110px;
      border-radius: 50%;
      border: 2px solid hsl(var(--primary) / 0.1);
      animation: pulse-ring 2s infinite;
    }
    
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(1.2); opacity: 0; }
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    
    .feature-item {
      background: linear-gradient(135deg, hsl(var(--muted)), hsl(var(--background)));
      border-radius: calc(var(--radius) - 0.25rem);
      padding: 20px;
      border: 1px solid hsl(var(--border));
      transition: all 0.3s ease;
      text-align: center;
    }
    
    .feature-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      border-color: hsl(var(--primary) / 0.3);
    }
    
    .feature-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 15px;
    }
    
    .stats-badge {
      background: linear-gradient(135deg, hsl(var(--success)), hsl(var(--accent)));
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    
    .celebration-banner {
      background: linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--accent) / 0.05));
      border-radius: var(--radius);
      padding: 20px;
      border-left: 4px solid hsl(var(--success));
      margin: 25px 0;
      position: relative;
      overflow: hidden;
    }
    
    .celebration-banner:before {
      content: '🎉';
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 24px;
      opacity: 0.3;
    }
    
    .avatar-circle {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: 700;
      margin: 0 auto 20px;
      box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
    }
    
    .sparkle {
      position: absolute;
      width: 6px;
      height: 6px;
      background: white;
      border-radius: 50%;
      animation: sparkle 1.5s infinite;
    }
    
    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0); }
      50% { opacity: 1; transform: scale(1); }
    }
    
    .welcome-message {
      background: linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--muted)));
      border-radius: var(--radius);
      padding: 25px;
      position: relative;
      margin: 30px 0;
    }
    
    .welcome-message:before {
      content: '"';
      position: absolute;
      top: 10px;
      left: 20px;
      font-size: 60px;
      color: hsl(var(--primary) / 0.2);
      font-family: Georgia, serif;
      line-height: 1;
    }
    
    @media (max-width: 600px) {
      .content-wrapper {
        margin: 15px;
      }
      
      .feature-grid {
        grid-template-columns: 1fr;
      }
      
      .btn-gradient-celebration {
        padding: 16px 30px;
      }
    }
  </style>
  <body style="margin: 0; padding: 20px; font-family: ${emailStyles.fontFamily}; background-color: hsl(var(--background)); color: hsl(var(--foreground));">
    <div class="email-container">
      <!-- Celebration Gradient Header -->
      <div class="welcome-gradient"></div>
      
      <!-- Confetti Effect -->
      <div class="confetti-container" id="confetti"></div>
      
      <!-- Header -->
      <div style="padding: 50px 40px 30px; text-align: center; position: relative;">
        <!-- Floating Icon -->
        <div class="welcome-icon-circle">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="url(#welcomeGradient)" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <path d="M22 4L12 14.01l-3-3"/>
            <defs>
              <linearGradient id="welcomeGradient" x1="4" y1="4" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stop-color="hsl(var(--primary))"/>
                <stop offset="1" stop-color="hsl(var(--accent))"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <!-- Personalized Avatar -->
        <div class="avatar-circle">
          ${firstName.charAt(0).toUpperCase()}
        </div>
        
        <div class="stats-badge" style="margin-bottom: 15px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          ACCOUNT VERIFIED • PREMIUM ACCESS
        </div>
        
        <h1 style="margin: 15px 0 10px; font-size: 42px; font-weight: 800; line-height: 1.2;">
          Welcome<span class="gradient-text-welcome"> ${firstName}</span>!
        </h1>
        
        <p style="color: hsl(var(--muted-foreground)); font-size: 20px; margin: 0 0 30px; line-height: 1.6;">
          Your journey to discovering genius begins now 🚀
        </p>
      </div>
      
      <!-- Main Content -->
      <div class="content-wrapper" style="margin: 0 40px 40px;">
        <div style="padding: 40px;">
          <!-- Welcome Message -->
          <div class="celebration-banner">
            <h2 style="margin: 0 0 15px; font-size: 22px; font-weight: 700; color: hsl(var(--success));">
              🎊 Congratulations!
            </h2>
            <p style="margin: 0; color: hsl(var(--card-foreground)); line-height: 1.6;">
              Your account is now fully activated with access to all premium features. 
              We're thrilled to have you join our community of innovators and thinkers.
            </p>
          </div>
          
          <!-- Feature Highlights -->
          <h3 style="margin: 40px 0 20px; font-size: 20px; font-weight: 700; color: hsl(var(--card-foreground)); text-align: center;">
            What's Waiting For You:
          </h3>
          
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <h4 style="margin: 0 0 10px; font-size: 16px; font-weight: 600;">AI Assessments</h4>
              <p style="margin: 0; font-size: 14px; color: hsl(var(--muted-foreground));">
                Discover your unique talent profile
              </p>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))">
                  <path d="M12 19l7-7 3 3-7 7-9-9 7-7 3 3-7 7"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="M2 2l7.586 7.586"/>
                  <circle cx="11" cy="11" r="2"/>
                </svg>
              </div>
              <h4 style="margin: 0 0 10px; font-size: 16px; font-weight: 600;">Personalized Insights</h4>
              <p style="margin: 0; font-size: 14px; color: hsl(var(--muted-foreground));">
                Get tailored recommendations
              </p>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--success))">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <h4 style="margin: 0 0 10px; font-size: 16px; font-weight: 600;">Community Access</h4>
              <p style="margin: 0; font-size: 14px; color: hsl(var(--muted-foreground));">
                Connect with like-minded individuals
              </p>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--warning))">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h4 style="margin: 0 0 10px; font-size: 16px; font-weight: 600;">Progress Tracking</h4>
              <p style="margin: 0; font-size: 14px; color: hsl(var(--muted-foreground));">
                Monitor your growth journey
              </p>
            </div>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 50px 0;">
            <a href="${loginUrl}" class="btn-gradient-celebration">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Enter Your Dashboard
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 7l5 5-5 5M6 12h12"/>
              </svg>
            </a>
            <p style="color: hsl(var(--muted-foreground)); margin: 15px 0 0; font-size: 14px;">
              Start your first assessment in minutes
            </p>
          </div>
          
          <!-- Welcome Quote -->
          <div class="welcome-message">
            <p style="margin: 0; font-size: 16px; font-style: italic; color: hsl(var(--card-foreground)); line-height: 1.6;">
              "Every genius was once a beginner. Your journey of discovery starts today. 
              We're here to guide you every step of the way."
            </p>
            <p style="margin: 15px 0 0; font-size: 14px; font-weight: 600; color: hsl(var(--primary));">
              — The Genius Factor Team
            </p>
          </div>
          
          <!-- Quick Start Tips -->
          <div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, hsl(var(--muted)), hsl(var(--background))); border-radius: var(--radius);">
            <h3 style="margin: 0 0 20px; font-size: 18px; font-weight: 700; color: hsl(var(--card-foreground));">
              ⚡ Quick Start Guide
            </h3>
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1)); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="font-size: 12px; font-weight: 700; color: hsl(var(--primary));">1</span>
                </div>
                <div>
                  <p style="margin: 0; font-size: 14px; color: hsl(var(--card-foreground)); font-weight: 500;">
                    Complete Your Profile
                  </p>
                  <p style="margin: 5px 0 0; font-size: 13px; color: hsl(var(--muted-foreground));">
                    Help us personalize your experience
                  </p>
                </div>
              </div>
              
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1)); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="font-size: 12px; font-weight: 700; color: hsl(var(--primary));">2</span>
                </div>
                <div>
                  <p style="margin: 0; font-size: 14px; color: hsl(var(--card-foreground)); font-weight: 500;">
                    Take Initial Assessment
                  </p>
                  <p style="margin: 5px 0 0; font-size: 13px; color: hsl(var(--muted-foreground));">
                    15-minute evaluation of your strengths
                  </p>
                </div>
              </div>
              
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1)); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="font-size: 12px; font-weight: 700; color: hsl(var(--primary));">3</span>
                </div>
                <div>
                  <p style="margin: 0; font-size: 14px; color: hsl(var(--card-foreground)); font-weight: 500;">
                    Explore Recommendations
                  </p>
                  <p style="margin: 5px 0 0; font-size: 13px; color: hsl(var(--muted-foreground));">
                    Discover personalized growth paths
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, hsl(var(--muted)), hsl(var(--background))); border-top: 1px solid hsl(var(--border));">
        <h3 style="margin: 0 0 20px; font-size: 18px; font-weight: 700; color: hsl(var(--card-foreground));">
          Need Help Getting Started?
        </h3>
        
        <div style="display: flex; justify-content: center; gap: 30px; margin-bottom: 30px; flex-wrap: wrap;">
          <a href="#" style="color: hsl(var(--primary)); text-decoration: none; font-weight: 500; padding: 10px 20px; border: 1px solid hsl(var(--primary) / 0.3); border-radius: var(--radius); transition: all 0.3s;">
            📚 View Tutorials
          </a>
          <a href="mailto:support@geniusfactor.com" style="color: hsl(var(--primary)); text-decoration: none; font-weight: 500; padding: 10px 20px; border: 1px solid hsl(var(--primary) / 0.3); border-radius: var(--radius); transition: all 0.3s;">
            💬 Contact Support
          </a>
          <a href="#" style="color: hsl(var(--primary)); text-decoration: none; font-weight: 500; padding: 10px 20px; border: 1px solid hsl(var(--primary) / 0.3); border-radius: var(--radius); transition: all 0.3s;">
            🎥 Watch Demo
          </a>
        </div>
        
        <div style="border-top: 1px solid hsl(var(--border) / 0.3); padding-top: 25px;">
          <p style="color: hsl(var(--muted-foreground)); margin: 0 0 15px; font-size: 14px; line-height: 1.6;">
            Welcome to the Genius Factor family! We're excited to see what you'll achieve.
          </p>
          
          <div style="display: flex; justify-content: center; gap: 25px; margin: 25px 0;">
            <a href="#" style="display: inline-block;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="hsl(var(--primary))">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" style="display: inline-block;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="hsl(var(--primary))">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" style="display: inline-block;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="hsl(var(--primary))">
                <path d="M22.23 0H1.77C.8 0 0 .8 0 1.77v20.46C0 23.2.8 24 1.77 24h20.46c.98 0 1.77-.8 1.77-1.77V1.77C24 .8 23.2 0 22.23 0zM7.27 20.1H3.65V9.24h3.62V20.1zM5.47 7.76c-1.15 0-2.08-.94-2.08-2.08 0-1.15.93-2.08 2.08-2.08 1.15 0 2.08.93 2.08 2.08 0 1.15-.93 2.08-2.08 2.08zm14.63 12.34h-3.62v-5.8c0-1.38-.03-3.16-1.93-3.16-1.93 0-2.23 1.5-2.23 3.06v5.9h-3.62V9.24h3.48v1.56h.05c.48-.9 1.64-1.84 3.37-1.84 3.6 0 4.27 2.37 4.27 5.45v6.69z"/>
              </svg>
            </a>
          </div>
          
          <p style="color: hsl(var(--muted-foreground)); margin: 20px 0 0; font-size: 12px;">
            © ${new Date().getFullYear()} Genius Factor. All rights reserved.<br>
            This email was sent to welcome you to our community.
          </p>
        </div>
      </div>
    </div>
    
    <script>
      // Generate confetti
      function createConfetti() {
        const container = document.getElementById('confetti');
        if (!container) return;
        
        for (let i = 0; i < 20; i++) {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.style.left = Math.random() * 100 + '%';
          confetti.style.animationDelay = Math.random() * 5 + 's';
          confetti.style.background = \`linear-gradient(45deg, hsl(\${Math.random() > 0.5 ? 'var(--primary)' : 'var(--accent)'}), hsl(\${Math.random() > 0.5 ? 'var(--warning)' : 'var(--success)'}))\`;
          container.appendChild(confetti);
        }
      }
      
      // Generate sparkles
      function createSparkles() {
        const container = document.querySelector('.welcome-icon-circle');
        if (!container) return;
        
        for (let i = 0; i < 6; i++) {
          const sparkle = document.createElement('div');
          sparkle.className = 'sparkle';
          sparkle.style.left = Math.random() * 80 + 10 + '%';
          sparkle.style.top = Math.random() * 80 + 10 + '%';
          sparkle.style.animationDelay = Math.random() * 2 + 's';
          container.appendChild(sparkle);
        }
      }
      
      // Initialize effects
      document.addEventListener('DOMContentLoaded', function() {
        createConfetti();
        createSparkles();
      });
    </script>
  </body>
</html>
`;