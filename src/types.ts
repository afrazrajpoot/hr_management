import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      paid: boolean;
      hrId?: string | null;
      department?: string[];
      fastApiToken?: string;
    };
    accessToken?: string;
    error?: string;
  }

  interface User {
    id: string;
    name: string;
    role: string;
    paid: boolean;
  }
}