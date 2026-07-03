export type BookingStatus = "submitted" | "quoted" | "confirmed" | "completed" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export type Booking = {
  id: string;
  userEmail: string;
  contact: { name: string; email: string; phone: string };
  destinations: string[];
  travelMonth: string;
  party: string;
  members: number;
  style: { sattvik: boolean; premium: boolean; chandruLed: boolean; notes: string };
  amount: number | null;
  currency: string;
  status: BookingStatus;
  payment: {
    status: PaymentStatus;
    paymentId?: string;
    method?: string;
    last4?: string;
    paidAt?: string;
    razorpayLinkId?: string;
    razorpayLinkUrl?: string;
  };
  submittedAt: string;
  upcoming: boolean;
};

const STORE_KEY = "bhumivox.bookings";

function readAll(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : seedDemo();
  } catch (e) {
    console.warn("bookings-service: failed", e);
    return [];
  }
}

function writeAll(rows: Booking[]) {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(rows));
}

function seedDemo(): Booking[] {
  const demo: Booking[] = [
    {
      id: "bk_demo_001",
      userEmail: "demo@bhumivox.in",
      contact: { name: "Demo Traveller", email: "demo@bhumivox.in", phone: "+91 90000 00001" },
      destinations: ["Kashi", "Ayodhya"],
      travelMonth: "2026-09",
      party: "Family · 3 gen",
      members: 5,
      style: { sattvik: true, premium: true, chandruLed: false, notes: "Elders prefer ground-floor stays." },
      amount: 285000,
      currency: "INR",
      status: "confirmed",
      payment: {
        status: "paid",
        paymentId: "pay_demo_9HxK2",
        method: "card",
        last4: "4242",
        paidAt: "2026-06-14T11:22:00.000Z",
        razorpayLinkId: "plink_demo_001",
        razorpayLinkUrl: "https://rzp.io/i/demoLink001",
      },
      submittedAt: "2026-06-02T09:10:00.000Z",
      upcoming: true,
    },
    {
      id: "bk_demo_002",
      userEmail: "demo@bhumivox.in",
      contact: { name: "Demo Traveller", email: "demo@bhumivox.in", phone: "+91 90000 00001" },
      destinations: ["Braj"],
      travelMonth: "2026-02",
      party: "Couple",
      members: 2,
      style: { sattvik: false, premium: true, chandruLed: true, notes: "" },
      amount: 162000,
      currency: "INR",
      status: "completed",
      payment: {
        status: "paid",
        paymentId: "pay_demo_3Lp7Q",
        method: "upi",
        paidAt: "2026-01-08T07:05:00.000Z",
        razorpayLinkId: "plink_demo_002",
        razorpayLinkUrl: "https://rzp.io/i/demoLink002",
      },
      submittedAt: "2025-12-22T14:30:00.000Z",
      upcoming: false,
    },
    {
      id: "bk_demo_003",
      userEmail: "demo@bhumivox.in",
      contact: { name: "Demo Traveller", email: "demo@bhumivox.in", phone: "+91 90000 00001" },
      destinations: ["Dwarka", "Sri Lanka"],
      travelMonth: "2026-11",
      party: "Small group",
      members: 6,
      style: { sattvik: true, premium: false, chandruLed: false, notes: "Photography focused." },
      amount: null,
      currency: "INR",
      status: "submitted",
      payment: { status: "pending" },
      submittedAt: "2026-06-25T16:00:00.000Z",
      upcoming: true,
    },
  ];
  writeAll(demo);
  return demo;
}

function partyToMembers(party: string): number {
  switch (party) {
    case "Solo": return 1;
    case "Couple": return 2;
    case "Family · 3 gen": return 5;
    case "Small group": return 6;
    default: return 1;
  }
}

function isUpcoming(travelMonth: string): boolean {
  if (!travelMonth) return true;
  const [y, m] = travelMonth.split("-").map(Number);
  if (!y || !m) return true;
  const end = new Date(y, m, 0); // last day of that month
  return end.getTime() >= Date.now();
}

export const bookingsService = {
  async listForUser(email: string): Promise<Booking[]> {
    const all = readAll();
    const target = email.trim().toLowerCase();
    return all
      .filter((b) => b.userEmail.toLowerCase() === target)
      .map((b) => ({ ...b, upcoming: isUpcoming(b.travelMonth) && b.status !== "completed" && b.status !== "cancelled" }))
      .sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1));
  },

  async create(input: {
    userEmail: string;
    contact: { name: string; email: string; phone: string };
    destinations: string[];
    travelMonth: string;
    party: string;
    style: { sattvik: boolean; premium: boolean; chandruLed: boolean; notes: string };
  }): Promise<Booking> {
    const all = readAll();
    const booking: Booking = {
      id: `bk_${Math.random().toString(36).slice(2, 10)}`,
      userEmail: input.userEmail.trim().toLowerCase(),
      contact: input.contact,
      destinations: input.destinations,
      travelMonth: input.travelMonth,
      party: input.party,
      members: partyToMembers(input.party),
      style: input.style,
      amount: null,
      currency: "INR",
      status: "submitted",
      payment: { status: "pending" },
      submittedAt: new Date().toISOString(),
      upcoming: isUpcoming(input.travelMonth),
    };
    all.unshift(booking);
    writeAll(all);
    return booking;
  },
};
