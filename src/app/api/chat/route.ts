/**
 * TO DO:
 * - get user query from chat input
 * - create embedding for the query
 * - get top match from supabase
 * - combine chunks in a context string for gpt
 * - get gpt's response token by token
 * - return as an SSE stream (research this) that the frontend can listen to live
 */

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const runtime = "nodejs";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
    try {
        const { query, chatHistory = [] } = await req.json();
        if (!query) {
            return new Response("query required", { status: 400 });
        }

        // embedding for query
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
        });

        const queryEmbedding = embeddingResponse.data[0].embedding;

        // supabase matching
        const { data: matches, error } = await supabase.rpc("match_documents", {
            query_embedding: queryEmbedding,
            match_threshold: 0.15,
            match_count: 5,
        });
        if (error) throw error;

        // make context for gpt
        const context = matches?.map((m: any) => m.content).filter(Boolean).join("\n\n") || "no relevant context found";

        const systemPrompt = `
            You are StudyRAG, a friendly and smart AI study assistant. When possible, base your answers strictly on the student's uploaded notes (context provided below). If the notes don't contain the answer, use your general reasoning ability to respond helpfully and conversationally. Stay factual, concise, and supportive. Imagine you'e a study buddy.
            Context from notes: 
            ${context}`.trim();
        
        const recentMessages = chatHistory.slice(-6).map((m: any) => ({
            role: m.role,
            content: m.content,
        }));

        // gpt's response
        const stream = await openai.chat.completions.stream({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...recentMessages,
                { role: "user", content: query },
            ],
            stream: true,
        });

        // stream back to client
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices?.[0]?.delta?.content || "";
                    controller.enqueue(encoder.encode(content));
                }
                controller.close();
            },
        });
        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("error in /api/chat: ", error);
        return new Response("error: " + (error as Error).message, { status: 500 });
    }
}