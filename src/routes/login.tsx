import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Section } from "@/components/Section";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";

export default function LoginPage() {
  useSeo({ title: "Sign In — Bhumivox", description: "Sign in to plan and manage your journey." });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/plan";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(decodeURIComponent(next), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section className="pt-32">
      <div className="mx-auto max-w-md border border-border/60 bg-card p-10">
        <span className="eyebrow">Welcome back</span>
        <h1 className="mt-3 font-serif text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your Bhumivox account to plan a journey.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-primary-foreground hover:bg-gold disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <Link to="/signup" className="hover:text-foreground">Create account</Link>
          <button
            type="button"
            onClick={() => alert("Password reset will be available soon.")}
            className="hover:text-foreground"
          >
            Forgot password?
          </button>
        </div>

        <p className="mt-8 border-t border-border/60 pt-4 text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          Demo · demo@bhumivox.in / demo1234
        </p>
      </div>
    </Section>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-2 w-full border-b border-border bg-transparent py-3 text-base outline-none focus:border-primary"
      />
    </label>
  );
}
