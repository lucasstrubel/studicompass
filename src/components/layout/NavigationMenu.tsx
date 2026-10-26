import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { APP_NAME } from "@/config/demo";

function MenuLinks({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav aria-label="Alle Bereiche" className="flex flex-1 flex-col p-4">
      <p className="mb-3 px-3 text-meta text-sidebar-muted">Dein Studium</p>
      <ul className="space-y-1">
        {[...NAV_ITEMS, SETTINGS_ITEM].map((item) => (
          <li
            key={item.to}
            className={
              item === SETTINGS_ITEM
                ? "mt-6 border-t border-sidebar-border pt-4"
                : ""
            }
          >
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className="flex min-h-11 items-center gap-3 rounded-lg border-l-3 border-transparent px-3 text-body text-sidebar-muted hover:bg-sidebar-active hover:text-sidebar-foreground aria-[current=page]:border-sidebar-primary aria-[current=page]:bg-sidebar-active aria-[current=page]:font-semibold aria-[current=page]:text-sidebar-foreground"
            >
              <item.icon className="size-5 shrink-0" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <p className="mt-auto px-3 pt-10 text-meta text-sidebar-muted">
        {APP_NAME} · Designvorschau
      </p>
    </nav>
  );
}

/** Hover is a nonmodal disclosure; explicit activation opens a focus-managed Radix sheet. */
export function NavigationMenu() {
  const [mode, setMode] = useState<"preview" | "pinned" | null>(null);
  const id = useId();
  const area = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };
  const close = () => {
    clearTimers();
    setMode(null);
  };

  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (mode !== "preview") return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMode(null);
        trigger.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !area.current?.contains(event.target))
        setMode(null);
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
    };
  }, [mode]);

  return (
    <div
      ref={area}
      className="relative shrink-0"
      onPointerEnter={(event) => {
        clearTimeout(closeTimer.current);
        if (
          event.pointerType === "mouse" &&
          window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
          mode === null
        ) {
          clearTimeout(openTimer.current);
          openTimer.current = setTimeout(() => setMode("preview"), 150);
        }
      }}
      onPointerLeave={() => {
        clearTimeout(openTimer.current);
        closeTimer.current = setTimeout(() => {
          // Keyboard focus in the disclosure must not disappear when the pointer leaves.
          if (!area.current?.contains(document.activeElement))
            setMode((current) => (current === "preview" ? null : current));
        }, 250);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setMode((current) => (current === "preview" ? null : current));
      }}
    >
      <Sheet
        open={mode === "pinned"}
        onOpenChange={(open) => {
          clearTimers();
          setMode(open ? "pinned" : null);
        }}
      >
        <SheetTrigger asChild>
          <Button
            ref={trigger}
            variant="ghost"
            size="icon"
            aria-label="Navigation öffnen"
            aria-expanded={mode !== null}
            aria-controls={id}
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          id={id}
          side="left"
          showCloseButton={false}
          aria-describedby={undefined}
          className="overflow-y-auto data-[side=left]:w-70 max-w-full border-sidebar-border bg-sidebar text-sidebar-foreground [--ring:var(--sidebar-ring)]"
        >
          <SheetHeader className="flex-row items-center justify-between border-b border-sidebar-border p-4">
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Navigation einklappen"
                className="hover:bg-sidebar-active hover:text-sidebar-foreground"
              >
                <Menu />
              </Button>
            </SheetClose>
            <SheetTitle className="flex items-center gap-2 text-card-title text-sidebar-foreground">
              {APP_NAME}
            </SheetTitle>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Navigation schließen"
                className="hover:bg-sidebar-active hover:text-sidebar-foreground"
              >
                <X />
              </Button>
            </SheetClose>
          </SheetHeader>
          <MenuLinks onNavigate={close} />
        </SheetContent>
      </Sheet>
      {mode === "preview" && (
        <div
          id={id}
          className="absolute top-full -left-4 z-50 flex max-h-[calc(100dvh-6rem)] w-70 max-w-[calc(100vw-2rem)] flex-col overflow-y-auto rounded-b-xl bg-sidebar text-sidebar-foreground shadow-xl [--ring:var(--sidebar-ring)]"
        >
          <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
            <span className="text-card-title">Alle Bereiche</span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Navigation schließen"
              onClick={close}
              className="hover:bg-sidebar-active hover:text-sidebar-foreground"
            >
              <X />
            </Button>
          </div>
          <MenuLinks onNavigate={close} />
        </div>
      )}
    </div>
  );
}
