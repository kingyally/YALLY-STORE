import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/db";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token inahitajika" },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Verify session
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("token", token)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session si sahihi" },
        { status: 401 }
      );
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from("sessions").delete().eq("token", token);
      return NextResponse.json(
        { error: "Session imeisha muda" },
        { status: 401 }
      );
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email, phone, banned")
      .eq("id", session.user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Mtumiaji hajapatikana" },
        { status: 404 }
      );
    }

    if (user.banned) {
      return NextResponse.json(
        { error: "Akaunti yako imezuiwa" },
        { status: 403 }
      );
    }

    // Check if admin
    const { data: admin } = await supabase
      .from("admins")
      .select("role, permissions")
      .eq("email", user.email)
      .single();

    return NextResponse.json({
      user,
      isAdmin: !!admin,
      adminRole: admin?.role || null,
      permissions: admin?.permissions || [],
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json(
      { error: "Tatizo la seva" },
      { status: 500 }
    );
  }
}
