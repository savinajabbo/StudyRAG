export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import mammoth from "mammoth";
import PDFParser from "pdf2json";
import fs from "fs/promises";
import path from "path";
import os from "os";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "no file uploaded"}, {status: 400});
    }

    // save the file temporarily
    const tempDir = path.join(os.tmpdir(), file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(tempDir, buffer);

    // then parse the text
    let text = "";
    const ext = path.extname(file.name).toLowerCase();

    try {
        if (ext === ".pdf") {
            const pdfParser = new PDFParser();

            text = await new Promise<string>((resolve, reject) => {
                pdfParser.on("pdfParser_dataError", (errData: any) => {
                    reject(errData.parserError);
                });
                pdfParser.on("pdfParser_dataReady", () => {
                    const parsed = pdfParser.getRawTextContent();
                    resolve(parsed);
                });
                pdfParser.parseBuffer(buffer);
            });
        } else if (ext === ".docx") {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if ([".txt", ".md", ".csv"].includes(ext)) {
            text = buffer.toString("utf-8");
        } else {
            throw new Error("unsupported file type");
        }
    } catch (error) {
        return NextResponse.json(
            { error: "error parsing file", details: (error as Error).message },
            { status: 500 }
        );
    }

    try {
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text.slice(0, 20000),
        });

        const embedding = embeddingResponse.data[0].embedding;

        const { data, error } = await supabase.from("documents").insert([
            {
                title: file.name,
                content: text,
                embedding,
                created_at: new Date(),
            },
        ]);
        
        if (error) throw error;

        return NextResponse.json({ message: "file processed successfully", data });
    } catch (error) {
        console.error("error generating embedding: ", error);
        return NextResponse.json(
            { error: "embedding or insert failed", details: (error as Error).message },
            { status: 500 }
        );
    }
}