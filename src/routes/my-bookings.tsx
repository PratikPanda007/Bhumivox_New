import { useEffect, useMemo, useState } from "react";
import { Section } from "@/components/Section";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";
import { bookingsService, type Booking } from "@/services/bookings-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const PAGE_SIZE = 5;

function formatCurrency(amount: number | null, currency = "INR") {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatMonth(m: string) {
  if (!m) return "—";
  const [y, mm] = m.split("-").map(Number);
  if (!y || !mm) return m;
  return new Date(y, mm - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function statusTone(status: Booking["status"]): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "confirmed":
    case "completed":
      return "default";
    case "quoted":
    case "submitted":
      return "secondary";
    case "cancelled":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
}

function BookingRow({ b, onOpen }: { b: Booking; onOpen: (b: Booking) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(b)}
      className="grid w-full grid-cols-12 items-center gap-4 border-b border-border/60 px-4 py-5 text-left transition-colors hover:bg-muted"
    >
      <div className="col-span-12 md:col-span-5">
        <div className="font-serif text-lg text-ivory">{b.destinations.join(" · ") || "Open journey"}</div>
        <div className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          {formatMonth(b.travelMonth)} · {b.id}
        </div>
      </div>
      <div className="col-span-4 text-sm md:col-span-2">
        <div className="text-muted-foreground">Members</div>
        <div className="text-ivory">{b.members}</div>
      </div>
      <div className="col-span-4 text-sm md:col-span-3">
        <div className="text-muted-foreground">Total</div>
        <div className="text-ivory">{formatCurrency(b.amount, b.currency)}</div>
      </div>
      <div className="col-span-4 flex justify-end md:col-span-2">
        <Badge variant={statusTone(b.status)} className="uppercase tracking-[0.18em]">
          {b.status}
        </Badge>
      </div>
    </button>
  );
}

function BookingDetail({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {booking && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {booking.destinations.join(" · ") || "Open journey"}
              </DialogTitle>
              <DialogDescription>
                Booking <span className="font-mono">{booking.id}</span> · submitted {formatDate(booking.submittedAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Travel month" value={formatMonth(booking.travelMonth)} />
              <Detail label="Companions" value={booking.party || "—"} />
              <Detail label="Members" value={String(booking.members)} />
              <Detail label="Status" value={booking.status} />
              <Detail label="Sattvik kitchen" value={booking.style.sattvik ? "Yes" : "No"} />
              <Detail label="Premium comfort" value={booking.style.premium ? "Yes" : "No"} />
              <Detail label="Chandru-led" value={booking.style.chandruLed ? "Yes" : "No"} />
              <Detail label="Total amount" value={formatCurrency(booking.amount, booking.currency)} />
            </div>

            {booking.style.notes && (
              <div className="border-t border-border/60 pt-4">
                <div className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">Notes</div>
                <p className="mt-1 text-sm text-foreground">{booking.style.notes}</p>
              </div>
            )}

            <div className="border-t border-border/60 pt-4">
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                Payment details
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <Detail label="Payment status" value={booking.payment.status} />
                <Detail label="Amount" value={formatCurrency(booking.amount, booking.currency)} />
                <Detail label="Method" value={booking.payment.method || "—"} />
                <Detail label="Card last 4" value={booking.payment.last4 || "—"} />
                <Detail label="Payment ID" value={booking.payment.paymentId || "—"} />
                <Detail label="Paid at" value={booking.payment.paidAt ? formatDate(booking.payment.paidAt) : "—"} />
                <Detail
                  label="Razorpay link"
                  value={
                    booking.payment.razorpayLinkUrl ? (
                      <a
                        href={booking.payment.razorpayLinkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline"
                      >
                        Open link
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <Detail label="Link ID" value={booking.payment.razorpayLinkId || "—"} />
              </div>
              <p className="mt-3 text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                Razorpay activation pending — payment IDs shown are placeholders.
              </p>
            </div>

            <div className="border-t border-border/60 pt-4">
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">Contact</div>
              <p className="mt-1 text-sm">
                {booking.contact.name} · {booking.contact.email} · {booking.contact.phone}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-foreground">{value}</div>
    </div>
  );
}

function MyBookingsInner() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user) return;
    bookingsService.listForUser(user.email).then((rows) => {
      setBookings(rows);
      setLoading(false);
    });
  }, [user]);

  const upcoming = useMemo(() => bookings.filter((b) => b.upcoming).slice(0, 3), [bookings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) => {
      const hay = [
        b.id,
        b.destinations.join(" "),
        b.travelMonth,
        b.party,
        b.status,
        b.payment.paymentId ?? "",
        b.contact.name,
        b.contact.email,
        String(b.amount ?? ""),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [bookings, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Section className="pt-32">
      <span className="eyebrow">Your Travel</span>
      <h1 className="mt-3 font-serif text-5xl">My Bookings</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Track upcoming pilgrimages, review past journeys, and check payment status — all in one place.
      </p>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading your bookings…</p>
      ) : bookings.length === 0 ? (
        <div className="mt-16 border border-dashed border-border p-16 text-center">
          <p className="text-sm text-muted-foreground">You have no bookings yet.</p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mt-14">
              <div className="flex items-end justify-between">
                <h2 className="font-serif text-2xl">Upcoming</h2>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {upcoming.length} active
                </span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {upcoming.map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className="border border-border/60 bg-card p-6 text-left transition-colors hover:border-primary"
                  >
                    <Badge variant={statusTone(b.status)} className="uppercase tracking-[0.18em]">
                      {b.status}
                    </Badge>
                    <h3 className="mt-4 font-serif text-xl">{b.destinations.join(" · ") || "Open journey"}</h3>
                    <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                      {formatMonth(b.travelMonth)}
                    </p>
                    <div className="mt-6 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{b.members} members</span>
                      <span className="text-ivory">{formatCurrency(b.amount, b.currency)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All */}
          <div className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-serif text-2xl">All bookings</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search destination, status, ID…"
                  className="w-72 border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-6 border border-border/60 bg-card">
              <div className="hidden grid-cols-12 gap-4 border-b border-border/60 bg-muted px-4 py-3 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground md:grid">
                <div className="col-span-5">Destinations</div>
                <div className="col-span-2">Members</div>
                <div className="col-span-3">Total</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
              {paged.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">No bookings match your search.</p>
              ) : (
                paged.map((b) => <BookingRow key={b.id} b={b} onOpen={setSelected} />)
              )}
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border border-border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.22em] hover:bg-muted disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="font-mono">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border border-border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.22em] hover:bg-muted disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <BookingDetail booking={selected} onClose={() => setSelected(null)} />
    </Section>
  );
}

export default function MyBookingsPage() {
  useSeo({ title: "My Bookings — Bhumivox", description: "Your upcoming and past Bhumivox journeys." });
  return (
    <RequireAuth>
      <MyBookingsInner />
    </RequireAuth>
  );
}
