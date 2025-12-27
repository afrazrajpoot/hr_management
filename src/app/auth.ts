// lib/auth.ts
import { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/mail';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        firstName: { label: 'First Name', type: 'text' },
        lastName: { label: 'Last Name', type: 'text' },
        phoneNumber: { label: 'Phone Number', type: 'text' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          throw new Error('Invalid credentials');
        }

        const validRoles = ['Employee', 'HR', 'Admin'];
        const role = credentials.role && validRoles.includes(credentials.role)
          ? credentials.role
          : 'Employee';

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // User doesn't exist - CREATE NEW USER (initial signup)
        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

          user = await prisma.user.create({
            data: {
              email: credentials.email,
              firstName: credentials.firstName || credentials.email.split('@')[0],
              lastName: credentials.lastName || '',
              phoneNumber: credentials.phoneNumber || '',
              password: hashedPassword,
              role,
              verificationToken,
              emailVerified: null,
            },
          });

          try {
            await sendVerificationEmail(user.email!, verificationToken);
          } catch (error) {
            console.error('Failed to send verification email:', error);
          }
        }
        // User exists - LOGIN
        else {
          if (!user.password) {
            throw new Error('Invalid credentials');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid credentials');
          }

          // Update user fields if provided
          if (credentials.firstName || credentials.lastName || credentials.phoneNumber) {
            user = await prisma.user.update({
              where: { email: credentials.email },
              data: {
                firstName: credentials.firstName || user.firstName,
                lastName: credentials.lastName || user.lastName,
                phoneNumber: credentials.phoneNumber || user.phoneNumber,
              },
            });
          }
        }

        // Generate FastAPI JWT token
        let fastApiToken = null;
        try {
          const fastApiUrl = process.env.NEXT_PUBLIC_PYTHON_URL;
          const fastApiResponse = await fetch(`${fastApiUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              email: user.email,
              role: user.role,
              hr_id: user.hrId,
              first_name: user.firstName,
              last_name: user.lastName,
            }),
            signal: AbortSignal.timeout(5000),
          });

          if (fastApiResponse.ok) {
            const fastApiData = await fastApiResponse.json();
            fastApiToken = fastApiData.token;

            await prisma.user.update({
              where: { id: user.id },
              data: {
                fastApiToken: fastApiToken,
                fastApiTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
              },
            });
          }
        } catch (error) {
          console.error('Failed to generate FastAPI token:', error);
        }

        const accessToken = jwt.sign(
          { userId: user.id, role: user.role },
          process.env.JWT_SECRET!,
          { expiresIn: '15m' }
        );

        const refreshToken = crypto.randomBytes(40).toString('base64url');
        const accessExpires = Math.floor(Date.now() / 1000 + 15 * 60);
        const refreshExpires = Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60);

        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: 'credentials',
              providerAccountId: user.id.toString(),
            },
          },
          update: {
            type: 'credentials',
            access_token: accessToken,
            expires_at: accessExpires,
            refresh_token: refreshToken,
            refresh_expires_at: refreshExpires,
          },
          create: {
            userId: user.id,
            type: 'credentials',
            provider: 'credentials',
            providerAccountId: user.id.toString(),
            access_token: accessToken,
            expires_at: accessExpires,
            refresh_token: refreshToken,
            refresh_expires_at: refreshExpires,
          },
        });

        return {
          id: user.id.toString(),
          name: user.firstName,
          email: user.email,
          role: user.role,
          hrId: user.hrId,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
          department: user.department,
          paid: user.paid,
          emailVerified: user.emailVerified,
          fastApiToken: fastApiToken,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }: any) {
      try {
        // Initial sign in
        if (user && account?.provider === 'credentials') {
          const dbAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: 'credentials',
                providerAccountId: user.id.toString(),
              },
            },
          });

          if (dbAccount) {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
            });

            token.refreshExpiresAt = dbAccount.refresh_expires_at;
            token.userId = user.id;
            token.role = user.role;
            token.accessToken = dbAccount.access_token;
            token.hrId = user.hrId;
            token.firstName = user.firstName;
            token.lastName = user.lastName;
            token.image = user.image;
            token.department = user.department;
            token.emailVerified = dbUser?.emailVerified;
            token.paid = dbUser?.paid;
            token.fastApiToken = user.fastApiToken || dbUser?.fastApiToken;
            token.lastFetch = Date.now();
          }
        }

        // Only refresh from DB if explicitly triggered or token is stale (30+ min)
        if (!user && token.userId) {
          const thirtyMinutesInMs = 30 * 60 * 1000;
          const shouldRefresh = trigger === 'update' || 
                               !token.lastFetch || 
                               (Date.now() - token.lastFetch) > thirtyMinutesInMs;

          if (shouldRefresh) {
            try {
              const freshUser = await prisma.user.findUnique({
                where: { id: token.userId },
              });

              if (freshUser) {
                token.emailVerified = freshUser.emailVerified;
                token.role = freshUser.role;
                token.department = freshUser.department;
                token.firstName = freshUser.firstName;
                token.lastName = freshUser.lastName;
                token.image = freshUser.image;
                token.paid = freshUser.paid;
                token.fastApiToken = freshUser.fastApiToken;
                token.lastFetch = Date.now();
              }
            } catch (error: any) {
              console.error('Error refreshing user data:', error.message);
            }
          }
        }

        if (trigger === "update" && session) {
          return { ...token, ...session.user };
        }

        return token;
      } catch (error: any) {
        console.error('JWT callback error:', error.message);
        throw error;
      }
    },

    async session({ session, token }: any) {
      session.refreshExpiresAt = token.refreshExpiresAt;
      session.user.id = token.userId;
      session.user.role = token.role;
      session.user.name = token.firstName || session.user.firstName;
      session.user.email = token.email || session.user.email;
      session.user.image = token.image || session.user.image;
      session.user.hrId = token.hrId;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.department = token.department;
      session.user.emailVerified = token.emailVerified;
      session.user.paid = token.paid;
      session.user.fastApiToken = token.fastApiToken;
      session.accessToken = token.accessToken;

      if (!session.user.emailVerified) {
        session.requiresVerification = true;
        session.redirectTo = '/auth/verify-email';
        return session;
      }

      switch (token.role) {
        case 'Employee':
          session.redirectTo = '/employee-dashboard';
          break;
        case 'Admin':
          session.redirectTo = '/dashboard';
          break;
        case 'HR':
          session.redirectTo = '/hr-dashboard';
          break;
        default:
          session.redirectTo = '/auth/sign-in';
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};