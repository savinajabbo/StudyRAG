"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const onLogin = async () => {
        setError("");
        const supabase = supabaseBrowser();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        else router.push("/dashboard");
    };

    return (
        <main className="max-w-sm mx-auto mt-20 space-y-4">
            <h1 className="text-2xl font-semibold">Login</h1>
            <input 
                className="border p-2 w-full"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                className="border p-2 w-full"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                className="bg-black text-white w-full py-2 rounded"
                onClick={onLogin}
            >
                log in
            </button>
            <p className="text-sm text-center">
                don't have an account? <a href="/auth/signup" className="text-blue-600">sign up</a>
            </p>
        </main>
    );
}