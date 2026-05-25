export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Workflow App</h1>
        <p className="text-gray-400">
          Press{" "}
          <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-600 text-sm">
            ⌘K
          </kbd>{" "}
          or{" "}
          <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-600 text-sm">
            Ctrl+K
          </kbd>{" "}
          to open the command palette
        </p>
      </div>
    </main>
  );
}
