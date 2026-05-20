"use client";

import { useEffect, useState } from "react";
import { useBooking } from "../BookingFlow";
import { t } from "@/lib/i18n";
import { formatDateDisplay, formatDuration } from "@/lib/timeSlots";
import { MapPin, Phone, MessageCircle, Calendar, ArrowLeft } from "lucide-react";

export default function StepSuccess() {
  const { lang, selectedServices, selectedDate, selectedTime, bookingRef, customerName } = useBooking();
  const selectedService = selectedServices[0] ?? null;
  const totalDuration   = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice      = selectedServices.reduce((sum, s) => s.price ? sum + s.price : sum, 0);
  const hasOnRequest    = selectedServices.some((s) => s.price_on_request);
  const tr = t(lang);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const serviceName = selectedServices
    .map((s) => lang === "fi" ? s.name_fi : s.name_en)
    .join(" + ");

  const dateStr = selectedDate ? formatDateDisplay(selectedDate, lang) : "";

  function buildGoogleCalendarLink() {
    if (!selectedDate || !selectedTime || !selectedService) return "#";
    const [h, m] = selectedTime.split(":").map(Number);
    const start = new Date(selectedDate);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + selectedService.duration_minutes * 60000);

    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `3A Service — ${serviceName}`,
      dates: `${fmt(start)}/${fmt(end)}`,
      location: "Sillankorva 8, 02300 Espoo",
      details: `${tr.referenceNumber}: #${bookingRef}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  return (
    <div className="max-w-lg mx-auto py-8 space-y-8">
      {/* Checkmark */}
      <div
        className={`flex flex-col items-center text-center transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="relative w-20 h-20 mb-5">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-scale-in" />
          {/* Inner circle */}
          <div className="absolute inset-2 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M5 13l4 4L19 7"
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: visible ? 0 : 100,
                  transition: "stroke-dashoffset 0.5s ease 0.2s",
                }}
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-2">
          {tr.bookingConfirmed}
        </h1>
        <p className="text-slate-500 text-base">
          {customerName ? `${customerName}, ` : ""}{tr.bookingConfirmedSub}
        </p>

        {/* Reference */}
        <div className="mt-4 inline-flex items-center gap-2 bg-brand-yellow px-4 py-2 rounded-xl">
          <span className="text-sm text-brand-dark font-medium">{tr.referenceNumber}</span>
          <span className="text-brand-dark font-bold text-xl">#{bookingRef}</span>
        </div>
      </div>

      {/* Booking summary card */}
      <div
        className={`bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden transition-all duration-500 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {/* Header stripe */}
        <div className="bg-[#111111] px-5 py-3 flex items-center justify-between">
          <p className="text-white font-semibold text-base">{tr.summaryTitle}</p>
          <span className="text-white/60 text-sm">#{bookingRef}</span>
        </div>

        <div className="p-5 space-y-3">
          <Row label={tr.service} value={serviceName} highlight />
          <Row label={tr.date} value={dateStr} />
          <Row label={tr.time} value={selectedTime ?? "-"} />
          <Row
            label={tr.durationLabel}
            value={totalDuration ? formatDuration(totalDuration, lang) : "-"}
          />
          <Row
            label={tr.price}
            value={hasOnRequest ? `€${totalPrice}+` : totalPrice === 0 ? tr.free : `€${totalPrice}`}
          />

          {/* Divider */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-start gap-2 text-slate-600 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 text-[#111111] shrink-0" />
              <div>
                <p className="font-medium text-slate-800">3A Service</p>
                <p className="text-slate-500 text-xs">Sillankorva 8, 02300 Espoo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp message */}
      <div
        className={`flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3.5 transition-all duration-500 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <MessageCircle className="w-5 h-5 text-green-600 shrink-0" />
        <p className="text-sm text-green-700">{tr.whatsappMessage}</p>
      </div>

      {/* Actions */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-all duration-500 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <a
          href="https://wa.me/358449773677"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-3.5 rounded-2xl shadow-md shadow-green-500/20 transition-all duration-200 hover:scale-[1.02]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.523 5.843L0 24l6.302-1.497A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.37l-.36-.214-3.727.885.925-3.623-.235-.372A9.817 9.817 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182c5.42 0 9.818 4.397 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z" />
          </svg>
          {tr.whatsappButton}
        </a>

        <a
          href={buildGoogleCalendarLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#111111] font-semibold px-5 py-3.5 rounded-2xl border-2 border-[#111111]/20 hover:border-[#111111]/40 shadow-sm transition-all duration-200 hover:scale-[1.02]"
        >
          <Calendar className="w-5 h-5" />
          {tr.addToCalendar}
        </a>
      </div>

      {/* Back to home */}
      <div
        className={`flex items-center justify-center gap-4 transition-all duration-500 delay-400 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <a
          href="/"
          className="flex items-center gap-1.5 text-slate-500 hover:text-[#111111] text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {tr.backToHome}
        </a>
        <span className="text-slate-300">·</span>
        <button
          onClick={() => window.location.reload()}
          className="text-[#111111] text-sm font-medium hover:underline transition-colors"
        >
          {tr.newBooking}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <span className={`text-base text-right ${highlight ? "font-semibold text-[#111111]" : "text-slate-700"}`}>
        {value}
      </span>
    </div>
  );
}
