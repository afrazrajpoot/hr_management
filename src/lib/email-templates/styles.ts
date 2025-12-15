export const emailStyles = {
    mainBackground: '#f4f7f6',
    containerBackground: '#ffffff',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    textColor: '#333333',
    textMuted: '#718096',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    borderRadius: '12px',
    buttonGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    headerGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

export const commonHead = `
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style>
      body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
      a { text-decoration: none; color: inherit; }
      a:hover { opacity: 0.9; }
      .button-hover:hover { opacity: 0.9; transform: translateY(-1px); }
      @media screen and (max-width: 600px) {
        .email-container { width: 100% !important; padding: 20px !important; }
        .content-padding { padding: 20px !important; }
        .header-padding { padding: 30px 20px !important; }
      }
    </style>
  </head>
`;

export const getHeader = (title: string) => `
  <tr>
    <td align="center" style="padding: 40px 0 0 0;">
      <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
        <tr>
          <td class="header-padding" style="padding: 40px; text-align: center; background: ${emailStyles.headerGradient}; border-radius: ${emailStyles.borderRadius} ${emailStyles.borderRadius} 0 0;">
            <h1 style="margin: 0; color: #ffffff; font-family: ${emailStyles.fontFamily}; font-size: 28px; font-weight: 700; letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${title}</h1>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

export const getFooter = () => `
  <tr>
    <td align="center" style="padding: 0 0 40px 0;">
      <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
        <tr>
          <td style="padding: 30px 40px; background-color: #f8fafc; border-radius: 0 0 ${emailStyles.borderRadius} ${emailStyles.borderRadius}; text-align: center; border: 1px solid #e2e8f0; border-top: none;">
            <p style="margin: 0; color: ${emailStyles.textMuted}; font-family: ${emailStyles.fontFamily}; font-size: 14px; line-height: 1.5;">
              Need help? Contact us at <a href="mailto:${process.env.GOOGLE_SENDER_EMAIL}" style="color: ${emailStyles.primaryColor}; text-decoration: none;">${process.env.GOOGLE_SENDER_EMAIL}</a>
            </p>
            <p style="margin: 15px 0 0 0; color: #cbd5e0; font-family: ${emailStyles.fontFamily}; font-size: 12px;">
              © ${new Date().getFullYear()} Genius Factor. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;
