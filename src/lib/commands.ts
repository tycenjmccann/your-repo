export type CommandCategory = "Navigation" | "Actions" | "View";

export interface Command {
  id: string;
  name: string;
  shortcut: string;
  keybinding: string[];
  action: () => void;
  category: CommandCategory;
}

export function createDefaultCommands(actions: {
  togglePalette: () => void;
  newWorkflow: () => void;
  toggleSidebar: () => void;
  closePalette: () => void;
}): Command[] {
  return [
    {
      id: "toggle-command-palette",
      name: "Toggle Command Palette",
      shortcut: "⌘K",
      keybinding: ["meta", "k"],
      action: actions.togglePalette,
      category: "Navigation",
    },
    {
      id: "new-workflow",
      name: "New Workflow",
      shortcut: "⌘N",
      keybinding: ["meta", "n"],
      action: actions.newWorkflow,
      category: "Actions",
    },
    {
      id: "toggle-sidebar",
      name: "Toggle Sidebar",
      shortcut: "⌘/",
      keybinding: ["meta", "/"],
      action: actions.toggleSidebar,
      category: "View",
    },
    {
      id: "close-palette",
      name: "Close / Cancel",
      shortcut: "Esc",
      keybinding: ["escape"],
      action: actions.closePalette,
      category: "Navigation",
    },
  ];
}

export function getPlatformShortcut(keybinding: string[]): string {
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  return keybinding
    .map((key) => {
      if (key === "meta") return isMac ? "⌘" : "Ctrl+";
      if (key === "shift") return isMac ? "⇧" : "Shift+";
      if (key === "alt") return isMac ? "⌥" : "Alt+";
      if (key === "escape") return "Esc";
      return key.toUpperCase();
    })
    .join("");
}
