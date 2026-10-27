import { NextResponse } from "next/server";
import { supabaseRpc } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 2 || email.length < 3 || !email.includes("@") || phone.length < 5 || message.length < 2) {
    return NextResponse.json({ error: "Please check your inquiry details." }, { status: 400 });
  }

  const { data, error } = await supabaseRpc<string>("create_reservation_inquiry", {
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_message: message,
  });

  if (error) {
    return NextResponse.json(
      { error: error === "not_configured" ? "Reservation service is not configured." : "Your inquiry could not be sent. Please try again." },
      { status: error === "not_configured" ? 503 : 400 },
    );
  }

  return NextResponse.json({ inquiryId: data });
}
