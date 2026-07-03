import { useState } from "react";
import { Section } from "@/components/Section";
import { RequireAuth } from "@/components/RequireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function SettingsInner() {
  const { user, updateProfile, changePassword } = useAuth();
  if (!user) return null;

  return (
    <Section className="pt-32">
      <div className="mx-auto max-w-2xl">
        <span className="eyebrow">Account</span>
        <h1 className="mt-3 font-serif text-4xl">Settings</h1>

        <Tabs defaultValue="profile" className="mt-10">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-8">
            <ProfileForm
              initial={{ name: user.fullName, phone: user.phone, avatar: user.avatar }}
              email={user.email}
              onSave={updateProfile}
            />
          </TabsContent>

          <TabsContent value="password" className="mt-8">
            <PasswordForm onSubmit={changePassword} />
          </TabsContent>
        </Tabs>
      </div>
    </Section>
  );
}

export default function SettingsPage() {
  useSeo({ title: "Settings — Bhumivox" });
  return (
    <RequireAuth>
      <SettingsInner />
    </RequireAuth>
  );
}

function ProfileForm({
  initial,
  email,
  onSave,
}: {
  initial: { name: string; phone: string; avatar: string };
  email: string;
  onSave: (patch: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
}) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [avatar, setAvatar] = useState(initial.avatar);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleAvatar = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setAvatar(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await onSave({ name, phone, avatar });
      setMsg("Profile updated.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 border border-border/60 bg-card p-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatar || undefined} alt={name} />
          <AvatarFallback className="bg-primary text-primary-foreground">{initials(name)}</AvatarFallback>
        </Avatar>
        <label className="cursor-pointer border border-border px-4 py-2 text-[0.7rem] uppercase tracking-[0.22em] hover:bg-muted">
          Upload avatar
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && e.target.files[0] && handleAvatar(e.target.files[0])}
          />
        </label>
        {avatar && (
          <button
            type="button"
            onClick={() => setAvatar("")}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Remove
          </button>
        )}
      </div>

      <Field label="Full Name" type="text" value={name} onChange={setName} />
      <Field label="Email" type="email" value={email} onChange={() => {}} disabled />
      <Field label="Phone" type="tel" value={phone} onChange={setPhone} />

      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-primary px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-primary-foreground hover:bg-gold disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function PasswordForm({ onSubmit }: { onSubmit: (current: string, next: string) => Promise<void> }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (next !== confirm) {
      setErr("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(current, next);
      setMsg("Password updated.");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 border border-border/60 bg-card p-8">
      <Field label="Current password" type="password" value={current} onChange={setCurrent} />
      <Field label="New password" type="password" value={next} onChange={setNext} />
      <Field label="Confirm new password" type="password" value={confirm} onChange={setConfirm} />
      {err && <p className="text-sm text-destructive">{err}</p>}
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-primary px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-primary-foreground hover:bg-gold disabled:opacity-50"
      >
        {saving ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  disabled,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-border bg-transparent py-3 text-base outline-none focus:border-primary disabled:opacity-60"
      />
    </label>
  );
}
