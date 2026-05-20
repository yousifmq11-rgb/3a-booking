import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Service {
  id: number;
  name_fi: string;
  name_en: string;
  description_fi?: string;
  description_en?: string;
  category_fi: string;
  category_en: string;
  duration_minutes: number;
  price: number | null;
  price_on_request: boolean;
  is_popular: boolean;
  icon?: string;
}

export interface Booking {
  id: number;
  service_id: number;
  booking_date: string;      // YYYY-MM-DD
  booking_time: string;      // HH:MM
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  license_plate?: string;
  car_make_model?: string;
  mileage?: number;
  notes?: string;
  sms_reminder: boolean;
  reference_number: string;
  created_at: string;
}

export interface BookingInsert {
  service_id: number;
  booking_date: string;
  booking_time: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  license_plate?: string;
  car_make_model?: string;
  mileage?: number;
  notes?: string;
  sms_reminder: boolean;
  reference_number: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getServiceById(id: number): Promise<Service | null> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getServiceById error:", error.message);
    return null;
  }
  return data as Service;
}

export async function getAllServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("id");

  if (error) {
    console.error("getAllServices error:", error.message);
    return [];
  }
  return (data as Service[]) ?? [];
}

export async function getBookedSlotsForDate(date: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("booking_time")
    .eq("booking_date", date);

  if (error) {
    console.error("getBookedSlotsForDate error:", error.message);
    return [];
  }
  return (data ?? []).map((row: { booking_time: string }) => row.booking_time);
}

export async function createBooking(
  booking: BookingInsert
): Promise<Booking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .insert(booking)
    .select()
    .single();

  if (error) {
    console.error("createBooking error:", error.message);
    return null;
  }
  return data as Booking;
}

export function generateReferenceNumber(): string {
  const prefix = "3A";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${rand}`;
}
