import { Link } from "react-router-dom";
import { PageHero } from "@/components/PageHero";
import { Section, SectionLabel } from "@/components/Section";
import { JourneyCard } from "@/components/JourneyCard";
import { useSeo } from "@/hooks/useSeo";

import heroImg from "@/assets/journey-kashi.jpg";
import chandruPortrait from "@/assets/chandru-portrait.jpg";

import { ArrowRight, Search, Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  journeysService,
  type Journey,
} from "@/services/journeysService";

const FILTERS = [
  "All",
  "Featured",
  "Group",
  "Private",
  "Family",
  "NRI Bharat",
  "Vaishnav",
  "Archaeology",
];

export default function JourneysPage() {
  useSeo({
    title: "Journeys — Bhumivox",
    description:
      "Research-led journeys across sacred Bharat.",
    ogTitle: "Journeys — Bhumivox",
    ogDescription:
      "Research-led journeys across sacred Bharat.",
  });

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await journeysService.getAll();
        setJourneys(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    return journeys.filter((j) => {
      const q = query.trim().toLowerCase();

      return (
        !q ||
        j.journeyName.toLowerCase().includes(q) ||
        j.destinationName.toLowerCase().includes(q) ||
        j.shortDescription.toLowerCase().includes(q)
      );
    });
  }, [journeys, query]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-40 text-center">
        Loading journeys...
      </div>
    );
  }

  return (
    <>
      <PageHero
      eyebrow="The Journeys"
      title={
        <>
          Research-led journeys across
          <span className="italic text-primary"> sacred Bharat.</span>
        </>
      }
      intro="Curated civilizational expeditions across India."
      image={heroImg}
    />

    <Section>
      <div className="relative mb-10 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search journeys..."
          className="w-full border border-border bg-transparent py-2 pl-9 pr-3 text-sm text-ivory placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((j) => (
          <JourneyCard
            key={j.journeyGuid}
            j={{
              slug: j.slug,
              title: j.journeyName,
              region: j.destinationName,
              duration: j.duration,
              image: j.heroImage,
              blurb: j.shortDescription,
              guide: "Bhumivox Scholar",
            }}
          />
        ))}
      </div>
    </Section>

    <Section className="!pt-0">
      <div className="relative overflow-hidden border border-border/60 bg-card p-10 md:p-16">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="eyebrow text-gold">Private Journeys</span>

            <h2 className="mt-4 font-serif text-3xl text-ivory md:text-5xl">
              Designed in <span className="italic text-primary">thirty days</span>,
              walked at your own pace.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Tell us where the land is calling you — a single temple, a circuit,
              or an arc across regions.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <Link
              to="/plan"
              className="inline-flex items-center gap-3 border border-primary bg-primary px-7 py-4 text-[0.7rem] uppercase tracking-[0.28em] text-primary-foreground hover:bg-primary/90"
            >
              Plan Your Journey
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/contact"
              className="text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground hover:text-ivory"
            >
              Or speak to the studio
            </Link>
          </div>
        </div>
      </div>
    </Section>
  </>
  );
}