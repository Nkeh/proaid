"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

/** Kicks off localStorage rehydration on mount (persist uses skipHydration to avoid SSR access to localStorage). */
export function StoreHydration() {
  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => {
      useAppStore.getState().setHasHydrated(true);
    });
    useAppStore.persist.rehydrate();
    return unsub;
  }, []);

  return null;
}
