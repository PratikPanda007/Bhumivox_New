import { useEffect, useMemo, useState } from "react";
import { Section } from "@/components/Section";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";
import { bookingApi, groupBookings, type BookingGroup } from "@/services/bookingApi";
import type { Booking } from "@/services/bookings-service";
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

function BookingGroupDetail({
  group,
  onClose,
}: {
  group: BookingGroup | null;
  onClose: () => void;
}) {

  if (!group)
    return null;

  const first = group.bookings[0];

  const totalAmount = group.bookings.reduce(
    (t, x) => t + (x.amount ?? 0),
    0
  );

  const totalTravellers = group.bookings.reduce(
    (t, x) => t + x.adults + x.children,
    0
  );

  return (

    <Dialog
      open={!!group}
      onOpenChange={(o) => !o && onClose()}
    >

      <DialogContent className="max-w-3xl">

        <DialogHeader>

          <DialogTitle className="font-serif text-3xl">
            Booking Group #{group.bookingGroupId}
          </DialogTitle>

          <DialogDescription>
            {group.bookings.length} Journey(s)
          </DialogDescription>

        </DialogHeader>

        <div className="space-y-4">

          {group.bookings.map((booking) => (

            <div
              key={booking.bookingId}
              className="rounded border border-border/60 p-4"
            >

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-serif text-xl">
                    {booking.journeyName}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Departure :
                    {" "}
                    {formatDate(
                      booking.preferredDepartureDate
                    )}
                  </p>

                </div>

                <Badge variant="secondary">
                  {booking.bookingStatus}
                </Badge>

              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">

                <Detail
                  label="Adults"
                  value={booking.adults}
                />

                <Detail
                  label="Children"
                  value={booking.children}
                />

                <Detail
                  label="Amount"
                  value={formatCurrency(
                    booking.amount,
                    booking.currency
                  )}
                />

                <Detail
                  label="Payment"
                  value={booking.paymentStatus}
                />

              </div>

              {booking.specialRequirements && (

                <div className="mt-3">

                  <div className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                    Notes
                  </div>

                  <p className="mt-1 text-sm">
                    {booking.specialRequirements}
                  </p>

                </div>

              )}

            </div>

          ))}

        </div>

        <div className="border-t pt-5">

          <div className="grid grid-cols-2 gap-4">

            <Detail
              label="Traveller"
              value={first.fullName}
            />

            <Detail
              label="Email"
              value={first.email}
            />

            <Detail
              label="Mobile"
              value={first.mobileNumber}
            />

            <Detail
              label="Total Travellers"
              value={totalTravellers}
            />

            <Detail
              label="Total Amount"
              value={formatCurrency(
                totalAmount,
                first.currency
              )}
            />

          </div>

        </div>

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

function mapBooking(api: any): Booking {
  return {
    id: api.bookingGuid,

    userEmail: api.email,

    contact: {
      name: api.fullName,
      email: api.email,
      phone: api.mobileNumber,
    },

    destinations: [api.journeyName],

    travelMonth: api.preferredDepartureDate
      ? api.preferredDepartureDate.substring(0, 7)
      : "",

    party: `${api.adults + api.children} Travellers`,

    members: api.adults + api.children,

    style: {
      sattvik: false,
      premium: false,
      chandruLed: false,
      notes: api.specialRequirements ?? "",
    },

    amount: api.amount,

    currency: api.currency,

    status: api.bookingStatus.toLowerCase() as Booking["status"],

    payment: {
      status: api.paymentStatus.toLowerCase() as Booking["payment"]["status"],
      paymentId: api.razorpayPaymentLinkId,
      razorpayLinkId: api.razorpayPaymentLinkId,
      razorpayLinkUrl: api.razorpayShortUrl,
    },

    submittedAt: api.createdOn,

    upcoming:
      api.preferredDepartureDate
        ? new Date(api.preferredDepartureDate) > new Date()
        : false,
  };
}

function MyBookingsInner() {
  const { user } = useAuth();
  //const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingGroups, setBookingGroups] = useState<BookingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<BookingGroup | null>(null);

  useEffect(() => {
    if (!user) return;

    bookingApi
      .getMyBookings()
      .then((rows) => {
        setBookingGroups(groupBookings(rows));
      })
      .finally(() => setLoading(false));
  }, [user]);

  //const upcoming = useMemo(() => bookings.filter((b) => b.upcoming).slice(0, 3), [bookings]);
  const upcoming = useMemo(() => {
    return bookingGroups
      .filter(group => {

        const first = group.bookings[0];

        return first.preferredDepartureDate
          ? new Date(first.preferredDepartureDate) > new Date()
          : false;

      })
      .slice(0, 3);

  }, [bookingGroups]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q)
      return bookingGroups;

    return bookingGroups.filter(group => {
      const text = group.bookings
        .map(x =>
          [
            x.bookingGuid,
            x.journeyName,
            x.bookingStatus,
            x.fullName,
            x.email
          ].join(" ")
        )
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [bookingGroups, query]);

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
      ) :  bookingGroups.length  === 0 ? (
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
                {upcoming.map((group) => {
                  const first = group.bookings[0];

                  const totalAmount = group.bookings.reduce(
                    (t, x) => t + (x.amount ?? 0),
                    0
                  );

                  const totalMembers = group.bookings.reduce(
                    (t, x) => t + x.adults + x.children,
                    0
                  );

                  const journeys = group.bookings
                    .map(x => x.journeyName)
                    .join(" • ");

                  return (
                    <button
                      type="button"
                      key={group.bookingGroupId}
                      onClick={() => {
                        console.log("CLICK", group);
                        setSelected(group);
                      }}
                      className="border border-border/60 bg-card p-6 text-left transition-colors hover:border-primary"
                    >
                      <Badge variant="secondary">
                        {first.bookingStatus}
                      </Badge>

                      <h3 className="mt-4 font-serif text-xl">
                        {journeys}
                      </h3>

                      <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                        {formatMonth(first.preferredDepartureDate.substring(0,7))}
                      </p>

                      <div className="mt-6 flex items-center justify-between text-sm">

                        <span className="text-muted-foreground">
                          {totalMembers} Travellers
                        </span>

                        <span className="text-ivory">
                          {formatCurrency(totalAmount, first.currency)}
                        </span>

                      </div>

                    </button>

                  );

                })}
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
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No bookings match your search.
                </p>

              ) : (

                paged.map((group) => {

                  const first = group.bookings[0];

                  const totalAmount = group.bookings.reduce(
                    (t, x) => t + (x.amount ?? 0),
                    0
                  );

                  const totalTravellers = group.bookings.reduce(
                    (t, x) => t + x.adults + x.children,
                    0
                  );

                  const journeys = group.bookings
                    .map(x => x.journeyName)
                    .join(" • ");

                  return (

                    <button
                      key={group.bookingGroupId}
                      type="button"
                      onClick={() => {
                        console.log("CLICK 2", group);
                        setSelected(group);
                      }}
                      className="grid w-full grid-cols-12 items-center gap-4 border-b border-border/60 px-4 py-5 text-left transition-colors hover:bg-muted"
                    >

                      <div className="col-span-12 md:col-span-5">

                        <div className="font-serif text-lg text-ivory">
                          {journeys}
                        </div>

                        <div className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                          Group #{group.bookingGroupId}
                        </div>

                      </div>

                      <div className="col-span-4 md:col-span-2">
                        {totalTravellers}
                      </div>

                      <div className="col-span-4 md:col-span-3">
                        {formatCurrency(totalAmount, first.currency)}
                      </div>

                      <div className="col-span-4 flex justify-end md:col-span-2">

                        <Badge variant="secondary">
                          {first.bookingStatus}
                        </Badge>
                      </div>
                    </button>
                  );
                })
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

      <BookingGroupDetail group={selected} onClose={() => setSelected(null)} />
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
