import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Extend the built-in User type
declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string;
    pricingTier?: string;
    lastLoginAt?: Date;
    profileImage?: string;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      pricingTier?: string;
      lastLoginAt?: Date;
      profileImage?: string;
    } & DefaultSession["user"];
    // Add token fields to session
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

// Extend JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    pricingTier?: string;
    lastLoginAt?: Date;
    profileImage?: string;
    // Add token fields to JWT
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}