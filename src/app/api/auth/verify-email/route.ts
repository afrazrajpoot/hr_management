// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/mail';
import crypto from 'crypto';

// Set max duration for this route (30 seconds)
export const maxDuration = 30;

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: 'Verification token is required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findFirst({
            where: { verificationToken: token },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid verification token' },
                { status: 400 }
            );
        }

        // Generate one-time auto-login token (valid for 5 minutes)
        const autoLoginToken = crypto.randomBytes(32).toString('hex');
        const autoLoginExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Update user to mark email as verified and set auto-login token
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null,
                autoLoginToken: autoLoginToken,
                autoLoginExpiry: autoLoginExpiry,
            },
        });

        // Send welcome email
        if (updatedUser.email) {
            try {
                await sendWelcomeEmail(updatedUser.email, updatedUser.firstName || 'User');
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // Continue execution - don't fail the verification if email fails
            }
        }

        return NextResponse.json({
            message: 'Email verified successfully',
            verified: true,
            role: updatedUser.role,
            email: updatedUser.email,
            userId: updatedUser.id,
            autoLoginToken: autoLoginToken,
        });
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}