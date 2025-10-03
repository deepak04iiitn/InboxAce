import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Extend the built-in User type
declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string;
    pricingTier?: string;
    lastLoginAt?: Date;
    profileImage?: string; // ✅ add this
  }

  interface Session {
    user: {
      id: string;
      role?: string;
      pricingTier?: string;
      lastLoginAt?: Date;
      profileImage?: string; // ✅ add this
    } & DefaultSession["user"];
  }
}

// Extend JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    pricingTier?: string;
    lastLoginAt?: Date;
    profileImage?: string; // ✅ add this
  }
}
