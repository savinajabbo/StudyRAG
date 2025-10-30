"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = supabaseBrowser();
            const { data } = await supabase.auth.getUser();

            if (!data.user) {
                router.push("/auth/login");
            }
            else {
                setUserEmail(data.user.email ?? null);
            }
        };

        fetchUser();
    }, [router]);

    const handleLogout = async () => {
        const supabase = supabaseBrowser();
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex felx-col">
            <nav className="w-full flex justify-between items-center px-8 py-4 border-b border-gray-800 bg-black/40 backdrop-blur-md">
                <h1 className="text-2xl font-bold tracking-tight">
                    <span className="text-sky-400">Study</span>RAG
                </h1>
                <div className="flex items-center gap-4">
                    {userEmail && (
                        <span className="text-gray-400 text-sm hidden sm:block">
                            {userEmail}
                        </span>
                    )}
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                    >
                        log out
                    </button>
                </div>
            </nav>

            <section className="flex-1 flex flex-col items-center justify-center justify-center px-6">
                <h2 className="text-3xl font-semibold mb-4"> welcome to your dashboard</h2>
                <p className="text-gray-400 text-center max-w-lg">
                    upload your notes, ask ai-powered questions, and get tailored study help — all in one place.
                </p>

                <div className="flex gal-4 mt-8">
                    <button className="px-6 py-3 bg-sky-500 hover:bg-sky-600 rounded-lg shadow transition">
                        upload notes
                    </button>
                    <button className="px-6 py-3 bg-sky-400 text-sky-400 hover:bg-sky-400 hover:text-black rounded-lg shadow transition">
                        ask a question
                    </button>
                </div>
            </section>
        </main>
    );
}