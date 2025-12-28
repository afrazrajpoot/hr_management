// lib/auth.ts
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';


export const authOptions: AuthOptions = {
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

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        // Option A: DO NOT auto-create users during login.
        // This prevents accidental "zombie" accounts when users mistype their email.
        if (!user) {
          return null;
        } else {
          if (!user.password) {
            throw new Error('Invalid credentials');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid credentials');
          }
        }

        // Generate short-lived access/refresh tokens for NextAuth Account
        const accessToken = jwt.sign(
          { userId: user.id, role: user.role },
          process.env.JWT_SECRET!,
          { expiresIn: '15m' }
        );

        const refreshToken = crypto.randomBytes(40).toString('base64url');
        const accessExpires = Math.floor(Date.now() / 1000 + 15 * 60);
        const refreshExpires = Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60);

        // FastAPI token: reuse if still valid, otherwise try to refresh.
        // IMPORTANT: do not block login on FastAPI; keep a short timeout.
        const nowMs = Date.now();
        const hasValidFastApiToken =
          !!user.fastApiToken &&
          !!user.fastApiTokenExpiry &&
          (user.fastApiTokenExpiry as any instanceof Date) &&
          (user.fastApiTokenExpiry as any).getTime() > nowMs + 60_000; // 1 min buffer

        let fetchedFastApiToken: string | null = null;
        if (!hasValidFastApiToken) {
          try {
            const fastApiUrl = process.env.NEXT_PUBLIC_PYTHON_URL;
            if (fastApiUrl) {
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
                signal: AbortSignal.timeout(3000),
              });

              if (fastApiResponse.ok) {
                const fastApiData = await fastApiResponse.json();
                fetchedFastApiToken = fastApiData?.token ?? null;
              }
            }
          } catch (error) {
            console.error('FastAPI token failed, continuing login...', error);
          }
        }

        // Build a single user update that includes optional profile updates,
        // optional FastAPI token update, and nested upsert of the Account row.
        const userUpdateData: any = {
          accounts: {
            upsert: {
              where: {
                provider_providerAccountId: {
                  provider: 'credentials',
                  providerAccountId: user.id.toString(),
                },
              },
              create: {
                type: 'credentials',
                provider: 'credentials',
                providerAccountId: user.id.toString(),
                access_token: accessToken,
                expires_at: accessExpires,
                refresh_token: refreshToken,
                refresh_expires_at: refreshExpires,
              },
              update: {
                type: 'credentials',
                access_token: accessToken,
                expires_at: accessExpires,
                refresh_token: refreshToken,
                refresh_expires_at: refreshExpires,
              },
            },
          },
        };

        if (credentials.firstName || credentials.lastName || credentials.phoneNumber) {
          userUpdateData.firstName = credentials.firstName || user.firstName;
          userUpdateData.lastName = credentials.lastName || user.lastName;
          userUpdateData.phoneNumber = credentials.phoneNumber || user.phoneNumber;
        }

        if (fetchedFastApiToken) {
          userUpdateData.fastApiToken = fetchedFastApiToken;
          userUpdateData.fastApiTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: userUpdateData,
        });

        const effectiveFastApiToken =
          fetchedFastApiToken || (hasValidFastApiToken ? (user.fastApiToken as any) : (updatedUser.fastApiToken as any)) || null;

        return {
          id: updatedUser.id.toString(),
          name: updatedUser.firstName,
          email: updatedUser.email,
          role: updatedUser.role,
          hrId: updatedUser.hrId,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          image: updatedUser.image,
          department: updatedUser.department,
          paid: updatedUser.paid,
          emailVerified: updatedUser.emailVerified,
          fastApiToken: effectiveFastApiToken,
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
        // Initial sign in - user data comes from authorize() already
        if (user && account?.provider === 'credentials') {
          // Set all token data from user object (already fetched in authorize)
          // This avoids extra DB calls
          token.refreshExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
          token.userId = user.id;
          token.role = user.role;
          token.hrId = user.hrId;
          token.firstName = user.firstName;
          token.lastName = user.lastName;
          token.image = user.image;
          token.department = user.department;
          token.emailVerified = user.emailVerified;
          token.paid = user.paid;
          token.fastApiToken = user.fastApiToken;
          token.lastFetch = Date.now();
          
          // Only fetch account for access token if needed
          try {
            const dbAccount = await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: 'credentials',
                  providerAccountId: user.id.toString(),
                },
              },
              select: { access_token: true, refresh_expires_at: true }, // Only select what we need
            });
            if (dbAccount) {
              token.accessToken = dbAccount.access_token;
              token.refreshExpiresAt = dbAccount.refresh_expires_at;
            }
          } catch (error: any) {
            console.error('Error fetching account:', error.message);
            // Continue without access token - not critical
          }
        }

        // Only refresh from DB if explicitly triggered or token is VERY stale (60+ min)
        // IMPORTANT: Skip if lastFetch is missing (old tokens) to prevent DB storm after restart
        if (!user && token.userId) {
          const sixtyMinutesInMs = 60 * 60 * 1000;
          const shouldRefresh = trigger === 'update' || 
                               (token.lastFetch && (Date.now() - token.lastFetch) > sixtyMinutesInMs);

          if (shouldRefresh) {
            try {
              const freshUser = await prisma.user.findUnique({
                where: { id: token.userId },
                select: { // Only select fields we need
                  emailVerified: true,
                  role: true,
                  department: true,
                  firstName: true,
                  lastName: true,
                  image: true,
                  paid: true,
                  fastApiToken: true,
                },
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
              // Don't throw - allow user to continue with stale data
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