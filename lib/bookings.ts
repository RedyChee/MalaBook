export type Booking = {
  id: string;
  type: "solo" | "group";
  participantIds: string[]; // matched users (current user implicit)
  restaurantId: string;
  when: string; // e.g. "Sat 7pm"
  caption: string; // e.g. "Weekend numb"
  createdAt: number;
  completedAt?: number;
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

export function markBookingCompleted(id: string): void {
  if (!isClient()) return;
  const all = listBookings();
  const i = all.findIndex((b) => b.id === id);
  if (i < 0) return;
  all[i] = { ...all[i], completedAt: Date.now() };
  sessionStorage.setItem(KEY, JSON.stringify(all));
}

export function cancelBooking(id: string): void {
  if (!isClient()) return;
  const remaining = listBookings().filter((b) => b.id !== id);
  sessionStorage.setItem(KEY, JSON.stringify(remaining));
}

const SEED_FLAG_KEY = "malabook:demo-seeded";

// One-shot demo helper: seeds a "we already went" booking so the feedback loop
// has something to act on at t=0. Idempotent per browser session.
export function seedDemoCompletedBooking(opts: {
  matchedUserId: string;
  restaurantId: string;
}): void {
  if (!isClient()) return;
  if (sessionStorage.getItem(SEED_FLAG_KEY)) return;
  const id = makeBookingId("solo", [opts.matchedUserId]);
  if (bookingById(id)) {
    sessionStorage.setItem(SEED_FLAG_KEY, "1");
    return;
  }
  const yesterday = Date.now() - 24 * 60 * 60 * 1000;
  const booking: Booking = {
    id,
    type: "solo",
    participantIds: [opts.matchedUserId],
    restaurantId: opts.restaurantId,
    when: "Last Sat 7pm",
    caption: "The one we went on",
    createdAt: yesterday - 60_000,
    completedAt: yesterday,
  };
  saveBooking(booking);
  sessionStorage.setItem(SEED_FLAG_KEY, "1");
}
