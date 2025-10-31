"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Send } from "lucide-react";

interface ChatInputProps {
    onSend: (message: string) => void;
    onUpload?: () => void;
}

export default function ChatInput({ onSend, onUpload }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSend(message.trim());
        setMessage("");
    };
    
    const handleFileUpload = async() => {
        const input = document.createElement("input");
        input.type = "file",
        input.accept = ".pdf,.docx,.txt,.md,.csv";
        input.onchange = async (event: any) => {
            const file = event.target.files?.[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append("file", file);

            await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
        };
        input.click();
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "0px";
        const scrollHeight = textarea.scrollHeight;

        const maxHeight = 96;
        textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;

        textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";

    }, [message]);

    return (
        <form onSubmit={handleSubmit} className="flex items-center bg-[#0e0f12] border border-gray-700 rounded-4xl shadow-lg px-4 py-2">
            <button type="button" onClick={handleFileUpload} className="p-2 rounded-md hover:bg-gray-800 transition cursor-pointer" title="upload notes">
                <Upload className="w-5 h-5 text-sky-400" />
            </button>

            <textarea ref={textareaRef} placeholder="ask anything" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
                className="flex-1 bg-transparent outline-none px-3 text-gray-200 placeholder-gray-500 text-sm resize-none overflow-hidden leading-tight align-middle h-[1.6rem] py-0 max-h-24 scrollbar-thin scrollbar-thumb-sky-500 scrollbar-track-transparent"
            />
            <button type="submit" className="p-2 rounded-md bg-sky-500 hover:bg-sky-600 transition text-white cursor-pointer" title="Send">
                <Send className="w-5 h-5" />
            </button>
        </form>
    );
}