import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mail";

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
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.emailVerified) {
            return NextResponse.json({ message: "Email already verified" });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken },
        });

        await sendVerificationEmail(user.email!, verificationToken);

        return NextResponse.json({ message: "Verification email sent" });
    } catch (error) {
        console.error("Error sending verification email:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
