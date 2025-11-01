"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/app/lib/supabase/client";
import { Loader2, PlusCircle, MessageSquare } from "lucide-react";

interface Chat {
    id: string;
    title: string;
    created_at: string;
}

interface PreviousChatsProps {
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
}

export default function PreviousChats({ onSelectChat, onNewChat }: PreviousChatsProps) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChats = async () => {
        setLoading(true);
        const supabase = supabaseBrowser();
        const { data, error } = await supabase.from("chats").select("id, title, created_at").order("created_at", { ascending: false });

        if (!error && data) setChats(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchChats();

        const handleChatCreated = () => fetchChats();
        
        window.addEventListener("chatCreated", handleChatCreated);
        return () => window.removeEventListener("chatCreated", handleChatCreated);

    }, []);

    return (
        <div className="flex flex-col h-full text-gray-300">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                    previous chats
                </h2>
                <button onClick={onNewChat} className="text-sky-400 hover:text-sky-300 transition flex items-center gap-1">
                    <PlusCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">New</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
                {loading ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    </div>
                ) : chats.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">no chats yet</p>
                ) : (
                    chats.map((chat) => (
                        <button key={chat.id} onClick={() => onSelectChat(chat.id)} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left hover:bg-gray-800 transition">
                            <MessageSquare className="w-4 h-4 text-sky-400 flex-shrink-0" />
                            <span className="truncate text-sm">{chat.title || "untitled chat"}</span>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}