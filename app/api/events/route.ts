import { NextResponse } from "next/server";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

const allowedEvents = new Set([
  "fix_cta_clicked",
  "pricing_viewed",
  "pricing_market_changed",
  "pricing_plan_clicked",
  "launch_soon_viewed"
]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    eventName?: unknown;
    scanId?: unknown;
    websiteUrl?: unknown;
    metadata?: unknown;
  } | null;

  const eventName = typeof body?.eventName === "string" ? body.eventName : "";
  const scanId = typeof body?.scanId === "string" ? body.scanId : null;
  const websiteUrl =
    typeof body?.websiteUrl === "string" ? body.websiteUrl : null;
  const metadata =
    body?.metadata && typeof body.metadata === "object" ? body.metadata : {};

  if (!allowedEvents.has(eventName)) {
    return NextResponse.json({ error: "Unknown event." }, { status: 400 });
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

  const { error } = await supabase.from("events").insert({
    event_name: eventName,
    scan_id: scanId,
    website_url: websiteUrl,
    metadata
  });

  if (error) {
    return NextResponse.json(
      { error: "Could not store event." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
