import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { adminService } from "@/services/adminService";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useSeo } from "@/hooks/useSeo";

type Req = {
    id: string;
    name: string;
    email: string;
    destinations: string[];
    bookingStatus: string;
    paymentStatus: string;
    amount: number;
    currency: string;
    paymentMethod: string | null;
    paidOn: string | null;
    submitted_at: string;
    quotation_id: string | null;
};

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="border border-border bg-card p-6">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
      <p className={`mt-3 font-serif text-3xl ${accent ?? "text-ivory"}`}>{value}</p>
    </div>
  );
}

function DashboardInner() {
  const [rows, setRows] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
        try {
            const data = await adminService.getBookings();

            const mapped: Req[] = data.map((b: any) => ({
              id: b.bookingId.toString(),
              name: b.fullName,
              email: b.email,
              destinations: [b.journeyName],
              bookingStatus: b.bookingStatus,
              paymentStatus: b.paymentStatus,
              amount: b.amount,
              currency: b.currency,
              paymentMethod: b.paymentMethod,
              paidOn: b.paidOn,
              submitted_at: b.createdOn,
              quotation_id: null
            }));

            setRows(mapped);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    })();
  }, []);

  const stats = useMemo(() => {
    const c = {
        total: rows.length,
        submitted: 0,
        quoted: 0,
        confirmed: 0,
        completed: 0,
        paid: 0,
        pendingPayment: 0,
        revenue: 0
    };

    rows.forEach((r) => {
        switch (r.bookingStatus) {

            case "Submitted":
                c.submitted++;
                break;

            case "Quoted":
                c.quoted++;
                break;

            case "Confirmed":
                c.confirmed++;
                break;

            case "Completed":
                c.completed++;
                break;
        }

        // Payment Statistics
        if (r.paymentStatus === "Paid") {
            c.paid++;
            c.revenue += r.amount;
        }
        else {
            c.pendingPayment++;
        }

    });

    return c;
  }, [rows]);

  const chartData = useMemo(() => {
      const map = new Map<string, number>();

      // Initialize last 30 days
      for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);

          const key =
              d.getFullYear() +
              "-" +
              String(d.getMonth() + 1).padStart(2, "0") +
              "-" +
              String(d.getDate()).padStart(2, "0");

          map.set(key, 0);
      }

      rows.forEach((r) => {
          const key = r.submitted_at.substring(0, 10);

          if (map.has(key)) {
              map.set(key, (map.get(key) ?? 0) + 1);
          }
      });

      return Array.from(map.entries()).map(([date, count]) => ({
          date: date.substring(5),
          count,
      }));
  }, [rows]);

  const topDestinations = useMemo(() => {
    const counts = new Map<string, number>();

    rows.forEach((r) => {
        const journey = r.destinations[0];

        if (!journey) return;

        counts.set(
            journey,
            (counts.get(journey) ?? 0) + 1
        );
    });

    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
  }, [rows]);

  const recent = rows.slice(0, 5);
  const maxDest = topDestinations[0]?.[1] ?? 1;

  return (
    <main className="px-6 py-8 md:px-10 md:py-10">
      <div className="mb-8">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-primary">Overview</span>
        <h1 className="mt-2 font-serif text-3xl text-ivory">Dashboard</h1>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Stat label="Total" value={stats.total} />
            <Stat label="Submitted" value={stats.submitted} accent="text-primary" />
            <Stat label="Quoted" value={stats.quoted} accent="text-blue-500" />
            <Stat label="Confirmed" value={stats.confirmed} accent="text-green-500" />
            <Stat label="Completed" value={stats.completed} accent="text-gold" />
            <Stat label="Paid" value={stats.paid} accent="text-green-500" />

            <Stat label="Pending Payment" value={stats.pendingPayment} accent="text-yellow-500" />

            <Stat
                label="Revenue"
                value={`₹${stats.revenue.toLocaleString()}`}
                accent="text-primary"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="border border-border bg-card p-6 lg:col-span-2">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                Requests — last 30 days
              </p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border border-border bg-card p-6">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                Top destinations
              </p>
              {topDestinations.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {topDestinations.map(([name, count]) => (
                    <li key={name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ivory">{name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{count}</span>
                      </div>
                      <div className="mt-2 h-1 bg-obsidian">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(count / maxDest) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-8 border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-muted-foreground">
                Recent requests
              </p>
              <Link to="/admin/requests" className="text-[0.65rem] uppercase tracking-[0.28em] text-primary hover:text-gold">
                View all →
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="px-6 py-6 text-sm text-muted-foreground">No requests yet.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {recent.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4">
                    <div>
                      <p className="text-sm text-ivory">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {r.destinations[0] ?? "—"}
                  </p>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                      {new Date(r.submitted_at).toLocaleDateString("en-IN")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </main>
  );
}

export default function AdminDashboardPage() {
  useSeo({ title: "Dashboard — Bhumivox Studio", description: "Studio admin." });
  return (
      <AdminLayout>
        <DashboardInner />
      </AdminLayout>
  );
}
