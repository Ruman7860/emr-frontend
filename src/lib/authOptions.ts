import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const response = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          const data = await response.json();

          if (!response.ok) {
            console.error("Authorize error:", data);
            return null;
          }

          const user = data.data?.user;
          const accessToken = data.data?.access_token;
          const tenant = data.data?.tenant;

          if (user && accessToken) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              tenant,
              accessToken,
            };
          }

          return null;
        } catch (error: unknown) {
          console.error(
            "Authorize error:",
            error instanceof Error ? error.message : error,
          );
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
        token.tenant = user.tenant;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }:any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.tenant = token.tenant;
      }
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
};
