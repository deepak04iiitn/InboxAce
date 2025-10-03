import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { AdapterUser } from "next-auth/adapters";
import { prisma } from "@/lib/db";

// Override PrismaAdapter
const customAdapter = PrismaAdapter(prisma as any);

customAdapter.createUser = async (data: AdapterUser) => {
  // Map 'image' → 'profileImage'
  const { image, ...rest } = data as any;
  return prisma.user.create({
    data: {
      ...rest,
      profileImage: image ?? undefined,
    },
  });
};

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "openid email profile https://mail.google.com/" } },
    }),
  ],
  adapter: customAdapter,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "NORMAL";
        token.pricingTier = user.pricingTier ?? "FREE";
        token.profileImage = user.profileImage ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.pricingTier = token.pricingTier as string;
        session.user.profileImage = token.profileImage as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
