"use client";

import { useState } from "react";
import { Upload, Send } from "lucide-react";

interface ChatInputProps {
    onSend: (message: string) => void;
    onUpload?: () => void;
}

export default function ChatInput({ onSend, onUpload }: ChatInputProps) {
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSend(message.trim());
        setMessage("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center bg-[#0e0f12] border border-gray-700 rounded-4xl shadow-lg px-4 py-2">
            <button type="button" onClick={onUpload} className="p-2 rounded-md hover:bg-gray-800 transition cursor-pointer" title="upload notes">
                <Upload className="w-5 h-5 text-sky-400" />
            </button>

            <input type="text" placeholder="ask anything" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
                className="flex-1 bg-transparent outline-none px-3 text-gray-200 placeholder-gray-500 text-sm"
            />
            <button type="submit" className="p-2 rounded-md bg-sky-500 hover:bg-sky-600 transition text-white cursor-pointer" title="Send">
                <Send className="w-5 h-5" />
            </button>
        </form>
    )
}