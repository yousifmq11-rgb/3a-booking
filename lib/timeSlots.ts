// Working hours: Mon–Fri 08:00–17:00, 30-min slots, lunch 12:00–12:30

export const WORK_START = "08:00";
export const WORK_END = "17:00";
export const LUNCH_START = "12:00";
export const LUNCH_END = "12:30";
export const SLOT_INTERVAL = 30; // minutes

export interface TimeSlot {
  time: string;       // "HH:MM"
  available: boolean;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function generateAllSlots(): string[] {
  const slots: string[] = [];
  const start = toMinutes(WORK_START);
  const end = toMinutes(WORK_END);
  const lunchStart = toMinutes(LUNCH_START);
  const lunchEnd = toMinutes(LUNCH_END);

  for (let t = start; t < end; t += SLOT_INTERVAL) {
    if (t >= lunchStart && t < lunchEnd) continue;
    slots.push(fromMinutes(t));
  }
  return slots;
}

export function getAvailableSlots(
  date: string,
  bookedTimes: string[],
  serviceDurationMinutes: number
): TimeSlot[] {
  const all = generateAllSlots();
  const bookedSet = new Set(bookedTimes);

  return all.map((time) => {
    if (bookedSet.has(time)) return { time, available: false };

    // Check that all slots needed for the service duration are free
    const startMin = toMinutes(time);
    const endMin = startMin + serviceDurationMinutes;
    const workEnd = toMinutes(WORK_END);

    if (endMin > workEnd) return { time, available: false };

    // Check intermediate slots are also free
    let blocked = false;
    for (let t = startMin; t < endMin; t += SLOT_INTERVAL) {
      const slot = fromMinutes(t);
      if (bookedSet.has(slot)) {
        blocked = true;
        break;
      }
      // Also skip lunch-blocked slots in duration span
      const lStart = toMinutes(LUNCH_START);
      const lEnd = toMinutes(LUNCH_END);
      if (t >= lStart && t < lEnd) {
        blocked = true;
        break;
      }
    }

    return { time, available: !blocked };
  });
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function formatDateForDB(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateDisplay(date: Date, lang: "fi" | "en"): string {
  const locale = lang === "fi" ? "fi-FI" : "en-GB";
  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDuration(minutes: number, lang: "fi" | "en"): string {
  if (minutes < 60) return lang === "fi" ? `${minutes} min` : `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return lang === "fi" ? `${h} h` : `${h} h`;
  return lang === "fi" ? `${h} h ${m} min` : `${h} h ${m} min`;
}
