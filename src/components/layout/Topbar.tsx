import { Bell, Settings, UserRound } from "lucide-react";
import { Link } from "react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DEMO_NOW } from "@/config/demo";
import { formatDate } from "@/lib/format";

/** S8: the bell opens the notifications. Their count and list arrive together with P4-05. */
function NotificationsButton() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Benachrichtigungen">
          <Bell className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Benachrichtigungen</SheetTitle>
        </SheetHeader>
        <p className="px-6 text-body text-muted-foreground">
          Du hast keine neuen Benachrichtigungen.
        </p>
      </SheetContent>
    </Sheet>
  );
}

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

/** Top bar of the main column (KONZEPT §8 S1, §12.1): page title, demo chip, bell and avatar menu. */
export function Topbar({ title }: { title: string }) {
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-4 py-3 md:px-6 md:py-4 xl:px-8">
      <h1 className="min-w-0 flex-1 text-page-title md:flex-none">{title}</h1>
      {/* Below 768 px the chip gets its own row under the title and the buttons. */}
      <div className="order-last basis-full md:order-none md:basis-auto">
        <span className="inline-flex rounded-full bg-accent-soft px-2.5 py-0.5 text-meta text-accent-soft-foreground tabular-nums">
          {`Demo · ${formatDate(DEMO_NOW)}`}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <NotificationsButton />
        <ProfileMenu />
      </div>
    </header>
  );
}
