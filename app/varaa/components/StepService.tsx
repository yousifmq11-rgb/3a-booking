"use client";

import { useEffect, useState } from "react";
import { useBooking } from "../BookingFlow";
import { t } from "@/lib/i18n";
import type { Service } from "@/lib/supabase";
import { formatDuration } from "@/lib/timeSlots";
import {
  Wrench, Disc, Zap, Settings, Car,
  Shield, AlertTriangle, CheckCircle, Clock, Check,
  Droplets, Battery, Search, Wind, Star,
} from "lucide-react";

interface Props { onNext: () => void; preselectedId: number | null; }

const STATIC_SERVICES: Service[] = [
  { id: 2,  name_fi: "Öljynvaihto + suodatin",           name_en: "Oil Change + Filter",            category_fi: "Huolto",                 category_en: "Maintenance",              duration_minutes: 60,  price: 110,  price_on_request: false, is_popular: false, icon: "droplets" },
  { id: 3,  name_fi: "Määräaikaishuolto (perus)",         name_en: "Basic Service",                  category_fi: "Huolto",                 category_en: "Maintenance",              duration_minutes: 90,  price: 189,  price_on_request: false, is_popular: false, icon: "settings" },
  { id: 4,  name_fi: "Määräaikaishuolto (laaja)",         name_en: "Full Service",                   category_fi: "Huolto",                 category_en: "Maintenance",              duration_minutes: 120, price: 289,  price_on_request: false, is_popular: false, icon: "star" },
  { id: 5,  name_fi: "Renkaiden vaihto (vanteille)",      name_en: "Tyre Change (on rims)",          category_fi: "Renkaat",                category_en: "Tires",                    duration_minutes: 45,  price: 80,   price_on_request: false, is_popular: false, icon: "disc" },
  { id: 6,  name_fi: "Renkaiden vaihto + tasapainotus",   name_en: "Tyre Change + Balancing",        category_fi: "Renkaat",                category_en: "Tires",                    duration_minutes: 60,  price: 99,   price_on_request: false, is_popular: false, icon: "disc" },
  { id: 8,  name_fi: "Jarrulevyt etu",                    name_en: "Front Brake Discs",              category_fi: "Jarrut & Jousitus",      category_en: "Brakes & Suspension",      duration_minutes: 90,  price: 220,  price_on_request: false, is_popular: false, icon: "alert" },
  { id: 9,  name_fi: "Jarrulevyt taka",                   name_en: "Rear Brake Discs",               category_fi: "Jarrut & Jousitus",      category_en: "Brakes & Suspension",      duration_minutes: 90,  price: 200,  price_on_request: false, is_popular: false, icon: "alert" },
  { id: 10, name_fi: "Jarrulevyt etu + taka",             name_en: "Front + Rear Brake Discs",       category_fi: "Jarrut & Jousitus",      category_en: "Brakes & Suspension",      duration_minutes: 150, price: 380,  price_on_request: false, is_popular: false, icon: "alert" },
  { id: 11, name_fi: "Jarrutarkastus (ilmainen)",         name_en: "Brake Inspection (free)",        category_fi: "Jarrut & Jousitus",      category_en: "Brakes & Suspension",      duration_minutes: 30,  price: 0,    price_on_request: false, is_popular: false, icon: "check-circle" },
  { id: 12, name_fi: "Iskunvaimentimien tarkastus",       name_en: "Shock Absorber Inspection",      category_fi: "Jarrut & Jousitus",      category_en: "Brakes & Suspension",      duration_minutes: 45,  price: 60,   price_on_request: false, is_popular: false, icon: "wrench" },
  { id: 13, name_fi: "Jakohihnan vaihto",                 name_en: "Timing Belt Replacement",        category_fi: "Moottorin korjaukset",   category_en: "Engine Repairs",           duration_minutes: 300, price: null, price_on_request: true,  is_popular: false, icon: "wrench" },
  { id: 14, name_fi: "Jakohihna + vesipumppu",            name_en: "Timing Belt + Water Pump",       category_fi: "Moottorin korjaukset",   category_en: "Engine Repairs",           duration_minutes: 360, price: null, price_on_request: true,  is_popular: false, icon: "wrench" },
  { id: 15, name_fi: "Vesipumpun vaihto",                 name_en: "Water Pump Replacement",         category_fi: "Moottorin korjaukset",   category_en: "Engine Repairs",           duration_minutes: 120, price: 290,  price_on_request: false, is_popular: false, icon: "droplets" },
  { id: 16, name_fi: "Sytytystulpat (4 syl.)",            name_en: "Spark Plugs (4 cyl.)",           category_fi: "Moottorin korjaukset",   category_en: "Engine Repairs",           duration_minutes: 45,  price: 120,  price_on_request: false, is_popular: false, icon: "zap" },
  { id: 17, name_fi: "Sytytystulpat (6 syl.)",            name_en: "Spark Plugs (6 cyl.)",           category_fi: "Moottorin korjaukset",   category_en: "Engine Repairs",           duration_minutes: 60,  price: 180,  price_on_request: false, is_popular: false, icon: "zap" },
  { id: 18, name_fi: "Vianhaku + OBD-diagnostiikka",      name_en: "Fault Scan + OBD Diagnostics",   category_fi: "Sähkö & Diagnostiikka", category_en: "Electrical & Diagnostics", duration_minutes: 60,  price: 95,   price_on_request: false, is_popular: false, icon: "search" },
  { id: 19, name_fi: "Akun vaihto + testi",               name_en: "Battery Replacement + Test",     category_fi: "Sähkö & Diagnostiikka", category_en: "Electrical & Diagnostics", duration_minutes: 30,  price: 180,  price_on_request: false, is_popular: false, icon: "battery" },
  { id: 20, name_fi: "Valojen tarkastus + vaihto",        name_en: "Light Inspection + Replacement", category_fi: "Sähkö & Diagnostiikka", category_en: "Electrical & Diagnostics", duration_minutes: 30,  price: 45,   price_on_request: false, is_popular: false, icon: "zap" },
  { id: 21, name_fi: "Käynnistysmoottori / Laturi",       name_en: "Starter Motor / Alternator",     category_fi: "Sähkö & Diagnostiikka", category_en: "Electrical & Diagnostics", duration_minutes: 120, price: null, price_on_request: true,  is_popular: false, icon: "zap" },
  { id: 22, name_fi: "Ilmastoinnin huolto (AC)",          name_en: "AC Service",                     category_fi: "Lisäpalvelut",           category_en: "Additional Services",      duration_minutes: 60,  price: 120,  price_on_request: false, is_popular: false, icon: "wind" },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  shield:        <Shield        className="w-6 h-6" />,
  disc:          <Disc          className="w-6 h-6" />,
  zap:           <Zap           className="w-6 h-6" />,
  settings:      <Settings      className="w-6 h-6" />,
  car:           <Car           className="w-6 h-6" />,
  alert:         <AlertTriangle className="w-6 h-6" />,
  wrench:        <Wrench        className="w-6 h-6" />,
  "check-circle":<CheckCircle   className="w-6 h-6" />,
  droplets:      <Droplets      className="w-6 h-6" />,
  battery:       <Battery       className="w-6 h-6" />,
  search:        <Search        className="w-6 h-6" />,
  wind:          <Wind          className="w-6 h-6" />,
  star:          <Star          className="w-6 h-6" />,
};

const CATEGORY_STYLE: Record<string, { color: string; bg: string; accent: string }> = {
  "Huolto":                  { color: "#1C1C1E", bg: "#F5F5F7", accent: "#636366" },
  "Maintenance":             { color: "#1C1C1E", bg: "#F5F5F7", accent: "#636366" },
  "Renkaat":                 { color: "#1D4ED8", bg: "#EFF6FF", accent: "#3B82F6" },
  "Tires":                   { color: "#1D4ED8", bg: "#EFF6FF", accent: "#3B82F6" },
  "Jarrut & Jousitus":       { color: "#9B1C1C", bg: "#FEF2F2", accent: "#EF4444" },
  "Brakes & Suspension":     { color: "#9B1C1C", bg: "#FEF2F2", accent: "#EF4444" },
  "Moottorin korjaukset":    { color: "#5B21B6", bg: "#F5F3FF", accent: "#8B5CF6" },
  "Engine Repairs":          { color: "#5B21B6", bg: "#F5F3FF", accent: "#8B5CF6" },
  "Sähkö & Diagnostiikka":   { color: "#0C4A6E", bg: "#F0F9FF", accent: "#0EA5E9" },
  "Electrical & Diagnostics":{ color: "#0C4A6E", bg: "#F0F9FF", accent: "#0EA5E9" },
  "Lisäpalvelut":            { color: "#064E3B", bg: "#ECFDF5", accent: "#10B981" },
  "Additional Services":     { color: "#064E3B", bg: "#ECFDF5", accent: "#10B981" },
};

function BlueButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        borderRadius: "12px",
        background: pressed
          ? "linear-gradient(to bottom, #1D4ED8, #60A5FA)"
          : "linear-gradient(to bottom, #3B82F6, #1D4ED8)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "15px",
        padding: "11px 26px",
        border: "1px solid rgba(30,64,175,0.6)",
        boxShadow: pressed
          ? "0 1px 3px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.12)"
          : hovered
          ? "0 6px 20px rgba(59,130,246,0.45), 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.20)"
          : "0 3px 12px rgba(59,130,246,0.30), 0 1px 4px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.18)",
        transform: pressed ? "translateY(2px) scale(0.98)" : "translateY(0) scale(1)",
        transition: "all 0.18s cubic-bezier(0.1,0.4,0.2,1)",
        outline: "none",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        filter: hovered && !pressed ? "brightness(1.08)" : "none",
      }}
    >
      {children}
    </button>
  );
}

export default function StepService({ onNext, preselectedId }: Props) {
  const { lang, selectedServices, setSelectedServices } = useBooking();
  const tr = t(lang);

  useEffect(() => {
    if (preselectedId) {
      const found = STATIC_SERVICES.find((s) => s.id === preselectedId);
      if (found) setSelectedServices([found]);
    }
  }, [preselectedId, setSelectedServices]);

  const categories = lang === "fi"
    ? ["Huolto", "Renkaat", "Jarrut & Jousitus", "Moottorin korjaukset", "Sähkö & Diagnostiikka", "Lisäpalvelut"]
    : ["Maintenance", "Tires", "Brakes & Suspension", "Engine Repairs", "Electrical & Diagnostics", "Additional Services"];

  const isSelected = (s: Service) => selectedServices.some((x) => x.id === s.id);

  function toggleService(service: Service) {
    setSelectedServices(
      isSelected(service)
        ? selectedServices.filter((s) => s.id !== service.id)
        : [...selectedServices, service]
    );
  }

  function formatPrice(s: Service) {
    if (s.price_on_request) return tr.priceOnRequest;
    if (s.price === 0) return tr.free;
    const prefix = lang === "fi" ? "alkaen " : "from ";
    return `${prefix}€${s.price}`;
  }

  function approxDuration(minutes: number) {
    const base = formatDuration(minutes, lang);
    const prefix = lang === "fi" ? "noin " : "approx. ";
    return `${prefix}${base}`;
  }

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice    = selectedServices.reduce((sum, s) => (s.price ?? 0) + sum, 0);
  const hasOnRequest  = selectedServices.some((s) => s.price_on_request);
  const active        = selectedServices.length > 0;

  return (
    <>
      <div className="space-y-10 pb-4">

        {/* Header */}
        <div>
          <p className="text-[13px] font-black uppercase tracking-[0.22em] text-amber-500 mb-2">
            {lang === "fi" ? "Vaihe 1 / 3" : "Step 1 / 3"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            {tr.chooseService}
          </h1>
          <p className="text-gray-400 mt-2 text-base">{tr.chooseServiceSub}</p>
        </div>

        {/* Categories */}
        {categories.map((cat) => {
          const catServices = STATIC_SERVICES.filter((s) =>
            lang === "fi" ? s.category_fi === cat : s.category_en === cat
          );
          if (!catServices.length) return null;
          const style = CATEGORY_STYLE[cat] ?? { color: "#1C1C1E", bg: "#F5F5F7", accent: "#636366" };

          return (
            <div key={cat} className="space-y-4">
              {/* Category header */}
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 rounded-full flex-shrink-0" style={{ background: style.accent }} />
                <span
                  className="text-base font-black uppercase tracking-[0.12em]"
                  style={{ color: style.color }}
                >
                  {cat}
                </span>
                <div className="flex-1 h-px" style={{ background: `${style.accent}22` }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                  style={{ background: style.bg, color: style.accent }}
                >
                  {catServices.length}
                </span>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catServices.map((service) => {
                  const sel  = isSelected(service);
                  const name = lang === "fi" ? service.name_fi : service.name_en;

                  return (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className="group relative text-left rounded-2xl p-4 outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      style={{
                        background: sel ? "#FFFDF0" : "#ffffff",
                        border: sel
                          ? "1.5px solid rgba(196,148,16,0.55)"
                          : "1.5px solid rgba(0,0,0,0.07)",
                        boxShadow: sel
                          ? "0 0 0 3px rgba(244,194,0,0.10), 0 4px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)"
                          : "0 1px 4px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
                        transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
                        transform: sel ? "translateY(-1px)" : "translateY(0)",
                        WebkitTapHighlightColor: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!sel) {
                          const el = e.currentTarget as HTMLElement;
                          el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)";
                          el.style.transform = "translateY(-2px)";
                          el.style.border = "1.5px solid rgba(0,0,0,0.12)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!sel) {
                          const el = e.currentTarget as HTMLElement;
                          el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)";
                          el.style.transform = "translateY(0)";
                          el.style.border = "1.5px solid rgba(0,0,0,0.07)";
                        }
                      }}
                    >
                      {/* Left amber bar when selected */}
                      <div
                        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
                        style={{ background: sel ? "#F4C200" : "transparent", transition: "background 0.15s" }}
                      />

                      {/* Popular badge */}
                      {service.is_popular && (
                        <span
                          className="absolute -top-2.5 left-4 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                          style={{
                            background: "linear-gradient(to bottom, #FFEBA0, #C49010)",
                            color: "#1A0E00",
                            boxShadow: "0 1px 4px rgba(196,148,16,0.4), inset 0 1px 0 rgba(255,255,255,0.5)",
                          }}
                        >
                          {tr.popular}
                        </span>
                      )}

                      {/* Icon + checkbox */}
                      <div className="flex items-start justify-between mb-3.5">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: sel ? "rgba(244,194,0,0.14)" : style.bg,
                            color: sel ? "#92400E" : style.color,
                            transition: "all 0.15s",
                            boxShadow: sel ? "inset 0 1px 0 rgba(255,255,255,0.6)" : "none",
                          }}
                        >
                          {ICON_MAP[service.icon ?? "wrench"]}
                        </div>

                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background:  sel ? "linear-gradient(to bottom, #FFEBA0, #C49010)" : "#fff",
                            border:      sel ? "none" : "1.5px solid rgba(0,0,0,0.15)",
                            boxShadow:   sel
                              ? "0 2px 8px rgba(196,148,16,0.5), inset 0 1px 0 rgba(255,255,255,0.5)"
                              : "inset 0 1px 0 rgba(255,255,255,0.8)",
                            transform:   sel ? "scale(1.1)" : "scale(1)",
                            transition:  "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                          }}
                        >
                          {sel && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                        </div>
                      </div>

                      {/* Name */}
                      <p className="text-[15px] font-bold text-gray-900 leading-snug mb-2.5 pr-1">
                        {name}
                      </p>

                      {/* Duration + Price */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 font-medium">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          {approxDuration(service.duration_minutes)}
                        </span>
                        <span
                          className="text-[14px] font-black tabular-nums"
                          style={{
                            color: service.price_on_request
                              ? "#92400E"
                              : service.price === 0
                              ? "#065F46"
                              : sel ? "#7A5800" : "#111111",
                          }}
                        >
                          {formatPrice(service)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Floating pill bar (macOS dock style) ── */}
      <div
        className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-4"
        style={{
          pointerEvents: active ? "auto" : "none",
          transform: active ? "translateY(0) scale(1)" : "translateY(130%) scale(0.94)",
          transition: "transform 0.44s cubic-bezier(0.34, 1.56, 0.64, 1)",
          willChange: "transform",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "660px",
            borderRadius: "20px",
            background: "rgba(22, 22, 22, 0.94)",
            backdropFilter: "blur(36px)",
            WebkitBackdropFilter: "blur(36px)",
            border: "1px solid rgba(255, 255, 255, 0.13)",
            boxShadow: `
              0 24px 56px rgba(0,0,0,0.48),
              0 8px 22px rgba(0,0,0,0.30),
              inset 0 1px 0 rgba(255,255,255,0.13),
              inset 0 -1px 0 rgba(0,0,0,0.22)
            `,
            padding: "12px 12px 12px 18px",
          }}
        >
          <div className="flex items-center justify-between gap-3">

            {/* Left info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Count badge */}
              <div
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  background: "linear-gradient(to bottom, #3B82F6, #1D4ED8)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "14px",
                  minWidth: "32px",
                  height: "32px",
                  padding: "0 10px",
                  boxShadow: "0 2px 8px rgba(59,130,246,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
                  textShadow: "none",
                }}
              >
                {selectedServices.length}
              </div>

              {/* Divider */}
              <div style={{ height: "36px", width: "1px", background: "rgba(255,255,255,0.09)", flexShrink: 0 }} />

              {/* Stats block */}
              <div className="flex flex-col justify-center min-w-0 gap-0.5">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 text-white font-semibold tabular-nums" style={{ fontSize: "15px" }}>
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#60A5FA" }} />
                    {approxDuration(totalDuration)}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.16)", fontSize: "14px" }}>·</span>
                  <span
                    className="font-black tabular-nums"
                    style={{ fontSize: "16px", color: hasOnRequest ? "#FCD34D" : "#fff" }}
                  >
                    {hasOnRequest ? `€${totalPrice}+` : `€${totalPrice}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                  {selectedServices.slice(0, 2).map((s, i) => (
                    <span key={s.id} className="flex items-center gap-1 min-w-0 flex-shrink">
                      {i > 0 && <span style={{ color: "rgba(255,255,255,0.16)", fontSize: "11px" }}>·</span>}
                      <span
                        className="truncate"
                        style={{ color: "rgba(255,255,255,0.38)", fontSize: "12px", maxWidth: "140px", fontWeight: 500 }}
                      >
                        {lang === "fi" ? s.name_fi : s.name_en}
                      </span>
                    </span>
                  ))}
                  {selectedServices.length > 2 && (
                    <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "12px", flexShrink: 0 }}>
                      {" "}+{selectedServices.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Blue CTA */}
            <BlueButton onClick={onNext}>
              {lang === "fi" ? "Jatka" : "Continue"}
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </BlueButton>

          </div>
        </div>
      </div>
    </>
  );
}
