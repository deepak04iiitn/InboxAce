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
      authorization: { 
        params: { 
          scope: "openid email profile https://mail.google.com/",
          access_type: "offline",
          prompt: "consent"
        } 
      },
    }),
  ],
  adapter: customAdapter,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      // Create EmailAccount when user signs in with Google
      if (account?.provider === "google" && user?.email) {
        try {
          // Check if EmailAccount already exists
          const existingEmailAccount = await prisma.emailAccount.findFirst({
            where: {
              userId: user.id,
              email: user.email,
            },
          });

          if (!existingEmailAccount) {
            // Calculate token expiry
            const expiryDate = account.expires_at 
              ? new Date(account.expires_at * 1000)
              : new Date(Date.now() + 3600 * 1000);

            // Create EmailAccount with OAuth tokens
            await prisma.emailAccount.create({
              data: {
                userId: user.id,
                email: user.email,
                provider: "GMAIL",
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                tokenExpiry: expiryDate,
                isPrimary: true,
                isActive: true,
                dailyLimit: 50,
                sentToday: 0,
                lastResetDate: new Date(),
              },
            });

            console.log(`✅ EmailAccount created for user: ${user.email}`);
          } else {
            // Update existing EmailAccount with new tokens
            await prisma.emailAccount.update({
              where: { id: existingEmailAccount.id },
              data: {
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                tokenExpiry: account.expires_at 
                  ? new Date(account.expires_at * 1000)
                  : new Date(Date.now() + 3600 * 1000),
                isActive: true,
              },
            });

            console.log(`✅ EmailAccount updated for user: ${user.email}`);
          }
        } catch (error) {
          console.error("❌ Failed to create/update EmailAccount:", error);
          // Don't block sign-in, but log the error
        }
      }
      
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "NORMAL";
        token.pricingTier = user.pricingTier ?? "FREE";
        token.profileImage = user.profileImage ?? undefined;
        token.lastLoginAt = user.lastLoginAt;
      }

      // Store OAuth tokens in JWT for later use
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.pricingTier = token.pricingTier;
        session.user.profileImage = token.profileImage;
        session.user.lastLoginAt = token.lastLoginAt;
        
        // Add tokens to session for API routes to access
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.expiresAt = token.expiresAt;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };