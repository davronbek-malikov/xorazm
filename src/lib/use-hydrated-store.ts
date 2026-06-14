"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "./store";

export function useHydratedStore(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useAppStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  return hydrated;
}
