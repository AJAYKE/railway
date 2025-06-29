import { ConnectionStats } from "@/types/discord";
import { useCallback, useEffect, useState } from "react";

export function useConnectionStats() {
  const [connectionStats, setConnectionStats] =
    useState<ConnectionStats | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      const headers: Record<string, string> = {};

      if (apiKey) {
        headers["X-API-Key"] = apiKey;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`, {
        headers,
      });

      if (response.ok) {
        const stats = await response.json();
        setConnectionStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  useEffect(() => {
    const statsInterval = setInterval(fetchStats, 5000);
    fetchStats();

    return () => {
      clearInterval(statsInterval);
    };
  }, [fetchStats]);

  return { connectionStats, fetchStats };
}
