import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router";
import { Dialog as DialogPrimitive } from "radix-ui";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/demo";

const TITLE = "Alle Bereiche";

// One light panel below the hamburger for preview and pinned menu (KONZEPT §7, P5-06).
const PANEL =
  "panel-shadow absolute top-full left-0 z-50 mt-2 flex max-h-[calc(100dvh-6rem)] w-70 max-w-[calc(100vw-2rem)] flex-col overflow-y-auto rounded-2xl border bg-card text-card-foreground";

function MenuPanel({
  title,
  closeButton,
  onNavigate,
}: {
  title: ReactNode;
  closeButton: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b px-4 py-3">
        {title}
        {closeButton}
      </div>
      <nav aria-label={TITLE} className="flex flex-1 flex-col p-2">
        <p className="px-3 pt-2 pb-1 text-meta text-muted-foreground">
          Dein Studium
        </p>
        <ul className="space-y-0.5">
          {[...NAV_ITEMS, SETTINGS_ITEM].map((item) => (
            <li
              key={item.to}
              className={item === SETTINGS_ITEM ? "mt-2 border-t pt-2" : ""}
            >
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className="group flex min-h-11 items-center gap-3 rounded-xl px-3 text-body text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:font-semibold aria-[current=page]:text-foreground"
              >
                <item.icon className="size-5 shrink-0 group-aria-[current=page]:text-accent-strong" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <p className="mt-auto px-3 pt-6 pb-1 text-meta text-muted-foreground">
          {APP_NAME} · Prototyp mit Demodaten
        </p>
      </nav>
    </>
  );
}

/** Hover is a nonmodal disclosure; explicit activation pins the same panel as a focus-managed dialog. */
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
      <DialogPrimitive.Root
        open={mode === "pinned"}
        onOpenChange={(open) => {
          clearTimers();
          setMode(open ? "pinned" : null);
        }}
      >
        <DialogPrimitive.Trigger asChild>
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
        </DialogPrimitive.Trigger>
        {/* Rendered in place (no portal), so the pinned panel sits exactly where the preview does. The
            transparent overlay only catches outside clicks: the page stays visible and sharp. */}
        <DialogPrimitive.Overlay
          data-slot="navigation-overlay"
          className="fixed inset-0 z-40"
        />
        <DialogPrimitive.Content
          id={id}
          aria-describedby={undefined}
          className={PANEL}
        >
          <MenuPanel
            title={
              <DialogPrimitive.Title className="text-card-title">
                {TITLE}
              </DialogPrimitive.Title>
            }
            closeButton={
              <DialogPrimitive.Close asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Navigation schließen"
                >
                  <X />
                </Button>
              </DialogPrimitive.Close>
            }
            onNavigate={close}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Root>
      {mode === "preview" && (
        <div id={id} className={PANEL}>
          <MenuPanel
            title={<span className="text-card-title">{TITLE}</span>}
            closeButton={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Navigation schließen"
                onClick={close}
              >
                <X />
              </Button>
            }
            onNavigate={close}
          />
        </div>
      )}
    </div>
  );
}
