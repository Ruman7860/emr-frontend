import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import axios from 'axios';

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
          const { data } = await axios.post(`${process.env.BACKEND_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          console.log("Login response:", data);

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
        } catch (error: any) {
          console.error("Authorize error:", error?.response?.data || error.message);
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
