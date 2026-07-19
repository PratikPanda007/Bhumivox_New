import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Section } from "@/components/Section";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";
import { authService } from "@/services/auth-service";

export default function LoginPage() {
  useSeo({
    title: "Sign In — Bhumivox",
    description: "Sign in to plan and manage your journey.",
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/plan";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
        navigate(decodeURIComponent(next), { replace: true });
        return;
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      await authService.signup({
          name: fullName,
          email,
          phone,
          password,
      });

      setSuccess("Registration successful. Please sign in.");
      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setPhone("");
      setFullName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section className="pt-32">
      <div className="mx-auto max-w-md border border-border/60 bg-card p-10">

        <span className="eyebrow">
          {mode === "login" ? "Welcome back" : "Join Bhumivox"}
        </span>

        <h1 className="mt-3 font-serif text-4xl">
          {mode === "login" ? "Sign in" : "Create Account"}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login"
            ? "Use your Bhumivox account to plan a journey."
            : "Create your account to begin your spiritual journey."}
        </p>

        {/* Toggle */}

        <div className="mt-8 flex overflow-hidden rounded-md border border-border">

          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-3 text-xs uppercase tracking-[0.25em] transition ${
              mode === "login"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-3 text-xs uppercase tracking-[0.25em] transition ${
              mode === "signup"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            Sign Up
          </button>

        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">

          {mode === "signup" && (
            <>
              <Field
                label="Full Name"
                type="text"
                value={fullName}
                onChange={setFullName}
                required
              />

              <Field
                label="Phone"
                type="tel"
                value={phone}
                onChange={setPhone}
                required
              />
            </>
          )}

          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />

          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
          />

          {mode === "signup" && (
            <Field
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
            />
          )}

          {success && (
            <p className="text-sm text-green-500">
              {success}
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-primary-foreground hover:bg-gold disabled:opacity-50"
          >
            {submitting
              ? mode === "login"
                ? "Signing in..."
                : "Creating Account..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>

        </form>

        {mode === "login" && (
          <div className="mt-6 flex justify-end text-xs text-muted-foreground">

            <button
              type="button"
              onClick={() =>
                alert("Password reset will be available soon.")
              }
              className="hover:text-foreground"
            >
              Forgot password?
            </button>

          </div>
        )}

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

      <span className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </span>

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