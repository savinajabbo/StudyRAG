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

interface ChatViewProps {
    chatId: string | null;
}

export default function ChatView(props: ChatViewProps) {
    const { chatId } = props;
    const [messages, setMessages] = useState<Message[]>([]);
    const [localChatId, setLocalChatId] = useState<string | null>(null);
    const supabase = supabaseBrowser();

    // load existing messages
    useEffect(() => {
        const loadMessages = async () => {
            if (!chatId) return;
            const { data, error } = await supabase
            .from("messages")
            .select("id, role, content")
            .eq("chat_id", chatId)
            .order("created_at", { ascending: true });

            if (!error && data) {
                setMessages(data as Message[]);
                setLocalChatId(chatId);
            }
        }; 
        loadMessages();
    }, [chatId, supabase]);
    
    useEffect(() => {
        if (!localChatId) {
            const newId = uuidv4();
            setLocalChatId(newId);
        }
    }, [localChatId]);

    const saveMessage = async (role: "user" | "assistant", content: string) => {
        if (!localChatId) return;
        await supabase.from("messages").insert({
            chat_id: localChatId,
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

        if (!chatId && localChatId) {
            const { error } = await supabase.from("chats").insert({
                id: localChatId,
                title: text.slice(0, 60) || "new chat",
            });
            if (error) {
                console.error("supabase error while creating chat:", error);
                alert(`supabase error: ${error.message}`);
            }
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
            body: JSON.stringify({ query: text, chatId: localChatId, chatHistory: messages }),
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

        if (!chatId && localChatId) {
            const { data, error } = await supabase
                .from("chats")
                .upsert({
                id: localChatId,
                title: text.slice(0, 60) || "new chat",
                });

            if (error) {
                console.error("failed to create or upsert chat:", error.message);
            } else {
                console.log("chat created or updated:", localChatId);
                window.dispatchEvent(new CustomEvent("chatCreated", { detail: localChatId }));
            }
        }


    };

    return (
        <div className="flex flex-col h-full bg-transparent text-gray-200">
            <ChatMessages messages={messages} />
            <div className="sticky bottom-0 bg-[#0e0f12]/95 backdrop-blur-md border-gray-800 px-4 sm:px-8 py-3">
                <div className="flex justify-center">
                    <ChatInput onSend={handleSend} />
                </div>
            </div>
        </div>
    );
}