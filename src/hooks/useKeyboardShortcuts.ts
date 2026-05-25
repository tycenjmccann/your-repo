"use client";

import { useEffect, useCallback } from "react";
import { Command } from "@/lib/commands";

interface UseKeyboardShortcutsOptions {
  commands: Command[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  commands,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const command of commands) {
        const { keybinding } = command;

        const isEscapeBinding =
          keybinding.length === 1 && keybinding[0] === "escape";
        const isMetaK =
          keybinding.includes("meta") && keybinding.includes("k");

        // Skip shortcut processing for input-focused elements (except Esc and Cmd+K)
        if (isInputFocused && !isEscapeBinding && !isMetaK) {
          continue;
        }

        const matches = matchKeybinding(event, keybinding);

        if (matches) {
          event.preventDefault();
          event.stopPropagation();
          command.action();
          return;
        }
      }
    },
    [commands, enabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

function matchKeybinding(event: KeyboardEvent, keybinding: string[]): boolean {
  const requiresMeta = keybinding.includes("meta");
  const requiresShift = keybinding.includes("shift");
  const requiresAlt = keybinding.includes("alt");

  // Cross-platform: metaKey on Mac, ctrlKey on Win/Linux
  const metaPressed = event.metaKey || event.ctrlKey;

  if (requiresMeta && !metaPressed) return false;
  if (!requiresMeta && (event.metaKey || event.ctrlKey)) return false;
  if (requiresShift && !event.shiftKey) return false;
  if (requiresAlt && !event.altKey) return false;

  // Get the actual key from the binding (non-modifier keys)
  const keyPart = keybinding.find(
    (k) => k !== "meta" && k !== "shift" && k !== "alt"
  );

  if (!keyPart) return false;

  if (keyPart === "escape") {
    return event.key === "Escape";
  }

  return event.key.toLowerCase() === keyPart.toLowerCase();
}
