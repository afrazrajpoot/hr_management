import { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

// Force IPv4 and robust connection settings
const createHttpsAgent = () => {
  const https = require('https');
  return new https.Agent({
    family: 4, // IPv4 only
    timeout: 45000, // 45 seconds
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: 50,
    maxFreeSockets: 10,
    scheduling: 'fifo',
  });
};

// Override DNS to always prefer IPv4
const dns = require('dns');
const originalLookup = dns.lookup;
dns.lookup = function (hostname: string, options: any, callback?: any) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = { ...options, family: 4, all: false };
  return originalLookup.call(this, hostname, options, callback);
};


export const authOptions: any = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
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
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || credentials.email.split('@')[0],
              password: hashedPassword,
              role,
            },
          });
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
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 45000,
        family: 4,
        agent: createHttpsAgent(),
      },
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          state: crypto.randomBytes(16).toString('hex'),
        },
      },
      token: 'https://oauth2.googleapis.com/token',
      userinfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
    } as any),
  ],
  pages: {
    signIn: '/auth/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account, profile }: any) {
      // Add network status logging
 

      // Credentials users
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
          token.refreshExpiresAt = dbAccount.refresh_expires_at;
          token.userId = user.id;
          token.role = user.role;
          token.accessToken = dbAccount.access_token;
        }
      }

      // Google users
      if (account?.provider === 'google' && profile) {
    

        let userInDb = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!userInDb) {
          // Generate a random password for Google OAuth users
          const randomPassword = crypto.randomBytes(16).toString('hex');
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          userInDb = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name || profile.email.split('@')[0],
              password: hashedPassword,
              role: 'Employee', // Statically set role to Employee
              image: profile.picture,
              emailVerified: null,
            },
          });
        } else {
          // Ensure the user's role is Employee for Google OAuth
          if (userInDb.role !== 'Employee') {
            userInDb = await prisma.user.update({
              where: { id: userInDb.id },
              data: { role: 'Employee' },
            });
          }
        }

        // Use upsert to avoid duplicate Account entries
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
        token.name = userInDb.name;
        token.email = userInDb.email;
        token.picture = profile.picture;
        token.role = userInDb.role;
      }

      return token;
    },

    async session({ session, token }: any) {
      session.refreshExpiresAt = token.refreshExpiresAt;
      session.user.id = token.userId;
      session.user.role = token.role;
      session.user.name = token.name || session.user.name;
      session.user.email = token.email || session.user.email;
      session.user.image = token.picture || session.user.image;
      session.accessToken = token.accessToken;

      // Set redirectTo based on user role
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
          session.redirectTo = '/auth/sign-in'; // Fallback for undefined roles
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