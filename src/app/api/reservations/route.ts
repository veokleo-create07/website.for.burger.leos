import { NextRequest, NextResponse } from "next/server";
import { supabaseRpc } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type ReservationResult = {
  id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  guests: number;
  duration_minutes: number;
  guest_name: string;
};

const errorMessage = (error: string | null) => {
  if (!error) return "Reservation could not be completed.";
  if (error === "not_configured") return "Reservation service is not configured.";\n  if (error.includes("PGRST202") || error.includes("schema cache") || error.includes("function public.create_reservation")) {\n    return "Reservation database setup is incomplete. Please run the Supabase migration.";\n  }
  if (error.includes("capacity_exceeded") || error.includes("reservations_no_overlap")) {
    return "That time is no longer available. Please choose another time.";
  }
  if (error.includes("outside_hours") || error.includes("invalid_time_interval")) {
    return "Please choose a valid opening time.";
  }
  if (error.includes("invalid_guest_details") || error.includes("invalid_guests")) {
    return "Please check your details and guest count.";
  }
  return "Reservation could not be completed. Please try again.";
};

const isDate = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const isTime = (value: unknown): value is string =>
  typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const date = body.date;
  const time = body.time;
  const guests = body.guests;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const specialRequests = Array.isArray(body.specialRequests) ? body.specialRequests : [];

  if (!isDate(date) || !isTime(time) || !Number.isInteger(guests) || (guests as number) < 1 || (guests as number) > 10) {
    return NextResponse.json({ error: "Please choose a valid date, time, and guest count." }, { status: 400 });
  }
  if (name.length < 2 || email.length < 3 || !email.includes("@") || phone.length < 5) {
    return NextResponse.json({ error: "Please check your contact details." }, { status: 400 });
  }

  const { data, error } = await supabaseRpc<ReservationResult[]>("create_reservation", {
    p_date: date,
    p_time: time,
    p_guests: guests,
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_special_requests: specialRequests,
    p_timezone: "Europe/Berlin",
  });

  if (error) {
    const status = error === "not_configured" ? 503 : error.includes("capacity_exceeded") || error.includes("reservations_no_overlap") ? 409 : 400;
    return NextResponse.json({ error: errorMessage(error) }, { status });
  }

  const reservation = Array.isArray(data) ? data[0] : data;
  if (!reservation) return NextResponse.json({ error: "Reservation could not be completed." }, { status: 500 });

  return NextResponse.json({
    reservation: {
      id: reservation.id,
      date: reservation.reservation_date,
      time: reservation.start_time.slice(0, 5),
      guests: reservation.guests,
      durationMinutes: reservation.duration_minutes,
      name: reservation.guest_name,
    },
  });
}
