import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";

import { PageHero } from "@/components/PageHero";
import { Section, SectionLabel } from "@/components/Section";
import { IndiaMap } from "@/components/IndiaMap";

import {
  destinationService,
  type Destination,
} from "@/services/destinationService";

import { useSeo } from "@/hooks/useSeo";

import heroImg from "@/assets/journey-dwarka.jpg";

export default function DestinationsPage() {
  useSeo({
    title: "Destinations — Browse by Circuit · Bhumivox",
    description:
      "Browse sacred Bharat by civilizational circuit — Vaishnav Bharat, Ramayana Trail, Mahabharata Field, Shaiva–Shakta Heartland, and the submerged coast.",
    ogTitle: "Destinations — Browse by Circuit",
    ogDescription:
      "Twelve sacred geographies across Bharat and Sri Lanka, organised by civilizational circuit.",
  });

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  const [circuit, setCircuit] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const data = await destinationService.getAll();
        setDestinations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, []);

  const circuits = useMemo(() => {
    const values = Array.from(
      new Set(
        destinations
          .map((d) => d.circuit)
          .filter((c): c is string => !!c)
      )
    );

    return values.sort();
  }, [destinations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return destinations.filter((d) => {
      const matchCircuit =
        circuit === "All" || d.circuit === circuit;

      const matchQuery =
        q === "" ||
        d.destinationName.toLowerCase().includes(q) ||
        d.region?.toLowerCase().includes(q) ||
        d.tagline?.toLowerCase().includes(q);

      return matchCircuit && matchQuery;
    });
  }, [destinations, circuit, query]);

  return (
    <>
      <PageHero
        eyebrow="The Living Civilizations Map"
        title={
          <>
            Browse Bharat by
            <span className="italic text-primary"> circuit.</span>
          </>
        }
        intro="Five civilizational arcs. Twelve sacred nodes. Each one a chapter in a continuous text — choose where to enter."
        image={heroImg}
      />

      <Section className="!py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {["All", ...circuits].map((c) => {
              const active = circuit === c;

              return (
                <button
                  key={c}
                  onClick={() => setCircuit(c)}
                  className={`px-4 py-2 text-[0.65rem] uppercase tracking-[0.22em] transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:border-primary hover:text-ivory"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations..."
              className="w-full border border-border bg-obsidian px-10 py-3 text-sm text-ivory placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          {loading
            ? "Loading..."
            : `${filtered.length} destination${filtered.length === 1 ? "" : "s"}`}
        </p>
      </Section>

            {/* Card grid */}
      <Section className="!pt-0">
        {loading ? (
          <p className="border border-border/60 bg-card px-6 py-16 text-center text-sm text-muted-foreground">
            Loading destinations...
          </p>
        ) : filtered.length === 0 ? (
          <p className="border border-border/60 bg-card px-6 py-16 text-center text-sm text-muted-foreground">
            No destinations found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => (
              <Link
                key={d.destinationId}
                to={`/destinations/${d.slug}`}
                className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden border border-border/60 bg-obsidian"
              >
                <img
                  src={d.heroImage}
                  alt={d.destinationName}
                  className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />

                <div className="p-6">
                  <p className="eyebrow text-gold">
                    {d.circuit}
                  </p>

                  <h3 className="mt-3 font-serif text-3xl text-ivory">
                    {d.destinationName}
                  </h3>

                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {d.region}
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-ivory/80">
                    {d.tagline}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.28em] text-primary">
                    Explore destination
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Map */}
      <Section className="!pt-0">
        <SectionLabel
          eyebrow="Sacred Geography"
          title={
            <>
              Read the land as
              <span className="italic text-primary"> a single body.</span>
            </>
          }
          intro="Each node is not a destination — it is a chapter in a continuous text."
        />

        <div className="mt-12 border border-border/60 bg-obsidian p-8">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="eyebrow">
              Bharat · Sacred Geography Index
            </span>

            <span className="font-mono text-[0.6rem] tracking-[0.22em] text-gold">
              ● LIVE
            </span>
          </div>

          <IndiaMap className="mt-6 h-[560px] w-full" />
        </div>
      </Section>
    </>
  );
}