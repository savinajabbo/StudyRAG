"use client";

import React from "react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface ChatMessagesProps {
    messages: Message[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <h2 className="text-lg font-medium mb-2">welcome to study rag</h2>
                <p className="text-sm text-gray-400 text-center max-w-md">
                    upload your notes and ask questions
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className={`max-w-3xl mx-auto p-3 rounded-2xl ${
                    msg.role === "user" ? "bg-sky-600/20 text-sky-300 self-end" : "bg-gray-800/60 text-gray-100"
                }`}>
                    {msg.content}
                </div>
            ))}
        </div>
    );
}