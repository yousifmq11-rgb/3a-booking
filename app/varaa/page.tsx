import { Suspense } from "react";
import BookingFlow from "./BookingFlow";

export const metadata = {
  title: "Varaa aika | 3A Service Espoo",
  description:
    "Varaa autohuoltoaika verkossa. 3A Service autokorjaamo Espoossa, Sillankorva 8.",
};

export default function VaraaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-[#0F4C81]/20 border-t-[#0F4C81] animate-spin" />
            <p className="text-[#0F4C81] text-sm font-medium">Ladataan...</p>
          </div>
        </div>
      }
    >
      <BookingFlow />
    </Suspense>
  );
}
