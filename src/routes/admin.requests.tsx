import { useEffect, useState } from "react";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useSeo } from "@/hooks/useSeo";

import { adminService, type Booking } from "@/services/adminService";

function AdminRequestsInner() {
    const [rows, setRows] = useState<Booking[]>([]);
    const [selected, setSelected] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentLink, setPaymentLink] = useState<string>("");
    const [busy, setBusy] = useState(false);

    const load = async () => {
        setLoading(true);

        try {
            const data = await adminService.getBookings();
            setRows(data);
        }
        catch (err) {
            console.error(err);
        }

        setLoading(false);
        setPaymentLink("");
    };

    useEffect(() => {
        load();
    }, []);

    const generatePaymentLink = async (bookingId: number) => {
      try {
          setBusy(true);
          const result =
              await adminService.generatePaymentLink(bookingId);
          setPaymentLink(result.razorpayShortUrl);
      }
      catch (err) {
          console.error(err);
          alert("Unable to generate payment link.");
      }
      finally {
          setBusy(false);
      }
  };

    const copyPaymentLink = async () => {
        if (!paymentLink) {
            alert("Generate payment link first.");
            return;
        }
        await navigator.clipboard.writeText(paymentLink);
        alert("Payment link copied.");
    };

    const markPaid = async (bookingId: number) => {
          try {
              setBusy(true);
              await adminService.markPaid(bookingId);
              await load();
              setSelected(null);
              alert("Booking marked as paid.");
          }
          catch (err) {
              console.error(err);
              alert("Unable to mark booking paid.");
          }
          finally {
              setBusy(false);
          }
      };

    return (
        <main className="px-6 py-8 md:px-10 md:py-10">
            <div className="mb-8">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-primary">
                    Studio
                </span>

                <h1 className="mt-2 font-serif text-3xl text-ivory">
                    Journey Requests
                </h1>
            </div>

            {loading ? (
                <p className="text-muted-foreground">
                    Loading...
                </p>
            ) : rows.length === 0 ? (
                <p className="text-muted-foreground">
                    No requests yet.
                </p>
            ) : (
                <div className="overflow-x-auto border border-border">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border bg-obsidian font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">Booking</th>
                                <th className="px-4 py-3">Journey</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Mobile</th>
                                <th className="px-4 py-3">Departure</th>
                                <th className="px-4 py-3">Travellers</th>
                                <th className="px-4 py-3">Booking</th>
                                <th className="px-4 py-3">Payment</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.map((r) => (
                                <tr
                                    key={r.bookingId}
                                    onClick={async () => {
                                      setSelected(r);
                                      try {
                                          const link = await adminService.getPaymentLink(r.bookingId);
                                          setPaymentLink(link ?? "");
                                      }
                                      catch {
                                          setPaymentLink("");
                                      }
                                    }}
                                    className="cursor-pointer border-b border-border/60 transition-colors hover:bg-obsidian"
                                >
                                    <td className="px-4 py-3 font-mono">
                                        #{r.bookingId}
                                    </td>

                                    <td className="px-4 py-3">
                                        {r.journeyName}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="text-ivory">
                                                {r.fullName}
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                {r.email}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        {r.mobileNumber}
                                    </td>

                                    <td className="px-4 py-3">
                                        {new Date(
                                            r.preferredDepartureDate
                                        ).toLocaleDateString()}
                                    </td>

                                    <td className="px-4 py-3">
                                        {r.adults} Adult(s)

                                        {r.children > 0 &&
                                            ` + ${r.children} Child`}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-block border px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em]
                                            ${
                                                r.bookingStatus === "Submitted"
                                                    ? "border-primary text-primary"
                                                    : r.bookingStatus === "Quoted"
                                                    ? "border-blue-500 text-blue-500"
                                                    : r.bookingStatus === "Confirmed"
                                                    ? "border-green-500 text-green-500"
                                                    : "border-border text-muted-foreground"
                                            }`}
                                        >
                                            {r.bookingStatus}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-block border px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em]
                                            ${
                                                r.paymentStatus === "Paid"
                                                    ? "border-green-500 text-green-500"
                                                    : r.paymentStatus === "Pending"
                                                    ? "border-yellow-500 text-yellow-500"
                                                    : "border-border text-muted-foreground"
                                            }`}
                                        >
                                            {r.paymentStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/50"
                    onClick={() => setSelected(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg overflow-y-auto bg-background p-8 shadow-2xl"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-primary">
                                    Booking
                                </span>

                                <h2 className="mt-2 font-serif text-2xl text-ivory">
                                    {selected.fullName}
                                </h2>
                            </div>

                            <button
                                onClick={() => setSelected(null)}
                                className="text-2xl text-muted-foreground hover:text-ivory"
                            >
                                ×
                            </button>
                        </div>

                        <dl className="mt-8 space-y-3 text-sm">
                            <Row label="Journey" value={selected.journeyName} />

                            <Row label="Email" value={selected.email} />

                            <Row label="Mobile" value={selected.mobileNumber} />

                            <Row label="Country" value={selected.country} />

                            <Row label="City" value={selected.city} />

                            <Row
                                label="Departure"
                                value={new Date(
                                    selected.preferredDepartureDate
                                ).toLocaleDateString()}
                            />

                            <Row
                                label="Adults"
                                value={selected.adults.toString()}
                            />

                            <Row
                                label="Children"
                                value={selected.children.toString()}
                            />

                            <Row
                                label="Booking Status"
                                value={selected.bookingStatus}
                            />

                            <Row
                                label="Payment Status"
                                value={selected.paymentStatus}
                            />

                            <Row
                                label="Amount"
                                value={`₹${selected.amount.toLocaleString("en-IN")}`}
                            />

                            <Row
                                label="Created"
                                value={new Date(selected.createdOn).toLocaleString()}
                            />
                        </dl>

                        {paymentLink && (
                          <div className="mt-6">
                              <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                                  Razorpay Payment Link
                              </label>
                              <input
                                  readOnly
                                  value={paymentLink}
                                  className="w-full rounded border border-border bg-card px-3 py-3 text-sm"
                              />
                          </div>
                        )}

                        <div className="mt-10 flex flex-wrap gap-3">

                            <button
                                disabled={busy}
                                onClick={() => generatePaymentLink(selected.bookingId)}
                                className="rounded bg-primary px-5 py-3 text-xs uppercase tracking-widest text-primary-foreground disabled:opacity-50"
                            >
                                {busy ? "Generating..." : "Generate Razorpay Link"}
                            </button>

                            <button
                                disabled={!paymentLink}
                                onClick={copyPaymentLink}
                                className="rounded border border-border px-5 py-3 text-xs uppercase tracking-widest text-ivory disabled:opacity-50"
                            >
                                Copy Link
                            </button>

                            <button
                                disabled={busy}
                                onClick={() => markPaid(selected.bookingId)}
                                className="rounded border border-green-600 px-5 py-3 text-xs uppercase tracking-widest text-green-500 disabled:opacity-50"
                            >
                                Mark Paid
                            </button>
                        </div>

                        {paymentLink && (
                          <div className="mt-8 rounded border border-primary/30 bg-card p-4">
                              <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-primary">
                                  Payment Link
                              </p>

                              <a
                                  href={paymentLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-3 block break-all text-sm text-blue-400 hover:underline"
                              >
                                  {paymentLink}
                              </a>
                          </div>
                        )}

                    </div>
                </div>
            )}
        </main>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-6 border-b border-border/40 pb-2">
            <dt className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                {label}
            </dt>

            <dd className="text-right text-ivory">
                {value}
            </dd>
        </div>
    );
}

export default function AdminRequestsPage() {
    useSeo({
        title: "Journey Requests — Bhumivox Studio",
        description: "Studio admin."
    });

    return (
        <RequireAdmin>
            <AdminLayout>
                <AdminRequestsInner />
            </AdminLayout>
        </RequireAdmin>
    );
}