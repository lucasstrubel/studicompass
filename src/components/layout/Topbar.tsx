import { Compass, Moon, Settings, Sun, UserRound } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router";
import { useTheme } from "@/app/theme-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavigationMenu } from "@/components/layout/NavigationMenu";
import { TOP_NAV_ITEMS } from "@/components/layout/navigation";
import { APP_NAME, DEMO_NOW } from "@/config/demo";
import { formatDate } from "@/lib/format";

import { NotificationsButton } from "@/features/notifications/NotificationsButton";

/** Avatar menu; initials and name follow with the student data from the store (P2-05, KONZEPT A-6). */
function ProfileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Profil">
          <Avatar>
            <AvatarFallback>
              <UserRound className="size-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/einstellungen">
            <Settings />
            Einstellungen
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      role="switch"
      aria-label="Dunkelmodus"
      aria-checked={dark}
      title={
        dark ? "Zum hellen Design wechseln" : "Zum dunklen Design wechseln"
      }
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}

/** Shared top navigation; the page heading belongs to the content area. */
export function Topbar() {
  const location = useLocation();
  return (
    <header className="relative z-30 flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-card px-4 py-3 md:px-6">
      <NavigationMenu key={location.key} />
      <Link
        to="/"
        aria-label={APP_NAME + " – Übersicht"}
        className="flex items-center gap-2 text-card-title"
      >
        <Compass className="size-6 text-accent-strong" />
        <span>{APP_NAME}</span>
      </Link>
      <nav aria-label="Hauptnavigation" className="ml-5 hidden xl:block">
        <ul className="flex items-center gap-1">
          {TOP_NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className="block rounded-lg border-b-2 border-transparent px-3 py-2 text-meta text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:border-accent-strong aria-[current=page]:font-semibold aria-[current=page]:text-foreground"
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <NotificationsButton />
        <ProfileMenu />
      </div>
      <div className="basis-full pl-1 md:ml-auto md:basis-auto md:pl-0">
        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-meta text-muted-foreground tabular-nums">
          {"Demo · " + formatDate(DEMO_NOW)}
        </span>
      </div>
    </header>
  );
}
