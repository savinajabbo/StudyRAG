"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/app/lib/supabase/client";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function ChatView() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatId, setChatId] = useState<string | null>(null);
    const supabase = supabaseBrowser();

    // create new chat record
    useEffect(() => {
        if (!chatId) {
            const newId = uuidv4();
            setChatId(newId);
        }
    }, [chatId]);

    const saveMessage = async (role: "user" | "assistant", content: string) => {
        const supabase = supabaseBrowser();
        if (!chatId) return;

        await supabase.from("messages").insert({
            chat_id: chatId,
            role,
            content,
        });
    };

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: uuidv4(),
            role: "user",
            content: text,
        };
        setMessages((prev) => [...prev, userMessage]);

        if (!chatId) {
            const newId = uuidv4();
            setChatId(newId);

            const { error } = await supabase.from("chats").insert({
                id: newId,
                title: text.slice(0, 60),
            });
            if (error) console.error(error);
        }

        await saveMessage("user", text);

        // temporary assistant message
        const assistantMsg: Message = {
            id: uuidv4(),
            role: "assistant",
            content: "",
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // stream response
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: text, chatHistory: messages }),
        });

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let result = "";

        while (reader) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            result += chunk;

            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: result,
                };
                return updated;
            });
        }

        await saveMessage("assistant", result);
    };

    return (
        <div className="flex flex-col h-screen bg-[#0e0f12] text-gray-200">
            <ChatMessages messages={messages} />
            <div className="sticky bottom-0 bg-[#0e0f12]/95 backdrop-blur-md border-gray-800 px-4 sm:px-8 py-3">
                <div className="flex justify-center">
                    <ChatInput onSend={handleSend} />
                </div>
            </div>
        </div>
    );
}