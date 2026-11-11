import { useRef } from "react";
import { m } from "motion/react";
import { Landmark, Settings, UserRound } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router";
import { BrandMark } from "@/components/common/BrandMark";
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

/** Avatar menu with the student's initials; the icon stands in while the POS data loads. */
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
        {/* Not an area of its own in the navigation, but findable without asking the assistant first. */}
        <DropdownMenuItem asChild>
          <Link to="/anlaufstellen">
            <Landmark />
            Anlaufstellen
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
    <header className="relative z-30 border-b bg-card">
      <div className="mx-auto flex max-w-360 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:px-6 xl:px-8">
        {/* Below 1280 px only; above, the top bar lists every area (P5-09). */}
        <div className="xl:hidden">
          <NavigationMenu key={location.key} />
        </div>
        <Link
          to="/"
          aria-label={APP_NAME + " – Übersicht"}
          className="flex items-center gap-1.5 rounded-sm text-section-title"
        >
          <BrandMark />
          <span>{APP_NAME}</span>
        </Link>
        <nav aria-label="Hauptnavigation" className="ml-4 hidden xl:block">
          <ul className="flex items-center gap-1">
            {TOP_NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className="relative block rounded-lg px-3 py-1.5 text-body font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:text-foreground"
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        // Glides to the new page, so the eye follows the change of place.
                        <m.span
                          layoutId="nav-indicator"
                          transition={{
                            duration: 0.2,
                            ease: [0.23, 1, 0.32, 1],
                          }}
                          aria-hidden="true"
                          className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-accent"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <NotificationsButton />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
