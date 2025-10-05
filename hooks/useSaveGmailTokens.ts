// hooks/useSaveGmailTokens.ts

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export function useSaveGmailTokens() {
  const { data: session, status } = useSession();
  const hasSavedTokens = useRef(false);

  useEffect(() => {
    const saveTokens = async () => {
      if (hasSavedTokens.current) return;
      if (status !== "authenticated" || !session) return;
      if (!session.accessToken) return;

      try {
        const response = await fetch("/api/auth/save-gmail-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            expiresAt: session.expiresAt,
          }),
        });

        if (response.ok) {
          console.log("✅ Gmail tokens saved successfully");
          hasSavedTokens.current = true;
        }
      } catch (error) {
        console.error("❌ Error saving Gmail tokens:", error);
      }
    };

    saveTokens();
  }, [session, status]);
}