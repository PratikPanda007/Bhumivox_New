import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { useEffect, useState, useMemo } from "react";
import { useSeo } from "@/hooks/useSeo";
import { bookingApi } from "@/services/bookingApi";
import {
  destinationService,
  type Destination,
} from "@/services/destinationService";
import {
  journeysService,
  type Journey,
} from "@/services/journeysService";
import { useAuth } from "@/hooks/useAuth";
import heroImg from "@/assets/journey-braj.jpg";

const STEPS = [
  { n: "01", t: "Destination", d: "Where does Bharat call you?" },
  { n: "02", t: "Travel Window", d: "When can you give us your time?" },
  { n: "03", t: "Companions", d: "Who travels with you?" },
  { n: "04", t: "Style", d: "Tell us how you want to travel." },
  { n: "05", t: "Contact", d: "How can the studio reach you?" },
] as const;

const PARTIES = [
  "Solo",
  "Couple",
  "Family · 3 gen",
  "Small group",
] as const;

type FormState = {
  destinations: number[];
  selectedJourneyId: number[];

  travelMonth: string;
  party: string;

  sattvik: boolean;
  premium: boolean;
  chandruLed: boolean;

  notes: string;

  name: string;
  email: string;
  phone: string;
};

export default function PlanPage() {
  useSeo({
    title: "Plan Your Journey — Bhumivox",
    description:
      "A five-step civilizational journey planner — destination, dates, companions, style, contact.",
    ogTitle: "Plan Your Journey — Bhumivox",
    ogDescription: "Begin a private, research-led journey across sacred Bharat.",
  });

  const { user } = useAuth();

  const [step, setStep] = useState(0);

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);

  const [form, setForm] = useState<FormState>({
    destinations: [],
    selectedJourneyId: [],

    travelMonth: "",
    party: "",

    sattvik: false,
    premium: false,
    chandruLed: false,

    notes: "",

    name: "",
    email: "",
    phone: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm((f) => ({
      ...f,
      name: f.name || user.fullName,
      email: f.email || user.email,
      phone: f.phone || user.phone,
    }));
  }, [user]);

  useEffect(() => {
    const load = async () => {
      try {
        const [destinationRows, journeyRows] = await Promise.all([
          destinationService.getAll(),
          journeysService.getAll(),
        ]);

        setDestinations(
          destinationRows
            .filter((x) => x.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder)
        );

        setJourneys(
          journeyRows.filter((x) => x.isActive)
        );
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

    const update = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  };

  const toggleDestination = (destinationId: number) => {
    setForm((f) => {
      const exists = f.destinations.includes(destinationId);

      const newDestinations = exists
        ? f.destinations.filter((x) => x !== destinationId)
        : [...f.destinations, destinationId];

      const validJourneyIds = journeys
        .filter((j) => newDestinations.includes(j.destinationId))
        .map((j) => j.journeyId);

      return {
        ...f,
        destinations: newDestinations,

        // Keep only journeys that still belong
        // to the selected destinations
        selectedJourneyId: f.selectedJourneyId.filter((id) =>
          validJourneyIds.includes(id)
        ),
      };
    });
  };

  // const availableJourneys = journeys.filter((journey) =>
  //   form.destinations.includes(journey.destinationId)
  // );

  const availableJourneys = useMemo(() => {
    return journeys.filter((journey) =>
      form.destinations.includes(journey.destinationId)
    );
  }, [journeys, form.destinations]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (form.destinations.length === 0) {
      alert("Please select at least one destination.");
      return;
    }

    if (form.selectedJourneyId.length === 0) {
      alert("Please select a journey.");
      return;
    }

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      alert("Please fill your contact details.");
      return;
    }

    setSubmitting(true);

    try {
      await bookingApi.createBooking({
        journeyId: form.selectedJourneyId,

        fullName: form.name.trim(),

        email: form.email.trim(),

        mobileNumber: form.phone.trim(),

        country: "India",

        city: "",

        adults: 1,

        children: 0,

        preferredDepartureDate: form.travelMonth
          ? new Date(form.travelMonth + "-01")
          : new Date(),

        specialRequirements: form.notes,
      });

      alert("Thank you! Your booking request has been submitted.");

      setStep(0);

      setForm({
        destinations: [],
        selectedJourneyId: [],

        travelMonth: "",
        party: "",

        sattvik: false,
        premium: false,
        chandruLed: false,

        notes: "",

        name: user?.fullName ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
      });
    } catch (err) {
      console.error(err);

      alert("Sorry, we couldn't submit your booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Plan Your Journey"
        title={
          <>
            A quiet five-step{" "}
            <span className="italic text-primary">
              beginning.
            </span>
          </>
        }
        intro="No instant booking. A studio conversation, shaped by what you tell us here."
        image={heroImg}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-24">

          <aside>

            <ol className="space-y-6 border-l border-border pl-8">

              {STEPS.map((s, i) => (
                <li
                  key={s.n}
                  className={`relative cursor-pointer transition-colors ${
                    i === step
                      ? "text-ivory"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setStep(i)}
                >
                  <span
                    className={`absolute -left-[37px] top-1 h-2 w-2 rounded-full ${
                      i === step
                        ? "bg-primary glow-bronze"
                        : "bg-border"
                    }`}
                  />

                  <span className="font-mono text-[0.65rem] tracking-[0.28em]">
                    {s.n}
                  </span>

                  <h4 className="mt-1 font-serif text-2xl">
                    {s.t}
                  </h4>

                  <p className="mt-1 text-sm">
                    {s.d}
                  </p>
                </li>
              ))}

            </ol>

          </aside>

          <form
            className="border border-border/60 bg-obsidian p-10 md:p-14"
            onSubmit={handleSubmit}
          >
            <span className="eyebrow text-gold">
              Step {STEPS[step].n}
            </span>

            <h2 className="mt-4 font-serif text-4xl text-ivory md:text-5xl">
              {STEPS[step].t}
            </h2>

            <div className="mt-10 space-y-6">

              {step === 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">

                    {destinations.map((destination) => {

                      const selected = form.destinations.includes(
                        destination.destinationId
                      );

                      return (
                        <button
                          key={destination.destinationId}
                          type="button"
                          onClick={() =>
                            toggleDestination(destination.destinationId)
                          }
                          className={`border px-4 py-4 text-center text-sm transition-colors ${
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/60 text-ivory hover:border-primary"
                          }`}
                        >
                          {destination.destinationName}
                        </button>
                      );
                    })}

                  </div>

                  {form.destinations.length > 0 && (
                    <div className="space-y-3">

                      <h3 className="font-serif text-xl text-ivory">
                        Select Journey
                      </h3>

                      {availableJourneys.length === 0 ? (
                        <div className="rounded border border-border/60 p-4 text-sm text-muted-foreground">
                          No journeys available for the selected destination(s).
                        </div>
                      ) : (
                        <div className="space-y-3">

                          {availableJourneys.map((journey) => {

                            const selected =
                              form.selectedJourneyId.includes(journey.journeyId);

                            return (
                              <button
                                key={journey.journeyId}
                                type="button"
                                onClick={() => {
                                  setForm((f) => {
                                    const updated = f.selectedJourneyId.includes(journey.journeyId)
                                      ? f.selectedJourneyId.filter((x) => x !== journey.journeyId)
                                      : [...f.selectedJourneyId, journey.journeyId];

                                    return {
                                      ...f,
                                      selectedJourneyId: updated,
                                    };
                                  });
                                }}
                                className={`w-full border p-4 text-left transition ${
                                  selected
                                    ? "border-primary bg-primary/10"
                                    : "border-border/60 hover:border-primary"
                                }`}
                              >
                                <div className="flex items-center justify-between">

                                  <div>

                                    <h4 className="font-serif text-lg text-ivory">
                                      {journey.journeyName}
                                    </h4>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {journey.duration}
                                    </p>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                      {journey.shortDescription}
                                    </p>

                                  </div>

                                  <div className="text-right">

                                    <div className="text-primary font-semibold">
                                      ₹{journey.priceFrom.toLocaleString()}
                                    </div>

                                  </div>

                                </div>

                              </button>
                            );

                          })}

                        </div>
                      )}

                    </div>
                  )}

                </>
              )}

              {step === 1 && (
                <input
                  type="month"
                  value={form.travelMonth}
                  onChange={(e) =>
                    update("travelMonth", e.target.value)
                  }
                  className="w-full border-b border-border bg-transparent py-3 text-base text-ivory outline-none focus:border-primary"
                />
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-3">
                                    {PARTIES.map((d) => {
                    const selected = form.party === d;

                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => update("party", d)}
                        className={`border px-4 py-4 text-center text-sm transition-colors ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/60 text-ivory hover:border-primary"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">

                  <Toggle
                    label="Strict sattvik kitchen"
                    checked={form.sattvik}
                    onChange={(v) => update("sattvik", v)}
                  />

                  <Toggle
                    label="Premium comfort & private vehicles"
                    checked={form.premium}
                    onChange={(v) => update("premium", v)}
                  />

                  <Toggle
                    label="Chandru Ramesh-led preferred"
                    checked={form.chandruLed}
                    onChange={(v) => update("chandruLed", v)}
                  />

                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Anything else we should know…"
                    className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm text-ivory outline-none focus:border-primary"
                  />

                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">

                  <Field
                    label="Full Name"
                    type="text"
                    value={form.name}
                    onChange={(v) => update("name", v)}
                    placeholder="Your name"
                  />

                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => update("email", v)}
                    placeholder="you@example.com"
                  />

                  <Field
                    label="Phone"
                    type="tel"
                    value={form.phone}
                    onChange={(v) => update("phone", v)}
                    placeholder="+91 98765 43210"
                  />

                </div>
              )}

            </div>

            <div className="mt-12 flex items-center justify-between">  
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground hover:text-ivory disabled:opacity-30"
              >
                  ← Back
              </button>
              {/* <pre className="text-white">
              {JSON.stringify(form, null, 2)}
            </pre> */}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setStep((s) => Math.min(STEPS.length - 1, s + 1))
                  }
                  className="bg-primary px-8 py-4 text-[0.7rem] uppercase tracking-[0.32em] text-primary-foreground hover:bg-gold"
                >
                  Continue →
                </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary px-8 py-4 text-[0.7rem] uppercase tracking-[0.32em] text-primary-foreground hover:bg-gold disabled:opacity-50"
                  >
                    {submitting
                      ? "Submitting…"
                      : "Request Journey Plan"}
                  </button>
                )}
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}

  function Toggle({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) {
    return (
      <label className="flex cursor-pointer items-center justify-between border-b border-border/60 py-3 text-sm text-ivory">
        <span>{label}</span>

        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
      </label>
    );
  }

  function Field({
    label,
    type,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    type: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  }) {
    return (
          <label className="block">
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="mt-2 w-full border-b border-border bg-transparent py-3 text-base text-ivory outline-none focus:border-primary"
      />
    </label>
  );
}