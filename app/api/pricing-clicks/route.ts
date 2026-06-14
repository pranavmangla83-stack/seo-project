import { NextResponse } from "next/server";
import { pricingByMarket, type Market } from "@/lib/pricing";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    scanId?: unknown;
    leadId?: unknown;
    websiteUrl?: unknown;
    market?: unknown;
    planId?: unknown;
  } | null;

  const scanId = typeof body?.scanId === "string" ? body.scanId : "";
  const leadId = typeof body?.leadId === "string" ? body.leadId : "";
  const websiteUrl = typeof body?.websiteUrl === "string" ? body.websiteUrl : "";
  const market = body?.market === "us" ? "us" : "india";
  const planId = typeof body?.planId === "string" ? body.planId : "";
  const plan = pricingByMarket[market as Market].find((item) => item.id === planId);

  if (!scanId || !leadId || !websiteUrl || !plan) {
    return NextResponse.json(
      { error: "Missing pricing selection details." },
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

  const { data: lead } = await supabase
    .from("leads")
    .select("email")
    .eq("id", leadId)
    .single();

  const { data: pricingClick, error } = await supabase
    .from("pricing_clicks")
    .insert({
      scan_id: scanId,
      lead_id: leadId,
      website_url: websiteUrl,
      email: lead?.email ?? null,
      market,
      plan: plan.name,
      price: plan.price
    })
    .select("id, market, plan, price, website_url, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Could not save pricing interest." },
      { status: 500 }
    );
  }

  await supabase.from("events").insert([
    {
      event_name: "pricing_plan_clicked",
      scan_id: scanId,
      website_url: websiteUrl,
      metadata: {
        lead_id: leadId,
        pricing_click_id: pricingClick.id,
        market,
        plan: plan.name,
        price: plan.price
      }
    },
    {
      event_name: "launch_soon_viewed",
      scan_id: scanId,
      website_url: websiteUrl,
      metadata: {
        lead_id: leadId,
        pricing_click_id: pricingClick.id
      }
    }
  ]);

  return NextResponse.json({ pricingClick });
}
