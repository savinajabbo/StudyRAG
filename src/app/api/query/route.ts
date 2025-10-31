/**
 * TO DO:
 * - accept a user question
 * - generate an embedding for that question
 * - query supabase docs table
 * - return top matching content chunks to the app so it can feed to openai
 * 
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
        const { query } = await req.json();

        if (!query || query.trim() === "") {
            return NextResponse.json({ error: "query required" }, { status: 400 });
        }

        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: query,
        });
        const queryEmbedding = embeddingResponse.data[0].embedding;

        const { data, error } = await supabase.rpc("match_documents", {
            query_embedding: queryEmbedding,
            match_threshold: 0.2,
            match_count: 8,
        });

        if (error) throw error;

        return NextResponse.json({ matches: data });
    } catch (error) {
        console.error("error in /api/query:", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}