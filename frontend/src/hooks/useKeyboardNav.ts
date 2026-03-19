"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Route = { key: string; href: string };

const ROUTES: Route[] = [
  { key: "d", href: "/dashboard" },
  { key: "b", href: "/boards" },
  { key: "a", href: "/activity" },
  { key: "p", href: "/projects" },
  { key: "v", href: "/virtual-office" },
  { key: "o", href: "/org-tree" },
  { key: "s", href: "/scheduled" },
];

export function useKeyboardNav() {
  const router = useRouter();

  useEffect(() => {
    let pendingG = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      if (
        e.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
      ) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      if (key === "g") {
        pendingG = true;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { pendingG = false; }, 1500);
        return;
      }

      if (pendingG) {
        pendingG = false;
        if (timer) clearTimeout(timer);
        const route = ROUTES.find((r) => r.key === key);
        if (route) {
          e.preventDefault();
          router.push(route.href);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);
}
