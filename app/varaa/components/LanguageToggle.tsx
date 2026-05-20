"use client";

import { useBooking } from "../BookingFlow";

export default function LanguageToggle() {
  const { lang, setLang } = useBooking();

  return (
    <div className="flex items-center rounded-xl p-1 gap-0.5" style={{ background: "rgba(255,255,255,0.1)" }}>
      {(["fi", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 uppercase
            ${lang === l
              ? "bg-amber-400 text-black shadow-sm"
              : "text-white/60 hover:text-white"
            }
          `}
          aria-label={l === "fi" ? "Finnish" : "English"}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
