"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Command,
  CommandCategory,
  createDefaultCommands,
  getPlatformShortcut,
} from "@/lib/commands";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// --- localStorage helpers ---
const RECENTS_KEY = "command-palette-recents";
const MAX_RECENTS = 5;

function getRecents(): string[] {
  try {
    const stored = localStorage.getItem(RECENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // localStorage unavailable or corrupted
  }
  return [];
}

function saveRecent(commandId: string): void {
  try {
    const recents = getRecents();
    const updated = [
      commandId,
      ...recents.filter((id) => id !== commandId),
    ].slice(0, MAX_RECENTS);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable
  }
}

// --- Context ---
interface CommandPaletteContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  commands: Command[];
}

const CommandPaletteContext =
  createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error(
      "useCommandPalette must be used within a CommandPaletteProvider"
    );
  }
  return context;
}

// --- Provider ---
export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const commands = useMemo(
    () =>
      createDefaultCommands({
        togglePalette: toggle,
        newWorkflow: () => {
          console.log("[CommandPalette] New Workflow triggered");
          window.dispatchEvent(new CustomEvent("command:new-workflow"));
        },
        toggleSidebar: () => {
          console.log("[CommandPalette] Toggle Sidebar triggered");
          window.dispatchEvent(new CustomEvent("command:toggle-sidebar"));
        },
        closePalette: close,
      }),
    [toggle, close]
  );

  useKeyboardShortcuts({ commands });

  const contextValue = useMemo(
    () => ({ isOpen, open, close, toggle, commands }),
    [isOpen, open, close, toggle, commands]
  );

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      {isMounted && isOpen && (
        <CommandPaletteModal commands={commands} onClose={close} />
      )}
    </CommandPaletteContext.Provider>
  );
}

// --- Modal Component ---
interface CommandPaletteModalProps {
  commands: Command[];
  onClose: () => void;
}

function CommandPaletteModal({ commands, onClose }: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [platformShortcuts, setPlatformShortcuts] = useState<
    Record<string, string>
  >({});
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Load recents and platform shortcuts on mount (client-side only)
  useEffect(() => {
    setRecentIds(getRecents());
    const shortcuts: Record<string, string> = {};
    commands.forEach((cmd) => {
      shortcuts[cmd.id] = getPlatformShortcut(cmd.keybinding);
    });
    setPlatformShortcuts(shortcuts);
  }, [commands]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Focus trap
  useEffect(() => {
    const handleTab = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, []);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim())
      return commands.filter((c) => c.id !== "close-palette");
    return commands.filter(
      (c) =>
        c.id !== "close-palette" &&
        c.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [commands, query]);

  // Build display list: recents first (when no query), then grouped by category
  const displayItems = useMemo(() => {
    const items: { command: Command; section: string }[] = [];

    if (!query.trim()) {
      const recentCommands = recentIds
        .map((id) => filteredCommands.find((c) => c.id === id))
        .filter(Boolean) as Command[];

      recentCommands.forEach((cmd) => {
        items.push({ command: cmd, section: "Recent" });
      });
    }

    const categories: CommandCategory[] = ["Navigation", "Actions", "View"];
    for (const category of categories) {
      const categoryCommands = filteredCommands.filter(
        (c) => c.category === category
      );
      categoryCommands.forEach((cmd) => {
        if (
          !query.trim() &&
          recentIds.includes(cmd.id) &&
          items.find((i) => i.command.id === cmd.id)
        ) {
          return;
        }
        items.push({ command: cmd, section: category });
      });
    }

    return items;
  }, [filteredCommands, recentIds, query]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Execute command
  const executeCommand = useCallback(
    (command: Command) => {
      saveRecent(command.id);
      onClose();
      setTimeout(() => command.action(), 0);
    },
    [onClose]
  );

  // Keyboard navigation within palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          Math.min(prev + 1, displayItems.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (displayItems[activeIndex]) {
          executeCommand(displayItems[activeIndex].command);
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(
      `[data-index="${activeIndex}"]`
    );
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Click overlay to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Highlight matched text
  const highlightMatch = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>;

    const lowerText = text.toLowerCase();
    const lowerSearch = search.toLowerCase();
    const index = lowerText.indexOf(lowerSearch);

    if (index === -1) return <span>{text}</span>;

    return (
      <span>
        {text.slice(0, index)}
        <mark className="bg-yellow-300/30 text-inherit rounded-sm px-0.5">
          {text.slice(index, index + search.length)}
        </mark>
        {text.slice(index + search.length)}
      </span>
    );
  };

  let lastSection = "";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-label="Command palette"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
          <svg
            className="w-5 h-5 text-gray-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-sm"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search commands"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-gray-400 bg-gray-800 rounded border border-gray-600">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[300px] overflow-y-auto py-2"
          role="listbox"
          aria-label="Command results"
        >
          {displayItems.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No commands found
            </div>
          )}
          {displayItems.map((item, index) => {
            const showSectionHeader = item.section !== lastSection;
            lastSection = item.section;

            return (
              <React.Fragment key={item.command.id + "-" + item.section}>
                {showSectionHeader && (
                  <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {item.section}
                  </div>
                )}
                <div
                  data-index={index}
                  className={`flex items-center justify-between px-4 py-2 mx-2 rounded-lg cursor-pointer transition-colors ${
                    index === activeIndex
                      ? "bg-gray-700/80 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => executeCommand(item.command)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="text-sm">
                    {highlightMatch(item.command.name, query)}
                  </span>
                  <kbd className="ml-3 shrink-0 inline-flex items-center px-2 py-0.5 text-xs text-gray-400 bg-gray-800 rounded border border-gray-600">
                    {platformShortcuts[item.command.id] ||
                      item.command.shortcut}
                  </kbd>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-700 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-600">
              ↑↓
            </kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-600">
              ↵
            </kbd>
            Execute
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-600">
              Esc
            </kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
