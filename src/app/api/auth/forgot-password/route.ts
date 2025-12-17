import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // For security reasons, don't reveal if the user exists or not
            return NextResponse.json({ message: "If an account exists with this email, a password reset link has been sent." });
        }

        // Generate 6-digit OTP
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        try {
            const emailResult = await sendPasswordResetEmail(user.email!, resetToken);
            if (emailResult.success) {
                console.log('✅ Password reset email sent successfully');
            } else {
                console.warn('⚠️ Password reset email failed to send');
            }
        } catch (error) {
            console.error('❌ Unexpected error sending password reset email:', error);
            // Don't throw - still return success to user for security
        }

        return NextResponse.json({ message: "If an account exists with this email, a password reset link has been sent." });
    } catch (error) {
        console.error("Error requesting password reset:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
