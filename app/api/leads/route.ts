import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/email";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    scanId?: unknown;
    websiteUrl?: unknown;
    email?: unknown;
  } | null;

  const scanId = typeof body?.scanId === "string" ? body.scanId : "";
  const websiteUrl = typeof body?.websiteUrl === "string" ? body.websiteUrl : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!scanId || !websiteUrl || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured yet. Add the environment variables from .env.example."
      },
      { status: 503 }
    );
  }

  const supabase = createSupabaseServerClient();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      scan_id: scanId,
      website_url: websiteUrl,
      email
    })
    .select("id, scan_id, website_url, email, created_at")
    .single();

  if (leadError) {
    return NextResponse.json(
      { error: "Could not save your email. Please try again." },
      { status: 500 }
    );
  }

  await supabase.from("events").insert({
    event_name: "email_submitted",
    scan_id: scanId,
    website_url: websiteUrl,
    metadata: {
      lead_id: lead.id
    }
  });

  return NextResponse.json({ lead });
}
