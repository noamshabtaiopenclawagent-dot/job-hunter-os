"use client";

import { ActivityToast } from "@/components/atoms/ActivityToast";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";

/**
 * Client-side shell that wraps keyboard navigation and toast notifications.
 * Registered in root layout.tsx so it applies to every page.
 */
export function ClientShell() {
  useKeyboardNav();
  return <ActivityToast />;
}
