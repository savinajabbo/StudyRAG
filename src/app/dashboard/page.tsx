"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, MessageSquare, Settings, Plus } from "lucide-react";
import ChatView from "@/components/ChatView";
import PreviousChats from "@/components/PreviousChats";

export default function DashboardPage() {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
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

    useEffect(() => {
        const handleChatCreated = (e: CustomEvent) => {
            if (activeChatId !== e.detail) {
            setActiveChatId(e.detail);
            }
        };

        window.addEventListener("chatCreated", handleChatCreated as EventListener);
        return () => window.removeEventListener("chatCreated", handleChatCreated as EventListener);
    }, [activeChatId]);


    const handleLogout = async () => {
        const supabase = supabaseBrowser();
        await supabase.auth.signOut();
        router.push("/auth/login");
    };
    
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex">
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-bold text-sky-400">Study<span className="text-white">RAG</span></h1>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    <PreviousChats 
                        onSelectChat={(id) => setActiveChatId(id)} 
                        onNewChat={() => {
                            const newId = crypto.randomUUID();
                            window.dispatchEvent(new CustomEvent("chatCreated", { detail: newId }));
                            setActiveChatId(newId);
                        }} 
                    />
                </div>

                <div className="border-t border-gray-800 p-6">
                    <p className="text-sm text-gray-400 mb-3 truncate">{userEmail}</p>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-200 transition-colors w-full justify-center cursor-pointer">
                        <LogOut className="w-4 h-4" />
                        log out
                    </button>
                </div>
            </aside>

            <section className="flex-1 flex flex-col items-center justify-center justify-center px-6 section-y-8 h-screen">
                <ChatView chatId={activeChatId} />
            </section>
        </main>
    );
}