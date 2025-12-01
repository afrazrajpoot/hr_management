import { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
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
          console.error('Missing credentials:', credentials);
          throw new Error('Missing credentials');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          console.error('Invalid email format:', credentials.email);
          throw new Error('Invalid credentials');
        }

        const validRoles = ['Employee', 'HR', 'Admin'];
        const role = credentials.role && validRoles.includes(credentials.role)
          ? credentials.role
          : 'Employee';

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const verificationToken = crypto.randomBytes(32).toString('hex');

          user = await prisma.user.create({
            data: {
              email: credentials.email,
              firstName: credentials.firstName || credentials.email.split('@')[0],
              lastName: credentials.lastName || '',
              phoneNumber: credentials.phoneNumber || '',
              password: hashedPassword,
              role,
              verificationToken,
            },
          });

          // Send verification email - simplified
          try {

            await sendVerificationEmail(user.email!, verificationToken);
          } catch (error) {
            console.error('Failed to send verification email:', error);
            // Don't throw error - user creation should still succeed
          }
        } else {
          if (!user.password) {
            console.error('User has no password set:', credentials.email);
            throw new Error('Invalid credentials');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.error('Invalid password for email:', credentials.email);
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

        const accessToken = jwt.sign(
          { userId: user.id, role: user.role },
          process.env.JWT_SECRET!,
          { expiresIn: '15m' }
        );

        const refreshToken = crypto.randomBytes(40).toString('base64url');
        const accessExpires = Math.floor(Date.now() / 1000 + 15 * 60);
        const refreshExpires = Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60);

        const account = await prisma.account.upsert({
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
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Remove all custom httpOptions - let NextAuth handle it
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
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
    async jwt({ token, user, account, profile, trigger, session }: any) {
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
          // Fetch fresh user data to get emailVerified status
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
        }
      }

      // Google sign in
      if (account?.provider === 'google' && profile) {
        let userInDb = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!userInDb) {
          const randomPassword = crypto.randomBytes(16).toString('hex');
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          userInDb = await prisma.user.create({
            data: {
              email: profile.email,
              firstName: profile.given_name || profile.name || profile.email.split('@')[0],
              lastName: profile.family_name || '',
              phoneNumber: '',
              password: hashedPassword,
              role: 'Employee',
              image: profile.picture,
              emailVerified: new Date(),
              paid: false,
            },
          });
        }

        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: 'google',
              providerAccountId: profile.sub,
            },
          },
          update: {
            type: 'oauth',
            userId: userInDb.id,
          },
          create: {
            userId: userInDb.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: profile.sub,
          },
        });

        token.userId = userInDb.id;
        token.firstName = userInDb.firstName;
        token.email = userInDb.email;
        token.picture = profile.picture;
        token.role = userInDb.role;
        token.department = userInDb.department;
        token.emailVerified = userInDb.emailVerified;
        token.paid = userInDb.paid;
      }

      // Subsequent calls - fetch fresh data if we have a userId
      if (!user && token.userId) {
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
          // Add other fields that might change and need to be reflected immediately
        }
      }

      // Handle session update triggers (e.g. from useSession().update())
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      return token;
    },

    async session({ session, token }: any) {
      session.refreshExpiresAt = token.refreshExpiresAt;
      session.user.id = token.userId;
      session.user.role = token.role;
      session.user.name = token.firstName || session.user.firstName;
      session.user.email = token.email || session.user.email;
      session.user.image = token.picture || token.image || session.user.image;
      session.user.hrId = token.hrId;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.department = token.department;
      session.user.emailVerified = token.emailVerified;
      session.user.paid = token.paid;
      session.accessToken = token.accessToken;

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

      if (token.userId && session.user.email && !token.picture) {
        const account = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: 'credentials',
              providerAccountId: token.userId.toString(),
            },
          },
        });

        if (!account) {
          session.error = 'NoAccount';
          return session;
        }

        if (Date.now() < (account.expires_at ?? 0) * 1000) {
          session.accessToken = account.access_token;
          return session;
        } else {
          if (!account.refresh_token || Date.now() > (account.refresh_expires_at ?? 0) * 1000) {
            session.error = 'RefreshTokenExpired';
            return session;
          }

          try {
            const newAccessToken = jwt.sign(
              { userId: token.userId, role: token.role },
              process.env.JWT_SECRET!,
              { expiresIn: '15m' }
            );
            const newAccessExpires = Math.floor(Date.now() / 1000 + 15 * 60);
            const newRefreshToken = crypto.randomBytes(40).toString('base64url');
            const newRefreshExpires = Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60);

            await prisma.account.update({
              where: { id: account.id },
              data: {
                access_token: newAccessToken,
                expires_at: newAccessExpires,
                refresh_token: newRefreshToken,
                refresh_expires_at: newRefreshExpires,
              },
            });

            session.accessToken = newAccessToken;
            session.refreshExpiresAt = newRefreshExpires;
            return session;
          } catch (error) {
            console.error('Error refreshing token:', error);
            session.error = 'RefreshError';
            return session;
          }
        }
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};