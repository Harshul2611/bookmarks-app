import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

const HANDLE_REGEX = /^[a-z0-9_]{3,20}$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { email, password, handle } = body as {
    email?: string;
    password?: string;
    handle?: string;
  };

  if (!email || !password || !handle) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  if (!HANDLE_REGEX.test(handle)) {
    return NextResponse.json(
      {
        error:
          "Handle must be 3–20 characters: lowercase letters, numbers, and underscores only",
        field: "handle",
      },
      { status: 400 },
    );
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { handle },
  });
  if (existingProfile) {
    return NextResponse.json(
      { error: "This handle is already taken", field: "handle" },
      { status: 409 },
    );
  }

  const pendingCookies: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((c) => pendingCookies.push(c));
        },
      },
    },
  );

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }

  try {
    await prisma.user.create({
      data: {
        id: data.user.id,
        email: data.user.email!,
        profile: { create: { handle } },
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create user profile" },
      { status: 500 },
    );
  }

  resend.emails
    .send({
      from: "Bookmark App <noreply@streamlyx.in>",
      to: email,
      subject: "Welcome to Bookmark App!",
      html: `<p>Hi <strong>@${handle}</strong>,</p><p>Your Bookmark App account is ready. Start saving your favourite links!</p>`,
    })
    .catch(console.error);

  const response = NextResponse.json({
    success: true,
    requiresConfirmation: !data.session,
  });

  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
