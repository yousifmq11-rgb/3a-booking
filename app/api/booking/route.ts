import { NextResponse } from "next/server";
import { Resend } from "resend";
import { addEventToGoogleCalendar, addRowToGoogleSheets } from "@/lib/googleServices";
import type { BookingWithService } from "@/lib/googleServices";
import type { Booking } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

interface RequestBody {
  booking: Booking;
  service_name: string;
  duration_minutes: number;
  price: number | null;
  price_on_request: boolean;
}

export async function POST(request: Request) {
  try {
    const { booking, service_name, duration_minutes, price, price_on_request }: RequestBody =
      await request.json();

    const bws: BookingWithService = {
      ...booking,
      service_name,
      duration_minutes,
      price,
      price_on_request,
    };

    const tasks: Promise<unknown>[] = [
      addEventToGoogleCalendar(bws),
      addRowToGoogleSheets(bws),
    ];

    if (booking.email) {
      tasks.push(
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
          to: booking.email,
          subject: `Varausvahvistus #${booking.reference_number} — 3A Service`,
          html: buildConfirmationEmail(bws),
        })
      );
    }

    const results = await Promise.allSettled(tasks);
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const labels = ["calendar", "sheets", "email"];
        console.error(`[booking API] ${labels[i]} failed:`, r.reason);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[booking API] unexpected error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

function buildConfirmationEmail(b: BookingWithService): string {
  const priceStr = b.price_on_request ? "Pyydä tarjous" : b.price === 0 ? "Ilmainen" : `€${b.price}`;

  return `
<!DOCTYPE html>
<html lang="fi">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0F4C81;padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="display:inline-block;background:rgba(255,255,255,.15);color:#fff;font-weight:700;font-size:14px;padding:6px 12px;border-radius:8px;letter-spacing:.5px;">3A</span>
                  <span style="color:#fff;font-weight:700;font-size:18px;margin-left:10px;">3A Service</span>
                </td>
                <td align="right">
                  <span style="color:rgba(255,255,255,.7);font-size:12px;">Autokorjaamo Espoossa</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Confirmed badge -->
        <tr>
          <td style="padding:32px 32px 0;text-align:center;">
            <div style="display:inline-block;background:#ECFDF5;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:16px;">✓</div>
            <h1 style="margin:0 0 8px;color:#1E293B;font-size:22px;">Varaus vahvistettu!</h1>
            <p style="margin:0;color:#64748B;font-size:14px;">Hei ${b.first_name}, varauksesi on vastaanotettu onnistuneesti.</p>
          </td>
        </tr>

        <!-- Reference -->
        <tr>
          <td style="padding:20px 32px 0;text-align:center;">
            <div style="display:inline-block;background:#EFF6FF;border-radius:10px;padding:10px 20px;">
              <span style="color:#0F4C81;font-size:12px;font-weight:500;">Varaustunnus</span>
              <span style="color:#0F4C81;font-size:20px;font-weight:700;margin-left:10px;">#${b.reference_number}</span>
            </div>
          </td>
        </tr>

        <!-- Summary table -->
        <tr>
          <td style="padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">
              <tr style="background:#0F4C81;">
                <td colspan="2" style="padding:12px 16px;color:#fff;font-weight:600;font-size:13px;">Varauksen yhteenveto</td>
              </tr>
              ${summaryRow("Palvelu", b.service_name, true)}
              ${summaryRow("Päivä", b.booking_date)}
              ${summaryRow("Aika", b.booking_time)}
              ${summaryRow("Kesto", `${b.duration_minutes} min`)}
              ${summaryRow("Hinta", priceStr)}
              ${b.license_plate ? summaryRow("Rekisterinumero", b.license_plate) : ""}
              ${b.car_make_model ? summaryRow("Auto", b.car_make_model) : ""}
            </table>
          </td>
        </tr>

        <!-- Address -->
        <tr>
          <td style="padding:0 32px 24px;">
            <div style="background:#F8FAFC;border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;">
              <span style="font-size:20px;">📍</span>
              <div>
                <p style="margin:0;color:#1E293B;font-weight:600;font-size:14px;">3A Service</p>
                <p style="margin:4px 0 0;color:#64748B;font-size:13px;">Sillankorva 8, 02300 Espoo</p>
              </div>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;padding:20px 32px;border-top:1px solid #E2E8F0;text-align:center;">
            <p style="margin:0 0 8px;color:#94A3B8;font-size:12px;">Kysyttävää? Ota yhteyttä:</p>
            <a href="tel:+358449773677" style="color:#0F4C81;font-weight:600;font-size:13px;text-decoration:none;">+358 44 977 3677</a>
            <span style="color:#CBD5E1;margin:0 8px;">·</span>
            <a href="https://wa.me/358449773677" style="color:#16A34A;font-weight:600;font-size:13px;text-decoration:none;">WhatsApp</a>
            <p style="margin:16px 0 0;color:#CBD5E1;font-size:11px;">© 2024 3A Service Oy</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function summaryRow(label: string, value: string, highlight = false): string {
  return `
    <tr style="border-top:1px solid #E2E8F0;">
      <td style="padding:10px 16px;color:#64748B;font-size:13px;width:40%;">${label}</td>
      <td style="padding:10px 16px;color:${highlight ? "#0F4C81" : "#1E293B"};font-size:13px;font-weight:${highlight ? "600" : "400"};">${value}</td>
    </tr>`;
}
