// /app/api/skool-webhook/route.ts
// Set max duration for webhook (30 seconds)
export const maxDuration = 30;

import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/mail';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

const DEFAULT_PASSWORD = 'Pa$$w0rd!';
const REDIRECT_URL = 'https://geniusfactor.ai';

export async function POST(req: Request) {
  try {
    // Get the raw text first
    const text = await req.text();
    
    // Parse URL-encoded data
    const params = new URLSearchParams(text);
    const data: any = {};
    
    // Convert to object
    params.forEach((value, key) => {
      data[key] = value;
    });
    
    console.log("🔥 Webhook from Zapier/Skool:", data);
    
    // Extract user information from webhook payload
    // Handle both 'first_name' and 'first name' formats
    const email = (data.email ?? '').toString().toLowerCase().trim();
    const firstName = (data.first_name ?? data['first name'] ?? '').toString().trim();
    const lastName = (data.last_name ?? data['last name'] ?? '').toString().trim();
    
    // Validate required fields
    if (!email) {
      console.error("❌ Webhook error: Missing email in payload");
      return new Response(JSON.stringify({ success: false, error: 'Missing email' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    let user;
    let isNewUser = false;
    
    if (existingUser) {
      // Update existing user
      console.log(`📝 Updating existing user: ${email}`);
      user = await prisma.user.update({
        where: { email },
        data: {
          paid: true,
          amount: 39,
          role: 'Employee',
          updatedAt: new Date(),
        },
      });
      console.log(`✅ User updated successfully: ${email}`);
    } else {
      // Create new user
      console.log(`🆕 Creating new user: ${email}`);
      isNewUser = true;
      
      // Hash the default password
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      
      // Generate verification token (6-digit code)
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      
      user = await prisma.user.create({
        data: {
          firstName: firstName || null,
          lastName: lastName || null,
          email,
          password: hashedPassword,
          role: 'Employee',
          paid: true,
          amount: 39,
          verificationToken,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`✅ New user created successfully: ${email}`);
    }
    
    // Send emails (best-effort, don't fail webhook if email fails)
    try {
      // Generate verification token for existing users if they don't have one
      let verificationToken = user.verificationToken;
      if (!verificationToken) {
        verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.user.update({
          where: { email },
          data: { verificationToken },
        });
      }
      
      // First, send the Welcome Email (include default password for new users)
      console.log(`📧 Sending welcome email to: ${email}`);
      await Promise.race([
        sendWelcomeEmail(email, firstName || 'User', isNewUser ? DEFAULT_PASSWORD : undefined),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Welcome email timeout')), 10000)
        ),
      ]);
      console.log(`✅ Welcome email sent to: ${email}`);
      
      // Then, send the Account Verification Email (include default password for new users)
      console.log(`📧 Sending verification email to: ${email}`);
      await Promise.race([
        sendVerificationEmail(email, verificationToken, isNewUser ? DEFAULT_PASSWORD : undefined),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Verification email timeout')), 10000)
        ),
      ]);
      console.log(`✅ Verification email sent to: ${email}`);
      
    } catch (emailError) {
      console.error('⚠️ Email sending failed, but continuing webhook processing:', emailError);
    }
    
    // Return success with redirect URL
    return new Response(JSON.stringify({ 
      success: true, 
      message: isNewUser ? 'New user created successfully' : 'User updated successfully',
      email,
      redirectUrl: REDIRECT_URL
    }), { 
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Location': REDIRECT_URL
      }
    });
    
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle GET request for redirect (if Zapier follows the redirect)
export async function GET(req: Request) {
  return NextResponse.redirect(REDIRECT_URL);
}