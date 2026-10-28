import { NextRequest, NextResponse } from "next/server";
import { supabaseRpc } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type AvailabilityRow = { time: string; available: boolean };

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const guestsValue = request.nextUrl.searchParams.get("guests");
  const guests = guestsValue ? Number(guestsValue) : NaN;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(guests) || guests < 1 || guests > 10) {
    return NextResponse.json({ error: "Please choose a valid date and guest count." }, { status: 400 });
  }

  const { data, error } = await supabaseRpc<AvailabilityRow[]>("get_reservation_availability", {
    p_date: date,
    p_guests: guests,
    p_timezone: "Europe/Berlin",
  });

  if (error) {
    return NextResponse.json(
      { error: error === "not_configured" ? "Reservation service is not configured." : "Availability could not be loaded." },
      { status: error === "not_configured" ? 503 : 400 },
    );
  }

  return NextResponse.json({
    times: (data ?? []).filter((slot) => slot.available).map((slot) => slot.time.slice(0, 5)),
  });
}
