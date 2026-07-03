import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings, Moon, Sun, User as UserIcon, Luggage } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

declare const __APP_VERSION__: string;

function initials(name?: string) {
  if (!name) return "";

  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ scrolled }: { scrolled: boolean }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Link
        to="/login?next=/plan"
        className={`hidden text-xs uppercase tracking-[0.22em] md:inline-block ${
          scrolled ? "text-muted-foreground hover:text-ivory" : "text-white/80 hover:text-white"
        }`}
      >
        Sign in
      </Link>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-2 rounded-full border p-0.5 transition-colors ${
            scrolled ? "border-border hover:border-primary" : "border-white/40 hover:border-white"
          }`}
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || undefined} alt={user.fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {initials(user.fullName) || <UserIcon size={14} />}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-serif text-base text-foreground">{user.fullName}</span>
            <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div
          className="flex items-center justify-between px-2 py-2 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="flex items-center gap-2">
            {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
            Theme
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Light</span>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} aria-label="Toggle theme" />
            <span>Dark</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/my-bookings" className="flex items-center gap-2">
            <Luggage size={14} /> My Bookings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2">
            <Settings size={14} /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
          <LogOut size={14} /> Logout
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          App Version v{typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.2.0"}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
