"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Send, FileText } from "lucide-react";

interface ChatInputProps {
    onSend: (message: string) => void;
    onUpload?: () => void;
}

export default function ChatInput({ onSend, onUpload }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (uploadedFile) {
            onSend(`uploaded file: ${uploadedFile.name}`);
            setUploadedFile(null);
        }

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

            setUploadedFile(file);
            
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
        const maxHeight = 120;
        textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }, [message, uploadedFile]);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col bg-[#0e0f12] border border-gray-700 rounded-4xl shadow-lg px-4 py-2 w-full max-w-2xl">

            {uploadedFile && (
                <div className="flex justify-start w-full mb-2 pl-1">
                    <div className="flex items-center bg-gray-800/70 rounded-2xl px-3 py-1.5 text-gray-300 text-sm shadow-md max-w-fit">
                        <FileText className="w-4 h-4 text-sky-400 mr-2" />
                        <span className="truncate max-w-[160px]">{uploadedFile.name}</span>
                        <button type="button" onClick={() => setUploadedFile(null)} className="ml-1 text-gray-400 hover:text-red-400 text-xs cursor-pointer" title="remove">
                            x
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-end w-full space-x-2">
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
            </div>
        </form>
    );
}