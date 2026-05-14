import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/db";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token) {
      const supabase = createAdminClient();
      await supabase.from("sessions").delete().eq("token", token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: true });
  }
}
