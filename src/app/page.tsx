import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Workflow App</h1>
        <p className="mt-4 text-gray-600">Manage your workflows efficiently.</p>
        <Link
          href="/workflow"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go to Workflow Board
        </Link>
      </div>
    </main>
  );
}
