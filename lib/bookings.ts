export type Booking = {
  id: string;
  type: "solo" | "group";
  participantIds: string[]; // matched users (current user implicit)
  restaurantId: string;
  when: string; // e.g. "Sat 7pm"
  caption: string; // e.g. "Weekend numb"
  createdAt: number;
};

export type TimeOption = {
  id: string;
  label: string;
  caption: string;
  emoji: string;
};

export const TIME_OPTIONS: TimeOption[] = [
  { id: "fri-8", label: "Fri 8pm", caption: "After-work fix", emoji: "🍲" },
  { id: "sat-7", label: "Sat 7pm", caption: "Weekend numb", emoji: "🌶️" },
  { id: "sun-6", label: "Sun 6pm", caption: "Sunday reset", emoji: "✨" },
];

const KEY = "malabook:bookings";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function listBookings(): Booking[] {
  if (!isClient()) return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as Booking[]) : [];
  } catch {
    return [];
  }
}

export function saveBooking(b: Booking): void {
  if (!isClient()) return;
  const all = listBookings().filter((x) => x.id !== b.id);
  all.push(b);
  sessionStorage.setItem(KEY, JSON.stringify(all));
}

export function bookingForUser(userId: string): Booking | null {
  return listBookings().find((b) => b.participantIds.includes(userId)) ?? null;
}

export function makeBookingId(type: "solo" | "group", participantIds: string[]): string {
  return `${type}:${[...participantIds].sort().join(",")}`;
}

// Group session URL slug: includes time + sorted member IDs. Reused as booking id.
export function makeGroupSessionId(memberIds: string[], timeId: string): string {
  return `${timeId}__${[...memberIds].sort().join("-")}`;
}

export function parseGroupSessionId(sessionId: string): { timeId: string; memberIds: string[] } | null {
  const idx = sessionId.indexOf("__");
  if (idx < 0) return null;
  const timeId = sessionId.slice(0, idx);
  const rest = sessionId.slice(idx + 2);
  const memberIds = rest.split("-").filter(Boolean);
  if (!timeId || memberIds.length === 0) return null;
  return { timeId, memberIds };
}

export function bookingById(id: string): Booking | null {
  return listBookings().find((b) => b.id === id) ?? null;
}
