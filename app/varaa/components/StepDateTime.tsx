"use client";

import { useState, useEffect, useCallback } from "react";
import { useBooking } from "../BookingFlow";
import { t } from "@/lib/i18n";
import {
  generateAllSlots,
  getAvailableSlots,
  isWeekend,
  isPastDate,
  isToday,
  formatDateForDB,
  formatDuration,
  type TimeSlot,
} from "@/lib/timeSlots";
import { getBookedSlotsForDate } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from "lucide-react";
import React from "react";

function BlueNavButton({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  const [pressed, setPressed] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseDown={() => !disabled && setPressed(true)} onMouseUp={() => setPressed(false)}
      onMouseEnter={() => !disabled && setHovered(true)} onMouseLeave={() => { setHovered(false); setPressed(false); }}
      style={{
        flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "8px",
        borderRadius: "12px",
        background: disabled ? "#E8E8E8" : pressed ? "linear-gradient(to bottom, #1D4ED8, #60A5FA)" : "linear-gradient(to bottom, #3B82F6, #1D4ED8)",
        color: disabled ? "#AAAAAA" : "#fff",
        fontWeight: 700, fontSize: "15px", padding: "11px 26px",
        border: disabled ? "1px solid #D0D0D0" : "1px solid rgba(30,64,175,0.6)",
        boxShadow: disabled ? "none" : pressed
          ? "0 1px 3px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.12)"
          : hovered
          ? "0 6px 20px rgba(59,130,246,0.45), 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.20)"
          : "0 3px 12px rgba(59,130,246,0.30), 0 1px 4px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.18)",
        transform: disabled || pressed ? (pressed ? "translateY(2px) scale(0.98)" : "none") : "translateY(0) scale(1)",
        transition: "all 0.18s cubic-bezier(0.1,0.4,0.2,1)",
        outline: "none", cursor: disabled ? "not-allowed" : "pointer", WebkitTapHighlightColor: "transparent",
        filter: hovered && !pressed && !disabled ? "brightness(1.08)" : "none",
      }}
    >{children}</button>
  );
}

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function StepDateTime({ onNext, onBack }: Props) {
  const { lang, selectedServices, selectedDate, setSelectedDate, selectedTime, setSelectedTime } = useBooking();
  const tr = t(lang);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const allGeneratedSlots = generateAllSlots();

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1);
  // Monday-first: 0=Mon … 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const cells: (Date | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return new Date(viewYear, viewMonth, dayNum);
  });

  const fetchSlots = useCallback(async (date: Date) => {
    if (!totalDuration) return;
    setLoadingSlots(true);
    setSlots([]);
    const dateStr = formatDateForDB(date);
    const booked = await getBookedSlotsForDate(dateStr);
    const available = getAvailableSlots(dateStr, booked, totalDuration);
    setSlots(available);
    setLoadingSlots(false);
  }, [totalDuration]);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  function handleDayClick(date: Date) {
    if (isWeekend(date) || isPastDate(date)) return;
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const availableCount = slots.filter(s => s.available).length;
  const durationH = totalDuration ? formatDuration(totalDuration, lang) : "";
  const showDurationWarning = totalDuration >= 180;

  function canContinue() {
    return !!selectedDate && !!selectedTime;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#111111]">{tr.chooseDate}</h1>
        <p className="text-slate-500 mt-2 text-base">{tr.chooseDateSub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Calendar ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prevMonth}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#111111] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-800">
              {tr.months[viewMonth]} {viewYear}
            </h3>
            <button
              onClick={nextMonth}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-[#111111] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {tr.weekdays.map((wd) => (
              <div key={wd} className="text-center text-[13px] font-semibold text-slate-400 py-1">
                {wd}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((date, i) => {
              if (!date) return <div key={i} />;

              const weekend = isWeekend(date);
              const past = isPastDate(date);
              const todayMark = isToday(date);
              const disabled = weekend || past;

              const isSelected =
                selectedDate &&
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear();

              return (
                <button
                  key={i}
                  disabled={disabled}
                  onClick={() => handleDayClick(date)}
                  className={`
                    relative aspect-square flex items-center justify-center text-base rounded-xl font-medium transition-all duration-150
                    ${disabled
                      ? "text-slate-300 cursor-not-allowed"
                      : isSelected
                      ? "bg-gray-900 text-white shadow-sm"
                      : todayMark
                      ? "ring-2 ring-amber-400 text-gray-900 font-bold hover:bg-amber-50"
                      : "text-gray-700 hover:bg-amber-50 hover:text-gray-900"
                    }
                  `}
                >
                  {date.getDate()}
                  {todayMark && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#111111]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Time Slots ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">{tr.chooseTime}</h3>
            {selectedDate && !loadingSlots && slots.length > 0 && (
              <span className="text-sm text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {availableCount} {tr.availableSlots}
              </span>
            )}
          </div>

          {/* Duration warning */}
          {showDurationWarning && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700 leading-snug">
                {tr.durationWarning(durationH)}
              </p>
            </div>
          )}

          {/* No date selected */}
          {!selectedDate && (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Clock className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-base">{tr.chooseDateSub}</p>
            </div>
          )}

          {/* Loading */}
          {selectedDate && loadingSlots && (
            <div className="flex items-center justify-center h-40">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-[#111111]/20 border-t-[#111111] animate-spin" />
                <p className="text-sm text-slate-500">{tr.loadingSlots}</p>
              </div>
            </div>
          )}

          {/* Slots grid */}
          {selectedDate && !loadingSlots && (
            <>
              {slots.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-slate-400">
                  <p className="text-base">{tr.noSlots}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
                  {allGeneratedSlots.map((slotTime) => {
                    const slot = slots.find(s => s.time === slotTime);
                    if (!slot) return null;
                    const isBooked = !slot.available;
                    const isSelectedSlot = selectedTime === slotTime;

                    return (
                      <button
                        key={slotTime}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slotTime)}
                        className={`
                          py-2.5 rounded-xl text-base font-medium border transition-all duration-150
                          ${isBooked
                            ? "border-slate-100 bg-slate-50 text-slate-300 line-through cursor-not-allowed"
                            : isSelectedSlot
                            ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:border-[#111111]/50 hover:text-[#111111]"
                          }
                        `}
                      >
                        {slotTime}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-medium text-sm transition-all duration-150 rounded-full px-4 py-2 hover:bg-gray-100 active:scale-95"
          style={{ color: "#555", border: "1.5px solid rgba(0,0,0,0.10)" }}
        >
          <ChevronLeft className="w-4 h-4" />
          {tr.back}
        </button>

        {canContinue() ? (
          <BlueNavButton onClick={onNext}>
            {tr.continueBtn}
            <ChevronRight className="w-4 h-4" />
          </BlueNavButton>
        ) : (
          <button
            disabled
            className="flex items-center gap-2 text-slate-400 font-semibold px-7 py-3 rounded-2xl cursor-not-allowed"
            style={{ background: "#F0F0F0", fontSize: "15px" }}
          >
            {tr.continueBtn}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
