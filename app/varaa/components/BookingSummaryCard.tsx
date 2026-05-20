"use client";

import { useBooking } from "../BookingFlow";
import { t } from "@/lib/i18n";
import { formatDateDisplay, formatDuration } from "@/lib/timeSlots";
import { MapPin, Clock, CalendarDays, Wrench, Banknote } from "lucide-react";

export default function BookingSummaryCard() {
  const { lang, selectedServices, selectedDate, selectedTime } = useBooking();
  const tr = t(lang);

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice    = selectedServices.reduce((sum, s) => s.price ? sum + s.price : sum, 0);
  const hasOnRequest  = selectedServices.some((s) => s.price_on_request);

  const priceStr = selectedServices.length === 0
    ? null
    : hasOnRequest
    ? `€${totalPrice}+ (${tr.priceOnRequest})`
    : totalPrice === 0
    ? tr.free
    : `€${totalPrice}`;

  const dateStr = selectedDate ? formatDateDisplay(selectedDate, lang) : null;

  if (!selectedServices.length && !selectedDate && !selectedTime) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
      <div className="bg-gradient-to-r from-brand-dark to-[#2A2A2A] px-4 py-3">
        <p className="text-white font-semibold text-sm">{tr.summaryTitle}</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Services list */}
        {selectedServices.length > 0 && (
          <div className="space-y-1.5">
            {selectedServices.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                  <Wrench className="w-4 h-4" />
                  <span className="text-xs">{lang === "fi" ? s.name_fi : s.name_en}</span>
                </div>
                <span className="text-xs text-slate-500 shrink-0">
                  {s.price_on_request ? tr.priceOnRequest : s.price === 0 ? tr.free : `€${s.price}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {selectedServices.length > 1 && (
          <div className="border-t border-slate-100 pt-2">
            <SummaryRow
              icon={<Clock className="w-4 h-4" />}
              label={tr.durationLabel}
              value={formatDuration(totalDuration, lang)}
            />
            {priceStr && (
              <SummaryRow
                icon={<Banknote className="w-4 h-4" />}
                label={tr.price}
                value={priceStr}
                highlight
              />
            )}
          </div>
        )}

        {dateStr && (
          <SummaryRow icon={<CalendarDays className="w-4 h-4" />} label={tr.date} value={dateStr} />
        )}

        {selectedTime && (
          <SummaryRow icon={<Clock className="w-4 h-4" />} label={tr.time} value={selectedTime} />
        )}

        <div className="border-t border-slate-100 pt-2">
          <div className="flex items-start gap-2 text-slate-600 text-xs">
            <MapPin className="w-3.5 h-3.5 mt-0.5 text-brand-dark shrink-0" />
            <div>
              <p className="font-medium text-slate-700">3A Service</p>
              <p className="text-slate-400">Sillankorva 8, 02300 Espoo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value, highlight }: {
  icon: React.ReactNode; label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className={`text-xs text-right leading-tight ${highlight ? "font-bold text-brand-dark" : "text-slate-700"}`}>
        {value}
      </span>
    </div>
  );
}
