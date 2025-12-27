// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/mail';

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

        // Update user to mark email as verified and clear verification token
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null,
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
        });
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}