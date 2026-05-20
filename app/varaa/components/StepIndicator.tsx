"use client";

import { useBooking } from "../BookingFlow";
import { t } from "@/lib/i18n";
import { Check } from "lucide-react";

interface Props {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: Props) {
  const { lang } = useBooking();
  const tr = t(lang);

  return (
    <div className="w-full">
      <div className="flex items-center">
        {tr.steps.map((label, i) => {
          const isDone   = i < currentStep;
          const isActive = i === currentStep;
          const isLast   = i === tr.steps.length - 1;

          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              {/* Step node */}
              <div className="flex flex-col items-center gap-2">
                {/* Circle */}
                <div className="relative flex items-center justify-center">
                  {/* Outer glow ring for active */}
                  {isActive && (
                    <div
                      className="absolute rounded-full"
                      style={{
                        inset: "-5px",
                        background: "rgba(244,194,0,0.12)",
                        border: "1.5px solid rgba(244,194,0,0.30)",
                      }}
                    />
                  )}
                  <div
                    className="relative flex items-center justify-center rounded-full"
                    style={{
                      width:      isActive ? "40px" : isDone ? "36px" : "34px",
                      height:     isActive ? "40px" : isDone ? "36px" : "34px",
                      background: isDone
                        ? "#111111"
                        : isActive
                        ? "#F4C200"
                        : "#EFEFEF",
                      boxShadow: isActive
                        ? "0 3px 16px rgba(244,194,0,0.45)"
                        : isDone
                        ? "0 2px 8px rgba(0,0,0,0.18)"
                        : "none",
                      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                    ) : (
                      <span
                        style={{
                          fontSize: isActive ? "15px" : "14px",
                          fontWeight: 900,
                          color: isActive ? "#000" : "#9CA3AF",
                          lineHeight: 1,
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>
                </div>

                {/* Label */}
                <span
                  className="hidden sm:block text-center whitespace-nowrap"
                  style={{
                    fontSize:   isActive ? "13px" : "12px",
                    fontWeight: isActive ? 700 : isDone ? 600 : 500,
                    color:      isActive ? "#111111" : isDone ? "#6B7280" : "#BDBDBD",
                    transition: "all 0.2s",
                    letterSpacing: isActive ? "0.02em" : "0.01em",
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Connector track */}
              {!isLast && (
                <div
                  className="flex-1 mx-2 sm:mx-3 rounded-full overflow-hidden"
                  style={{ height: "2px", background: "#EFEFEF", marginBottom: "22px" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: isDone ? "100%" : "0%",
                      background: "linear-gradient(90deg, #111111, #555555)",
                      transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: current step name */}
      <p className="sm:hidden text-center mt-3" style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>
        {tr.steps[currentStep]}
        <span style={{ color: "#9CA3AF", fontWeight: 400, fontSize: "13px", marginLeft: "6px" }}>
          {currentStep + 1}/{tr.steps.length}
        </span>
      </p>
    </div>
  );
}
