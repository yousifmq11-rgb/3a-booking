"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useSearchParams } from "next/navigation";
import type { Service } from "@/lib/supabase";
import type { Lang } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import LanguageToggle from "./components/LanguageToggle";
import StepIndicator from "./components/StepIndicator";
import StepService from "./components/StepService";
import StepDateTime from "./components/StepDateTime";
import StepCustomer from "./components/StepCustomer";
import StepSuccess from "./components/StepSuccess";

// ─── Context ──────────────────────────────────────────────────────────────────

interface BookingContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  step: number;
  setStep: (s: number) => void;
  selectedServices: Service[];
  setSelectedServices: (s: Service[]) => void;
  selectedDate: Date | null;
  setSelectedDate: (d: Date | null) => void;
  selectedTime: string | null;
  setSelectedTime: (t: string | null) => void;
  bookingRef: string;
  setBookingRef: (r: string) => void;
  customerName: string;
  setCustomerName: (n: string) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingFlow");
  return ctx;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingFlow() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>("fi");
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState("");
  const [customerName, setCustomerName] = useState("");

  const preselectedServiceId = searchParams.get("service");
  const tr = t(lang);

  const goNext = () => setStep((s) => Math.min(s + 1, 3));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  useEffect(() => {
    if (preselectedServiceId && step === 0 && selectedServices.length > 0) {
      setStep(1);
    }
  }, [selectedServices, preselectedServiceId, step]);

  const stepComponents = [
    <StepService key="service" onNext={goNext} preselectedId={preselectedServiceId ? Number(preselectedServiceId) : null} />,
    <StepDateTime key="datetime" onNext={goNext} onBack={goBack} />,
    <StepCustomer key="customer" onNext={goNext} onBack={goBack} />,
    <StepSuccess key="success" />,
  ];

  return (
    <BookingContext.Provider
      value={{
        lang, setLang,
        step, setStep,
        selectedServices, setSelectedServices,
        selectedDate, setSelectedDate,
        selectedTime, setSelectedTime,
        bookingRef, setBookingRef,
        customerName, setCustomerName,
      }}
    >
      <div className="min-h-screen bg-background">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-50"
          style={{
            background: "rgba(12, 12, 12, 0.95)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {/* Amber accent line at very top */}
          <div style={{ height: "2px", background: "linear-gradient(90deg, transparent 0%, #F4C200 40%, #F4C200 60%, transparent 100%)" }} />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <img src="/logo.png" alt="3A Service OY" className="h-9 w-auto object-contain" />
            <div className="flex items-center gap-5">
              <a
                href={`tel:${tr.shopPhone.replace(/\s/g, "")}`}
                className="hidden sm:flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {tr.shopPhone}
              </a>
              <LanguageToggle />
            </div>
          </div>
        </header>

        {/* Step Indicator */}
        {step < 3 && (
          <div style={{ background: "#ffffff", borderBottom: "1px solid #F0F0F0" }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
              <StepIndicator currentStep={step} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={`max-w-5xl mx-auto px-4 sm:px-6 py-8 ${step === 0 ? "pb-36" : ""}`}>
          <div key={step} className="animate-fade-up" style={{ animationDuration: "0.35s" }}>
            {stepComponents[step]}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-400 text-sm">© 2025 3A Service Oy · {tr.address}</p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <a href="tel:+358449773677" className="hover:text-brand-dark transition-colors font-medium">+358 44 977 3677</a>
              <span>·</span>
              <a href="https://wa.me/358449773677" className="hover:text-brand-dark transition-colors font-medium" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>
        </footer>
      </div>
    </BookingContext.Provider>
  );
}
