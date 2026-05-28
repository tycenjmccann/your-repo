"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "workflow:sidebar-collapsed";

export function useCollapsedState(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return [collapsed, toggle];
}
