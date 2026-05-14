import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/db";

function generateToken(): string {
  return "sess_" + crypto.randomUUID().replace(/-/g, "");
}

function generateUserId(): string {
  return "u_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Jina, email na password vinahitajika" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email hii tayari imesajiliwa" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateUserId();
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create user
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      password_hash: passwordHash,
    });

    if (userError) {
      console.error("User creation error:", userError);
      return NextResponse.json(
        { error: "Imeshindikana kuunda akaunti" },
        { status: 500 }
      );
    }

    // Create session
    await supabase.from("sessions").insert({
      token,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
    });

    return NextResponse.json({
      user: { id: userId, name, email: email.toLowerCase(), phone },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Tatizo la seva, jaribu tena" },
      { status: 500 }
    );
  }
}
