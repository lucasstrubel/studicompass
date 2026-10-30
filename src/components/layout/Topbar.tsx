import { useRef } from "react";
import { Compass, Settings, UserRound } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router";
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
import { APP_NAME } from "@/config/demo";
import { NotificationsButton } from "@/features/notifications/NotificationsButton";
import { useDemoStore } from "@/store/use-demo-store";
import { selectProfileName } from "@/store/selectors";

/** Avatar menu with the student's initials (KONZEPT A-6); the icon stands in while the POS data loads. */
function ProfileMenu() {
  const focusProfile = useRef(false);
  const name = useDemoStore(selectProfileName);
  const initials = name
    ? `${name.firstName.charAt(0)}${name.lastName.charAt(0)}`.toLocaleUpperCase(
        "de-DE",
      )
    : null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Profil">
          <Avatar>
            <AvatarFallback className="text-meta font-semibold text-foreground">
              {initials ?? <UserRound className="size-5" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(event) => {
          if (!focusProfile.current) return;
          // Navigation already focused the profile; closing the menu must not return to the avatar.
          event.preventDefault();
          document.getElementById("profil")?.focus();
          focusProfile.current = false;
        }}
      >
        <DropdownMenuItem asChild>
          <Link to="/einstellungen">
            <Settings />
            Einstellungen
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          onSelect={() => {
            focusProfile.current = true;
          }}
        >
          <Link to="/einstellungen#profil">
            <UserRound />
            Profil bearbeiten
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Shared top navigation; the page heading belongs to the content area. */
export function Topbar() {
  const location = useLocation();
  return (
    <header className="relative z-30 flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-card px-4 py-3 md:px-6">
      {/* Below 1280 px only; above, the top bar lists every area (P5-09). */}
      <div className="xl:hidden">
        <NavigationMenu key={location.key} />
      </div>
      <Link
        to="/"
        aria-label={APP_NAME + " – Übersicht"}
        className="flex items-center gap-2 text-card-title"
      >
        <Compass className="size-6 text-accent-strong" />
        <span>{APP_NAME}</span>
      </Link>
      <nav
        aria-label="Hauptnavigation"
        className="ml-2 hidden xl:block 2xl:ml-5"
      >
        <ul className="flex items-center gap-1">
          {TOP_NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className="block rounded-lg border-b-2 border-transparent px-2 py-2 text-meta whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:border-accent-strong aria-[current=page]:font-semibold aria-[current=page]:text-foreground 2xl:px-3"
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="ml-auto flex items-center gap-1">
        <NotificationsButton />
        <ProfileMenu />
      </div>
    </header>
  );
}
