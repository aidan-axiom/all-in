"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { LiveScoresResponse } from "@/lib/scores";

const POLL_INTERVAL = 30_000; // 30 seconds

interface UseScoresOptions {
  limit?: number;
  enabled?: boolean;
}

export function useScores(options: UseScoresOptions = {}) {
  const { limit, enabled = true } = options;
  const [data, setData] = useState<LiveScoresResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch("/api/scores");
      if (!res.ok) throw new Error("Failed to fetch scores");
      const json: LiveScoresResponse = await res.json();

      if (limit && json.games.length > limit) {
        json.games = json.games.slice(0, limit);
      }

      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (!enabled) return;

    fetchScores();
    intervalRef.current = setInterval(fetchScores, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchScores, enabled]);

  // Pause polling when tab is hidden
  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        fetchScores();
        intervalRef.current = setInterval(fetchScores, POLL_INTERVAL);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchScores, enabled]);

  return { data, isLoading, error, refetch: fetchScores };
}
