// lib/token-refresh.ts
import { prisma } from "@/lib/db";

interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

/**
 * Refreshes the access token for a Gmail account using the refresh token
 */
export async function refreshGmailToken(emailAccountId: string): Promise<boolean> {
  try {
    const emailAccount = await prisma.emailAccount.findUnique({
      where: { id: emailAccountId },
    });

    if (!emailAccount?.refreshToken) {
      console.error("No refresh token available for email account:", emailAccountId);
      return false;
    }

    // Make request to Google's token endpoint
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: emailAccount.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to refresh token:", error);
      return false;
    }

    const tokens: RefreshTokenResponse = await response.json();

    // Update the email account with new access token
    await prisma.emailAccount.update({
      where: { id: emailAccountId },
      data: {
        accessToken: tokens.access_token,
        tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    console.log("✅ Access token refreshed successfully for:", emailAccount.email);
    return true;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
}

/**
 * Checks if a token is expired or about to expire (within 5 minutes)
 */
export function isTokenExpired(tokenExpiry: Date | null): boolean {
  if (!tokenExpiry) return true;
  
  const now = new Date();
  const expiryWithBuffer = new Date(tokenExpiry.getTime() - 5 * 60 * 1000); // 5 minutes buffer
  
  return now >= expiryWithBuffer;
}

/**
 * Gets a valid access token, refreshing if necessary
 */
export async function getValidAccessToken(emailAccountId: string): Promise<string | null> {
  const emailAccount = await prisma.emailAccount.findUnique({
    where: { id: emailAccountId },
  });

  if (!emailAccount) {
    return null;
  }

  // Check if token needs refresh
  if (isTokenExpired(emailAccount.tokenExpiry)) {
    console.log("Token expired, refreshing...");
    const refreshed = await refreshGmailToken(emailAccountId);
    
    if (!refreshed) {
      return null;
    }

    // Fetch updated token
    const updatedAccount = await prisma.emailAccount.findUnique({
      where: { id: emailAccountId },
    });

    return updatedAccount?.accessToken || null;
  }

  return emailAccount.accessToken;
}