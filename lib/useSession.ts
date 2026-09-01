"use client";

import { useEffect, useState } from "react";
import type { SessionPayload } from "@/lib/auth";

/**
 * Client-side hook that fetches the current seller's session from
 * GET /api/auth/me. Returns null while loading or if unauthenticated.
 */
export function useSession(): SessionPayload | null {
  const [session, setSession] = useState<SessionPayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setSession(data?.session ?? null);
      })
      .catch(() => {
        if (!cancelled) setSession(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return session;
}
