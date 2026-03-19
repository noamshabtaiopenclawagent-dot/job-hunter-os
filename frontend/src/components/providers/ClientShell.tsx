"use client";

import { useState } from "react";
import { ActivityToast } from "@/components/atoms/ActivityToast";
import { CommandPalette } from "@/components/organisms/CommandPalette";
import { QuickTaskModal } from "@/components/organisms/QuickTaskModal";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";

/**
 * Client-side shell: keyboard navigation, activity toasts, and Cmd+K palette.
 * Registered in root layout.tsx so it applies to every page.
 */
export function ClientShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);

  // keyboard shortcuts (G+D, G+B, …) + Cmd+K + N
  useKeyboardNav({
    onCmdK: () => setPaletteOpen(true),
    onQuickTask: () => setQuickTaskOpen(true),
  });

  return (
    <>
      <ActivityToast />
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      <QuickTaskModal isOpen={quickTaskOpen} onClose={() => setQuickTaskOpen(false)} />
    </>
  );
}
