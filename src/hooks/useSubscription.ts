import { useCallback, useEffect, useState } from "react";
import { getSubscription } from "../features/shops/api";
import type { SubscriptionInfo } from "../types/index";

const CACHE_TTL_MS = 60_000;

interface CacheEntry {
  key: string;
  data: SubscriptionInfo;
  fetchedAt: number;
}

let cachedEntry: CacheEntry | null = null;
let inflightRequest: { key: string; promise: Promise<SubscriptionInfo> } | null =
  null;

function getCacheKey(): string {
  const token = localStorage.getItem("token") ?? "";
  const shopId = localStorage.getItem("activeShopId") ?? "";
  return `${shopId}:${token.slice(-16)}`;
}

export function invalidateSubscriptionCache() {
  cachedEntry = null;
  inflightRequest = null;
}

async function fetchSubscriptionCached(
  force = false,
): Promise<SubscriptionInfo> {
  const key = getCacheKey();
  const now = Date.now();

  if (
    !force &&
    cachedEntry &&
    cachedEntry.key === key &&
    now - cachedEntry.fetchedAt < CACHE_TTL_MS
  ) {
    return cachedEntry.data;
  }

  if (!force && inflightRequest && inflightRequest.key === key) {
    return inflightRequest.promise;
  }

  const promise = getSubscription()
    .then((data) => {
      cachedEntry = { key, data, fetchedAt: Date.now() };
      return data;
    })
    .finally(() => {
      if (inflightRequest?.key === key) {
        inflightRequest = null;
      }
    });

  inflightRequest = { key, promise };
  return promise;
}

export function useSubscription(enabled = true) {
  const [subscription, setSubscription] = useState<
    SubscriptionInfo | undefined
  >(() => {
    if (!enabled) return undefined;
    const key = getCacheKey();
    if (
      cachedEntry &&
      cachedEntry.key === key &&
      Date.now() - cachedEntry.fetchedAt < CACHE_TTL_MS
    ) {
      return cachedEntry.data;
    }
    return undefined;
  });
  const [loading, setLoading] = useState<boolean>(
    enabled && subscription === undefined,
  );

  const refresh = useCallback(async () => {
    if (!enabled) return undefined;
    setLoading(true);
    try {
      const data = await fetchSubscriptionCached(true);
      setSubscription(data);
      return data;
    } catch {
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading((prev) => (subscription ? prev : true));
    fetchSubscriptionCached(false)
      .then((data) => {
        if (!cancelled) setSubscription(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { subscription, loading, refresh };
}
