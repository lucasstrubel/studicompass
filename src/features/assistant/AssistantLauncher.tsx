import { useEffect, useState } from "react";
import { Maximize2, MessageCircleQuestionMark, X } from "lucide-react";
import { Link, useLocation } from "react-router";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { demoStore } from "@/store/demo-store";
import { useDemoStore } from "@/store/use-demo-store";
import { AssistantChat } from "./AssistantChat";

const HINT_ID = "assistant-hint";
/** Scrolling this far retires the speech bubble; the scroll reset after a page change is no reason. */
const HINT_SCROLL_PX = 40;

/**
 * Assistant button at the bottom right of every shell page except the assistant page (KONZEPT §7, §8 S5;
 * P5-06): the key feature is visible right away. A speech bubble introduces it once per demo state
 * (P5-07); the button opens the assistant window, which continues the conversation of the assistant page.
 */
export function AssistantLauncher() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [pageKey, setPageKey] = useState(location.key);
  // The store only remembers that the bubble was shown; whether it is still visible is local.
  const [hintVisible, setHintVisible] = useState(
    () => !demoStore.getState().assistantHintSeen,
  );
  const markHintSeen = useDemoStore((state) => state.markAssistantHintSeen);
  const onboardingComplete = useDemoStore((state) => state.onboardingComplete);
  const firstName = useDemoStore(
    (state) => state.resources.pos.data?.student.firstName,
  );
  const onAssistantPage = location.pathname === "/assistent";
  // Only after the onboarding: before it, the overview renders the shell for a moment and then redirects.
  const hint = hintVisible && onboardingComplete && !open && !onAssistantPage;

  // A page change closes the window (e.g. "Folgen-Check öffnen" in an answer) and retires the bubble.
  if (location.key !== pageKey) {
    setPageKey(location.key);
    setOpen(false);
    setHintVisible(false);
  }
  // Showing it once per demo state is enough; a reload does not bring it back.
  useEffect(() => {
    if (hint) markHintSeen();
  }, [hint, markHintSeen]);
  // Once people start working on the page, the bubble gets out of the way.
  useEffect(() => {
    if (!hint) return;
    const start = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - start) > HINT_SCROLL_PX)
        setHintVisible(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hint]);
  if (onAssistantPage) return null;

  const openWindow = () => {
    setHintVisible(false);
    setOpen(true);
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => (next ? openWindow() : setOpen(false))}
    >
      {/* Button and bubble sit at z-20, below the top bar (z-30), so the open menu panel covers them. */}
      {hint && (
        <div className="fixed right-6 bottom-24 z-20 w-64 max-w-[calc(100vw-3rem)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
          <div className="panel-shadow relative rounded-2xl border bg-card p-3 pr-10">
            <button
              type="button"
              id={HINT_ID}
              onClick={openWindow}
              className="rounded-sm text-left text-body"
            >
              <span className="block font-semibold">
                Hallo{firstName ? ` ${firstName}` : ""}!
              </span>{" "}
              Fragen zur Prüfungsordnung? Ich antworte mit Quelle.
            </button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Hinweis ausblenden"
              className="absolute top-2 right-2"
              onClick={() => setHintVisible(false)}
            >
              <X />
            </Button>
            {/* Tail pointing at the button below. */}
            <span
              aria-hidden="true"
              className="absolute -bottom-1.5 right-6 size-3 rotate-45 border-r border-b bg-card"
            />
          </div>
        </div>
      )}
      <DialogPrimitive.Trigger asChild>
        <Button
          aria-label="Assistent öffnen"
          aria-describedby={hint ? HINT_ID : undefined}
          className="panel-shadow fixed right-6 bottom-6 z-20 size-14 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <MessageCircleQuestionMark className="size-6" aria-hidden="true" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        {/* Transparent: the page stays visible and sharp; the overlay only catches outside clicks. */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50" />
        <DialogPrimitive.Content
          className="panel-shadow fixed inset-0 z-50 flex flex-col overflow-hidden bg-card text-card-foreground md:inset-auto md:right-6 md:bottom-6 md:h-[min(40rem,calc(100dvh-3rem))] md:w-[min(26rem,calc(100vw-3rem))] md:rounded-2xl md:border motion-safe:data-open:animate-in motion-safe:data-open:fade-in-0 motion-safe:data-open:slide-in-from-bottom-4"
          onOpenAutoFocus={(event) => {
            const field =
              event.currentTarget instanceof HTMLElement
                ? event.currentTarget.querySelector("input")
                : null;
            if (field) {
              event.preventDefault();
              field.focus();
            }
          }}
        >
          <div className="flex items-start gap-3 border-b px-4 py-3">
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-card-title">
                Assistent
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-meta text-muted-foreground">
                Antworten stützen sich auf SPO und Modulhandbuch. Verbindlich
                ist das Prüfungsamt.
              </DialogPrimitive.Description>
            </div>
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to="/assistent" aria-label="Auf der Assistent-Seite öffnen">
                <Maximize2 aria-hidden="true" />
              </Link>
            </Button>
            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Assistent schließen"
              >
                <X />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <ResourceBoundary
              services={["assistant", "rules"]}
              skeleton={
                <Skeleton
                  role="status"
                  aria-label="Assistent wird geladen"
                  className="m-4 h-40"
                />
              }
            >
              {() => <AssistantChat variant="panel" />}
            </ResourceBoundary>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
