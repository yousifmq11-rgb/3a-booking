import { google } from "googleapis";
import type { Booking } from "./supabase";

// Extended booking type that includes resolved service details
export interface BookingWithService extends Booking {
  service_name: string;
  duration_minutes: number;
  price: number | null;
  price_on_request: boolean;
}

function getAuthClient() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
}

// Returns the created event ID, or null on failure
export async function addEventToGoogleCalendar(
  booking: BookingWithService
): Promise<string | null> {
  const auth = getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  const [hour, minute] = booking.booking_time.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const totalEndMin = hour * 60 + minute + booking.duration_minutes;
  const endHour = Math.floor(totalEndMin / 60);
  const endMin = totalEndMin % 60;

  // Pass wall-clock time strings directly — let Google convert using timeZone
  const startDateTime = `${booking.booking_date}T${pad(hour)}:${pad(minute)}:00`;
  const endDateTime   = `${booking.booking_date}T${pad(endHour)}:${pad(endMin)}:00`;

  const description = [
    `Customer: ${booking.first_name} ${booking.last_name}`,
    `Phone: ${booking.phone}`,
    booking.email ? `Email: ${booking.email}` : null,
    booking.license_plate ? `License plate: ${booking.license_plate}` : null,
    booking.car_make_model ? `Vehicle: ${booking.car_make_model}` : null,
    booking.mileage != null ? `Mileage: ${booking.mileage} km` : null,
    booking.notes ? `Notes: ${booking.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { data } = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    requestBody: {
      summary: `3A Service — ${booking.service_name} — ${booking.license_plate ?? ""}`,
      description,
      start: { dateTime: startDateTime, timeZone: "Europe/Helsinki" },
      end:   { dateTime: endDateTime,   timeZone: "Europe/Helsinki" },
      colorId: "9", // Blueberry
    },
  });

  return data.id ?? null;
}

export async function addRowToGoogleSheets(
  booking: BookingWithService
): Promise<void> {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const price = booking.price_on_request
    ? "On request"
    : booking.price != null
    ? `€${booking.price}`
    : "";

  const row = [
    booking.booking_date,                          // Date
    booking.booking_time,                          // Time
    `${booking.first_name} ${booking.last_name}`,  // Customer Name
    booking.phone,                                 // Phone
    booking.email ?? "",                           // Email
    booking.license_plate ?? "",                   // Rekisterinumero
    booking.service_name,                          // Service
    `${booking.duration_minutes} min`,             // Duration
    price,                                         // Price
    "Confirmed",                                   // Status
    booking.notes ?? "",                           // Notes
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: "Sheet1!A:K",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

// Returns true if the slot is free, false if there are conflicts (e.g. AutoJerry bookings)
export async function checkCalendarAvailability(
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const auth = getAuthClient();
  const calendar = google.calendar({ version: "v3", auth });

  const [year, month, day] = date.split("-").map(Number);
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  const timeMin = new Date(year, month - 1, day, sh, sm).toISOString();
  const timeMax = new Date(year, month - 1, day, eh, em).toISOString();

  const { data } = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: "Europe/Helsinki",
      items: [{ id: process.env.GOOGLE_CALENDAR_ID! }],
    },
  });

  const calendarId = process.env.GOOGLE_CALENDAR_ID!;
  const busy = data.calendars?.[calendarId]?.busy ?? [];
  return busy.length === 0;
}
