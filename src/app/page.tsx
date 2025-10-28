import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold trackng-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-300">
          Study<span className="text-white">RAG</span>
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          upload your notes, ask questions, and study smarter — powered by ai
        </p>

        <div className="flex justify-center space-x-4 pt-4">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transtion"
          >
            log in
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-3 border border-sky-400 text-sky-400 hover:bg-sky-400 hover:text-black rounded-xl font-semibold transition"
          >
            sign up
          </Link>
        </div>
      </div>
    </main>
  );
}