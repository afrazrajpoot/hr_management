import { emailStyles, commonHead, getHeader, getFooter } from './styles';

export const getWelcomeEmailHtml = (firstName: string, loginUrl: string) => `
<!DOCTYPE html>
<html>
  ${commonHead}
  <body style="margin: 0; padding: 20px; font-family: ${emailStyles.fontFamily}; background-color: ${emailStyles.mainBackground}; color: ${emailStyles.textColor};">
    <div style="max-width: 600px; margin: 0 auto; background-color: ${emailStyles.containerBackground}; border-radius: ${emailStyles.borderRadius}; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);">
      <!-- Celebration Gradient Header -->
      <div style="background: linear-gradient(135deg, ${emailStyles.primaryColor}, ${emailStyles.secondaryColor}); height: 10px; width: 100%;"></div>
      
      <!-- Header -->
      <div style="padding: 50px 40px 30px; text-align: center;">
        <!-- Floating Icon -->
        <div style="width: 100px; height: 100px; background-color: #f0f4ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; border: 3px solid #e0e7ff;">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="${emailStyles.primaryColor}" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <path d="M22 4L12 14.01l-3-3"/>
          </svg>
        </div>
        
        <!-- Personalized Avatar -->
        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, ${emailStyles.primaryColor}, ${emailStyles.secondaryColor}); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 700; margin: 0 auto 20px; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);">
          ${firstName.charAt(0).toUpperCase()}
        </div>
        
        <div style="background: linear-gradient(135deg, ${emailStyles.successColor}, ${emailStyles.secondaryColor}); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 15px;">
          ACCOUNT VERIFIED • PREMIUM ACCESS
        </div>
        
        <h1 style="margin: 15px 0 10px; font-size: 42px; font-weight: 800; line-height: 1.2; color: ${emailStyles.textColor};">
          Welcome <span style="color: ${emailStyles.primaryColor};">${firstName}</span>!
        </h1>
        
        <p style="color: ${emailStyles.textMuted}; font-size: 20px; margin: 0 0 30px; line-height: 1.6;">
          Your journey to discovering genius begins now 🚀
        </p>
      </div>
      
      <!-- Main Content -->
      <div style="background-color: ${emailStyles.containerBackground}; border-radius: ${emailStyles.borderRadius}; border: 1px solid ${emailStyles.borderColor}; margin: 0 40px 40px;">
        <div style="padding: 40px;">
          <!-- Welcome Message -->
          <div style="background-color: #f0fdf4; border-radius: ${emailStyles.borderRadius}; padding: 20px; border-left: 4px solid ${emailStyles.successColor}; margin: 25px 0;">
            <h2 style="margin: 0 0 15px; font-size: 22px; font-weight: 700; color: ${emailStyles.successColor};">
              🎊 Congratulations!
            </h2>
            <p style="margin: 0; color: ${emailStyles.textColor}; line-height: 1.6;">
              Your account is now fully activated with access to all premium features. 
              We're thrilled to have you join our community of innovators and thinkers.
            </p>
          </div>
          
          <!-- Feature Highlights -->
          <h3 style="margin: 40px 0 20px; font-size: 20px; font-weight: 700; color: ${emailStyles.textColor}; text-align: center;">
            What's Waiting For You:
          </h3>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="50%" style="padding: 10px;">
                <div style="background-color: ${emailStyles.mutedColor}; border-radius: 8px; padding: 20px; border: 1px solid ${emailStyles.borderColor}; text-align: center;">
                  <div style="width: 50px; height: 50px; background-color: #e0e7ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${emailStyles.primaryColor}">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                      <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                  </div>
                  <h4 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: ${emailStyles.textColor};">AI Assessments</h4>
                  <p style="margin: 0; font-size: 14px; color: ${emailStyles.textMuted};">
                    Discover your unique talent profile
                  </p>
                </div>
              </td>
              <td width="50%" style="padding: 10px;">
                <div style="background-color: ${emailStyles.mutedColor}; border-radius: 8px; padding: 20px; border: 1px solid ${emailStyles.borderColor}; text-align: center;">
                  <div style="width: 50px; height: 50px; background-color: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${emailStyles.accentColor}">
                      <path d="M12 19l7-7 3 3-7 7-9-9 7-7 3 3-7 7"/>
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                      <path d="M2 2l7.586 7.586"/>
                      <circle cx="11" cy="11" r="2"/>
                    </svg>
                  </div>
                  <h4 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: ${emailStyles.textColor};">Personalized Insights</h4>
                  <p style="margin: 0; font-size: 14px; color: ${emailStyles.textMuted};">
                    Get tailored recommendations
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td width="50%" style="padding: 10px;">
                <div style="background-color: ${emailStyles.mutedColor}; border-radius: 8px; padding: 20px; border: 1px solid ${emailStyles.borderColor}; text-align: center;">
                  <div style="width: 50px; height: 50px; background-color: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${emailStyles.successColor}">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                  </div>
                  <h4 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: ${emailStyles.textColor};">Community Access</h4>
                  <p style="margin: 0; font-size: 14px; color: ${emailStyles.textMuted};">
                    Connect with like-minded individuals
                  </p>
                </div>
              </td>
              <td width="50%" style="padding: 10px;">
                <div style="background-color: ${emailStyles.mutedColor}; border-radius: 8px; padding: 20px; border: 1px solid ${emailStyles.borderColor}; text-align: center;">
                  <div style="width: 50px; height: 50px; background-color: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${emailStyles.warningColor}">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h4 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: ${emailStyles.textColor};">Progress Tracking</h4>
                  <p style="margin: 0; font-size: 14px; color: ${emailStyles.textMuted};">
                    Monitor your growth journey
                  </p>
                </div>
              </td>
            </tr>
          </table>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 50px 0;">
            <a href="${loginUrl}" style="background: linear-gradient(135deg, ${emailStyles.primaryColor}, ${emailStyles.secondaryColor}); border-radius: ${emailStyles.borderRadius}; padding: 18px 45px; color: white; text-decoration: none; font-weight: 700; display: inline-block; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.3);">
              Enter Your Dashboard
            </a>
            <p style="color: ${emailStyles.textMuted}; margin: 15px 0 0; font-size: 14px;">
              Start your first assessment in minutes
            </p>
          </div>
          
          <!-- Welcome Quote -->
          <div style="background-color: #f8fafc; border-radius: ${emailStyles.borderRadius}; padding: 25px; margin: 30px 0; border: 1px solid ${emailStyles.borderColor};">
            <p style="margin: 0; font-size: 16px; font-style: italic; color: ${emailStyles.textColor}; line-height: 1.6;">
              "Every genius was once a beginner. Your journey of discovery starts today. 
              We're here to guide you every step of the way."
            </p>
            <p style="margin: 15px 0 0; font-size: 14px; font-weight: 600; color: ${emailStyles.primaryColor};">
              — The Genius Factor Team
            </p>
          </div>
          
          <!-- Quick Start Tips -->
          <div style="margin-top: 40px; padding: 25px; background-color: ${emailStyles.mutedColor}; border-radius: ${emailStyles.borderRadius};">
            <h3 style="margin: 0 0 20px; font-size: 18px; font-weight: 700; color: ${emailStyles.textColor};">
              ⚡ Quick Start Guide
            </h3>
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background-color: #e0e7ff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="font-size: 12px; font-weight: 700; color: ${emailStyles.primaryColor};">1</span>
                </div>
                <div>
                  <p style="margin: 0; font-size: 14px; color: ${emailStyles.textColor}; font-weight: 500;">
                    Complete Your Profile
                  </p>
                  <p style="margin: 5px 0 0; font-size: 13px; color: ${emailStyles.textMuted};">
                    Help us personalize your experience
                  </p>
                </div>
              </div>
              
              <div style="display: flex; align-items: flex-start; gap: 12px; margin-top: 15px;">
                <div style="background-color: #e0e7ff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="font-size: 12px; font-weight: 700; color: ${emailStyles.primaryColor};">2</span>
                </div>
                <div>
                  <p style="margin: 0; font-size: 14px; color: ${emailStyles.textColor}; font-weight: 500;">
                    Take Initial Assessment
                  </p>
                  <p style="margin: 5px 0 0; font-size: 13px; color: ${emailStyles.textMuted};">
                    15-minute evaluation of your strengths
                  </p>
                </div>
              </div>
              
              <div style="display: flex; align-items: flex-start; gap: 12px; margin-top: 15px;">
                <div style="background-color: #e0e7ff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <span style="font-size: 12px; font-weight: 700; color: ${emailStyles.primaryColor};">3</span>
                </div>
                <div>
                  <p style="margin: 0; font-size: 14px; color: ${emailStyles.textColor}; font-weight: 500;">
                    Explore Recommendations
                  </p>
                  <p style="margin: 5px 0 0; font-size: 13px; color: ${emailStyles.textMuted};">
                    Discover personalized growth paths
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="padding: 40px; text-align: center; background-color: ${emailStyles.mutedColor}; border-top: 1px solid ${emailStyles.borderColor};">
        <h3 style="margin: 0 0 20px; font-size: 18px; font-weight: 700; color: ${emailStyles.textColor};">
          Need Help Getting Started?
        </h3>
        
        <div style="display: flex; justify-content: center; gap: 30px; margin-bottom: 30px; flex-wrap: wrap;">
          <a href="mailto:support@geniusfactor.com" style="color: ${emailStyles.primaryColor}; text-decoration: none; font-weight: 500; padding: 10px 20px; border: 1px solid #e0e7ff; border-radius: ${emailStyles.borderRadius};">
            💬 Contact Support
          </a>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 25px;">
          <p style="color: ${emailStyles.textMuted}; margin: 0 0 15px; font-size: 14px; line-height: 1.6;">
            Welcome to the Genius Factor family! We're excited to see what you'll achieve.
          </p>
          
          <p style="color: ${emailStyles.textMuted}; margin: 20px 0 0; font-size: 12px;">
            © ${new Date().getFullYear()} Genius Factor. All rights reserved.<br>
            This email was sent to welcome you to our community.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
`;