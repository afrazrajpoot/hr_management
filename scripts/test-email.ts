import { sendVerificationEmail } from '../src/lib/mail';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function main() {
    const email = process.env.ADMIN_EMAIL || 'roshnistore1@gmail.com';
    console.log(`Attempting to send email to ${email}...`);
    console.log('Checking env vars:');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing');
    console.log('GOOGLE_REFRESH_TOKEN:', process.env.GOOGLE_REFRESH_TOKEN ? 'Present' : 'Missing');
    console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL ? 'Present' : 'Missing');

    try {
        await sendVerificationEmail(email, 'test-token-123');
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

main();
