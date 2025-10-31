/**
 * TO DO:
 * - take the query from user
 * - embed the query 
 * - feed into openai gpt
 * - generate answer using ONLY uploaded notes as the context
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
    try {
        // take da query
        const { query } = await req.json();
        if (!query) {
            return NextResponse.json({ error: "query required" }, { status: 400 });
        }

        // embed query
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
        });
        const queryEmbedding = embeddingResponse.data[0].embedding;

        const { data: matches, error } = await supabase.rpc("match_documents", {
            query_embedding: queryEmbedding,
            match_threshold: 0.1,
            match_count: 5,
        });
        if (error) throw error;

        const context = matches.map((m: any) => m.content).filter(Boolean).join("\n\n");

        // ask openai for answer
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful study assistant. Answer based only on the provided notes context. If the answer isn't in the notes, say 'I couldn't find that in your notes.'",
                },
            ],
        });

        const answer = completion.choices[0].message.content;
        return NextResponse.json({ answer, matches });
    } catch (error) {
        console.error("error in /api/answer: ", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}