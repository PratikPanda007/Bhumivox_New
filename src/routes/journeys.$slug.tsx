import { Link, useParams } from "react-router-dom";
import {
  Clock,
  Users,
  MapPin,
  Utensils,
  BedDouble,
  Compass,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";

import { PageHero } from "@/components/PageHero";
import { Section, SectionLabel } from "@/components/Section";
import { useSeo } from "@/hooks/useSeo";

import {
  journeyDetailsService,
  type JourneyDetails,
} from "@/services/journeyDetailsService";

function MetaIcon({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-l border-border/60 pl-4">
      <Icon className="mt-1 h-4 w-4 text-primary" />

      <div>
        <p className="text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 font-serif text-base text-ivory">
          {value}
        </p>
      </div>
    </div>
  );
}

function RouteMap({
  points,
}: {
  points: string[];
}) {
  return (
    <div className="relative overflow-hidden border border-border/60 bg-card p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(212,164,90,0.08),transparent_60%)]" />

      <p className="eyebrow relative">
        Route
      </p>

      <div className="relative mt-6 flex items-center gap-2 overflow-x-auto pb-2">
                {points.map((point, index) => (
          <div
            key={index}
            className="flex flex-shrink-0 items-center gap-2"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />

              <span className="whitespace-nowrap font-serif text-sm text-ivory">
                {point}
              </span>
            </div>

            {index < points.length - 1 && (
              <span className="mx-1 h-px w-12 bg-gradient-to-r from-primary/60 to-primary/10" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqItem({
  q,
  a,
}: {
  q: string;
  a: string;
}) {
  return (
    <details className="group border-b border-border/60 py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="font-serif text-lg text-ivory">
          {q}
        </span>

        <ChevronDown className="h-4 w-4 text-primary transition-transform group-open:rotate-180" />
      </summary>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {a}
      </p>
    </details>
  );
}

export default function JourneyDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();

  const [data, setData] =
    useState<JourneyDetails | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        const result =
          await journeyDetailsService.getBySlug(slug);

        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const j = data?.journey;

  useSeo({
    title: j
      ? `${j.journeyName} · Bhumivox`
      : "Journey · Bhumivox",

    description:
      j?.shortDescription ??
      "A civilizational journey across sacred Bharat.",

    ogImage: j?.heroImage,
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-40 text-center">
        Loading journey...
      </div>
    );
  }

  if (!j) {
    return (
      <div className="mx-auto max-w-xl px-6 py-40 text-center">
        <p className="eyebrow">
          Not Found
        </p>

        <h1 className="mt-4 font-serif text-4xl text-ivory">
          This journey isn't published yet.
        </h1>

        <Link
          to="/journeys"
          className="mt-6 inline-block text-sm uppercase tracking-[0.28em] text-primary"
        >
          ← Browse all journeys
        </Link>
      </div>
    );
  }

  const highlights =
    data?.destinations.map(
      (d) => d.destinationName
    ) ?? [];

  const route =
    data?.destinations.map(
      (d) => d.destinationName
    ) ?? [];

  const faq =
    data?.faQs.length
      ? data.faQs.map((f) => ({
          q: f.question,
          a: f.answer,
        }))
      : [
          {
            q: "How do I book this journey?",
            a: "Use the Request Journey Plan button and our team will contact you.",
          },
        ];

  const priceFrom = `₹${j.priceFrom.toLocaleString(
    "en-IN"
  )}`;
   return (
    <>
      <PageHero
        eyebrow={`${j.destinationName} · ${j.duration}`}
        title={<>{j.journeyName}</>}
        intro={j.shortDescription}
        image={j.heroImage}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/plan"
            className="bg-primary px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-primary-foreground hover:bg-primary/90"
          >
            Request Journey Plan
          </Link>

          <Link
            to="/contact"
            className="border border-border px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-ivory hover:border-primary"
          >
            Request Callback
          </Link>
        </div>
      </PageHero>

      {/* Meta Strip */}

      <Section className="!py-12">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">

          <MetaIcon
            icon={Clock}
            label="Duration"
            value={j.duration}
          />

          <MetaIcon
            icon={MapPin}
            label="Destination"
            value={j.destinationName}
          />

          <MetaIcon
            icon={Users}
            label="Journey Type"
            value={j.journeyTypeName}
          />

          <MetaIcon
            icon={BedDouble}
            label="Price"
            value={priceFrom}
          />

          <MetaIcon
            icon={Utensils}
            label="Status"
            value={j.isActive ? "Available" : "Unavailable"}
          />

          <MetaIcon
            icon={Compass}
            label="Experience"
            value="Guided Journey"
          />

        </div>
      </Section>

      {/* Overview */}

      <Section className="!pt-0">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">

          <div>
            <SectionLabel
              eyebrow="Overview"
              title={<>The Journey.</>}
            />

            <p className="mt-6 text-base leading-relaxed text-ivory/85">
              {j.longDescription}
            </p>
          </div>

          <div>
            <SectionLabel
              eyebrow="Why Visit?"
              title={<>Why this place matters.</>}
            />

            <p className="mt-6 text-base leading-relaxed text-ivory/85">
              {j.longDescription}
            </p>
          </div>

        </div>
      </Section>

      {/* Highlights */}

      <Section className="!pt-0">

        <SectionLabel
          eyebrow="Highlights"
          title={<>Journey Highlights</>}
        />

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

          {highlights.map((item, index) => (

            <div
              key={index}
              className="border border-border/60 bg-card p-6"
            >

              <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-gold">
                {String(index + 1).padStart(2, "0")}
              </p>

              <p className="mt-3 font-serif text-lg leading-snug text-ivory">
                {item}
              </p>

            </div>

          ))}

        </div>

      </Section>

      {/* Route */}

      <Section className="!pt-0">
        <RouteMap points={route} />
      </Section>

      {/* Itinerary */}

      <Section className="!pt-0">

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">

          <div className="lg:col-span-2">

            <SectionLabel
              eyebrow="Itinerary"
              title={<>Day by Day</>}
            />

            <ol className="mt-10 space-y-6 border-l border-border/60 pl-6">

              {data?.itinerary.map((day) => (

                <li
                  key={day.journeyItineraryId}
                  className="relative"
                >

                  <span className="absolute -left-[31px] top-2 h-2 w-2 rounded-full bg-primary" />

                  <p className="eyebrow text-gold">
                    Day {day.dayNumber}
                  </p>

                  <h3 className="mt-2 font-serif text-2xl text-ivory">
                    {day.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {day.description}
                  </p>

                </li>

              ))}

            </ol>

          </div>
            <aside className="space-y-8">

            <div className="border border-border/60 bg-card p-6">
              <p className="eyebrow">Your Guide</p>

              <h3 className="mt-3 font-serif text-2xl text-ivory">
                Bhumivox Scholar
              </h3>

              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-gold">
                Heritage Expert
              </p>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Every Bhumivox journey is accompanied by experienced
                researchers and storytellers who bring India's heritage,
                culture and traditions alive.
              </p>
            </div>

            <div className="border border-border/60 bg-card p-6">
              <p className="eyebrow">Price</p>

              <p className="mt-3 font-serif text-3xl text-ivory">
                {priceFrom}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Starting price per guest.
              </p>
            </div>

            <div className="border border-border/60 bg-card p-6">
              <p className="eyebrow">Duration</p>

              <p className="mt-3 text-lg text-ivory">
                {j.duration}
              </p>
            </div>

          </aside>

        </div>
      </Section>

      {/* Gallery */}

      <Section className="!pt-0">

        <SectionLabel
          eyebrow="Destinations"
          title={<>Places Covered</>}
        />

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">

          {data?.destinations.map((destination) => (

            <div
              key={destination.destinationId}
              className="overflow-hidden border border-border/60"
            >

              <img
                src={destination.heroImage}
                alt={destination.destinationName}
                className="aspect-[4/5] w-full object-cover"
              />

              <div className="p-4">

                <h3 className="font-serif text-xl text-ivory">
                  {destination.destinationName}
                </h3>

              </div>

            </div>

          ))}

        </div>

      </Section>

      {/* Inclusions / Exclusions */}

      <Section className="!pt-0">

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">

          <div>

            <p className="eyebrow">
              Inclusions
            </p>

            <ul className="mt-6 space-y-3">

              {data?.inclusions.length ? (
                data.inclusions.map((item) => (

                  <li
                    key={item.journeyInclusionId}
                    className="flex gap-3 text-sm text-ivory/85"
                  >
                    <span className="mt-2 h-px w-4 bg-primary" />
                    {item.inclusion}
                  </li>

                ))
              ) : (
                <li className="text-muted-foreground">
                  Details available on request.
                </li>
              )}

            </ul>

          </div>

          <div>

            <p className="eyebrow">
              Exclusions
            </p>

            <ul className="mt-6 space-y-3">

              {data?.exclusions.length ? (
                data.exclusions.map((item) => (

                  <li
                    key={item.journeyExclusionId}
                    className="flex gap-3 text-sm text-muted-foreground"
                  >
                    <span className="mt-2 h-px w-4 bg-border" />
                    {item.exclusion}
                  </li>

                ))
              ) : (
                <li className="text-muted-foreground">
                  Details available on request.
                </li>
              )}

            </ul>

          </div>

        </div>

      </Section>

      {/* FAQ */}

      <Section className="!pt-0">

        <SectionLabel
          eyebrow="FAQ"
          title={<>Questions Answered</>}
        />

        <div className="mt-10 max-w-3xl">

          {faq.map((item, index) => (

            <FaqItem
              key={index}
              q={item.q}
              a={item.a}
            />

          ))}

        </div>

      </Section>

      {/* CTA */}

      <Section className="!pt-0">

        <div className="border border-primary/30 bg-card p-10 text-center">

          <p className="eyebrow">
            Ready to Begin?
          </p>

          <h2 className="mt-4 font-serif text-4xl text-ivory">
            {j.journeyName}
          </h2>

          <p className="mt-4 text-muted-foreground">
            Speak with a Bhumivox travel specialist to customize your
            journey.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <Link
              to="/plan"
              className="bg-primary px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-primary-foreground hover:bg-primary/90"
            >
              Request Journey Plan
            </Link>

            <Link
              to="/contact"
              className="border border-border px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-ivory hover:border-primary"
            >
              Contact Us
            </Link>

          </div>

        </div>

      </Section>

    </>
  );
}