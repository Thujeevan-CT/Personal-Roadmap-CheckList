import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email || !account) {
        return false;
      }
      await connectDB();
      const existing = await User.findOne({ googleId: account.providerAccountId });
      if (!existing) {
        await User.create({
          email: user.email,
          name: user.name ?? user.email,
          image: user.image ?? undefined,
          googleId: account.providerAccountId,
        });
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile?.sub) {
        await connectDB();
        const dbUser = await User.findOne({
          googleId: account.providerAccountId,
        });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.email = dbUser.email;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.AUTH_SECRET,
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    name?: string;
  }
}
