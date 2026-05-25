import type { Metadata } from "next";
import { CommandPaletteProvider } from "@/components/ui/CommandPalette";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workflow App",
  description: "Workflow management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CommandPaletteProvider>
          {children}
        </CommandPaletteProvider>
      </body>
    </html>
  );
}
