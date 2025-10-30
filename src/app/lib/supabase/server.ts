import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export const createSupabaseServer = () => {
    const cookieStore = cookies();
    return createRouteHandlerClient({ cookies, });
};