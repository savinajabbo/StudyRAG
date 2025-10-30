import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/app/lib/supabase/server";

export async function GET() {
    const supabase = createSupabaseServer();

    const { data, error } = await supabase.from("profile").select("*").single();

    if (error) {
        return NextResponse.json({ connected: false, error: error.message });
    }

    return NextResponse.json({ connected: true, sampleData: data });
}