"use client";

import { useState } from "react";
import { useBooking } from "../BookingFlow";
import { t } from "@/lib/i18n";
import { createBooking, generateReferenceNumber } from "@/lib/supabase";
import { formatDateForDB, formatDateDisplay, formatDuration } from "@/lib/timeSlots";
import BookingSummaryCard from "./BookingSummaryCard";
import { ChevronLeft, ChevronRight, User, Phone, Mail, Car, FileText, Bell, AlertCircle } from "lucide-react";
import React from "react";

function BlueNavButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
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
        transform: pressed ? "translateY(2px) scale(0.98)" : "translateY(0) scale(1)",
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

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licensePlate: string;
  carMakeModel: string;
  mileage: string;
  notes: string;
  smsReminder: boolean;
  acceptTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  licensePlate?: string;
  acceptTerms?: string;
}

export default function StepCustomer({ onNext, onBack }: Props) {
  const { lang, selectedServices, selectedDate, selectedTime, setBookingRef, setCustomerName } = useBooking();
  const selectedService = selectedServices[0] ?? null;
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const tr = t(lang);

  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", phone: "", email: "",
    licensePlate: "", carMakeModel: "", mileage: "", notes: "",
    smsReminder: true, acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = tr.required;
    if (!form.lastName.trim()) e.lastName = tr.required;
    if (!form.phone.trim()) e.phone = tr.required;
    else if (!/^[\d\s\+\-\(\)]{7,15}$/.test(form.phone.replace(/\s/g, ""))) e.phone = tr.invalidPhone;
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = tr.invalidEmail;
    if (!form.licensePlate.trim()) e.licensePlate = tr.required;
    if (!form.acceptTerms) e.acceptTerms = tr.termsRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    setSubmitError("");

    const ref = generateReferenceNumber();

    const booking = await createBooking({
      service_id: selectedService.id,
      booking_date: formatDateForDB(selectedDate),
      booking_time: selectedTime,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      license_plate: form.licensePlate.trim().toUpperCase() || undefined,
      car_make_model: form.carMakeModel.trim() || undefined,
      mileage: form.mileage ? Number(form.mileage) : undefined,
      notes: form.notes.trim() || undefined,
      sms_reminder: form.smsReminder,
      reference_number: ref,
    });

    if (!booking) {
      setSubmitting(false);
      setSubmitError(tr.submitError ?? "Varaus epäonnistui. Yritä uudelleen.");
      return;
    }

    // Fire-and-forget: booking is in Supabase, send to Calendar + Sheets
    fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking,
        service_name: selectedServices.map((s) => lang === "fi" ? s.name_fi : s.name_en).join(" + "),
        duration_minutes: totalDuration,
        price: selectedServices.reduce((sum, s) => s.price ? sum + s.price : sum, 0),
        price_on_request: selectedServices.some((s) => s.price_on_request),
      }),
    }).catch((err) => console.error("Integration API error:", err));

    setSubmitting(false);
    setBookingRef(ref);
    setCustomerName(form.firstName.trim());
    onNext();
  }

  const inputClass = (error?: string) => `
    w-full px-3.5 py-3 rounded-xl border text-base transition-all duration-150 outline-none
    ${error
      ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300"
      : "border-slate-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40"
    }
    placeholder:text-slate-400 text-slate-800
  `;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#111111]">{tr.yourDetails}</h1>
        <p className="text-slate-500 mt-2 text-base">{tr.yourDetailsSub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Form ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {tr.firstName} <span className="text-[#C8102E]">*</span>
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => set("firstName", e.target.value)}
                className={inputClass(errors.firstName)}
                placeholder="Matti"
                autoComplete="given-name"
              />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {tr.lastName} <span className="text-[#C8102E]">*</span>
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => set("lastName", e.target.value)}
                className={inputClass(errors.lastName)}
                placeholder="Virtanen"
                autoComplete="family-name"
              />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {tr.phone} <span className="text-[#C8102E]">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                className={inputClass(errors.phone)}
                placeholder={tr.phonePlaceholder}
                autoComplete="tel"
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {tr.email}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                className={inputClass(errors.email)}
                placeholder={tr.emailPlaceholder}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* License plate + Make/model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                {tr.licensePlate} <span className="text-[#C8102E]">*</span>
              </label>
              <input
                type="text"
                value={form.licensePlate}
                onChange={e => set("licensePlate", e.target.value.toUpperCase())}
                className={inputClass(errors.licensePlate)}
                placeholder={tr.licensePlatePlaceholder}
                maxLength={10}
              />
              {errors.licensePlate && <p className="text-xs text-red-500">{errors.licensePlate}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                {tr.carMakeModel}
              </label>
              <input
                type="text"
                value={form.carMakeModel}
                onChange={e => set("carMakeModel", e.target.value)}
                className={inputClass()}
                placeholder={tr.carMakeModelPlaceholder}
              />
            </div>
          </div>

          {/* Mileage */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{tr.mileage}</label>
            <input
              type="number"
              value={form.mileage}
              onChange={e => set("mileage", e.target.value)}
              className={inputClass()}
              placeholder={tr.mileagePlaceholder}
              min={0}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              {tr.notes}
            </label>
            <textarea
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              rows={3}
              className={`${inputClass()} resize-none`}
              placeholder={tr.notesPlaceholder}
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={form.smsReminder}
                  onChange={e => set("smsReminder", e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.smsReminder ? "bg-amber-400 border-amber-400" : "border-slate-300 group-hover:border-[#111111]/50"}`}>
                  {form.smsReminder && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <span className="flex items-center gap-1.5 text-sm text-slate-700">
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                  {tr.smsReminder}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={e => set("acceptTerms", e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.acceptTerms ? "bg-amber-400 border-amber-400" : errors.acceptTerms ? "border-red-400" : "border-slate-300 group-hover:border-[#111111]/50"}`}>
                  {form.acceptTerms && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-slate-700">
                {tr.acceptTerms} <span className="text-[#C8102E]">*</span>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.acceptTerms}
              </p>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}
        </div>

        {/* ── Summary ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingSummaryCard />
          </div>
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

        {submitting ? (
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(to bottom, #3B82F6, #1D4ED8)",
              color: "#fff", fontWeight: 700, fontSize: "15px",
              padding: "11px 26px", borderRadius: "12px",
              border: "1px solid rgba(30,64,175,0.6)",
              boxShadow: "0 3px 12px rgba(59,130,246,0.30), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(255,255,255,0.25)", borderTopColor: "#fff" }} />
            {tr.bookingInProgress}
          </div>
        ) : (
          <BlueNavButton onClick={handleSubmit}>
            {tr.confirmBooking}
            <ChevronRight className="w-4 h-4" />
          </BlueNavButton>
        )}
      </div>
    </div>
  );
}
