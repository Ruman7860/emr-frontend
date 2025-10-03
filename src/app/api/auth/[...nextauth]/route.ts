import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log("credential", credentials);
        try {
          const { data } = await axios.post(`${process.env.BACKEND_URL}/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          console.log("Login response:", data);

          // ✅ your backend response shape is:
          // { success, statusCode, message, data: { access_token, user, tenant } }
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

          return null; // no user found
        } catch (error) {
          console.error("Authorize error:", error);
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

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.tenant = token.tenant;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
