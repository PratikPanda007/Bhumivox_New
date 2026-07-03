import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Section } from "@/components/Section";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";

export default function SignupPage() {
  useSeo({ title: "Create account — Bhumivox", description: "Create your Bhumivox account." });
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/plan";
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signup(form);
      navigate(decodeURIComponent(next), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section className="pt-32">
      <div className="mx-auto max-w-md border border-border/60 bg-card p-10">
        <span className="eyebrow">Begin your journey</span>
        <h1 className="mt-3 font-serif text-4xl">Create account</h1>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <Field label="Full Name" type="text" value={form.name} onChange={set("name")} required />
          <Field label="Email" type="email" value={form.email} onChange={set("email")} required />
          <Field label="Phone" type="tel" value={form.phone} onChange={set("phone")} required />
          <Field label="Password" type="password" value={form.password} onChange={set("password")} required />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-primary-foreground hover:bg-gold disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
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
