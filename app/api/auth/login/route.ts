import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/db";

function generateToken(): string {
  return "sess_" + crypto.randomUUID().replace(/-/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email na password vinahitajika" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Email au password si sahihi" },
        { status: 401 }
      );
    }

    // Check if banned
    if (user.banned) {
      return NextResponse.json(
        { error: "Akaunti yako imezuiwa" },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Email au password si sahihi" },
        { status: 401 }
      );
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await supabase.from("sessions").insert({
      token,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
    });

    // Update login stats
    await supabase
      .from("users")
      .update({
        last_login: new Date().toISOString(),
        login_count: (user.login_count || 0) + 1,
      })
      .eq("id", user.id);

    // Check if user is admin
    const { data: admin } = await supabase
      .from("admins")
      .select("role, permissions")
      .eq("email", email.toLowerCase())
      .single();

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
      isAdmin: !!admin,
      adminRole: admin?.role || null,
      permissions: admin?.permissions || [],
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Tatizo la seva, jaribu tena" },
      { status: 500 }
    );
  }
}
