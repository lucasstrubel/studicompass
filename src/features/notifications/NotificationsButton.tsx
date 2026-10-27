import { useState } from "react";
import { Bell, CalendarClock, Flag, Mail, TriangleAlert } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { CitationList } from "@/components/common/CitationList";
import { useDemoStore } from "@/store/use-demo-store";
import { selectNotifications, selectRulesById } from "@/store/selectors";
import { formatDateTime } from "@/lib/format";

const ICONS = {
  decision: TriangleAlert,
  inbox: Mail,
  milestone: Flag,
  deadline: CalendarClock,
};
const LABELS = {
  decision: "Entscheidung",
  inbox: "Postfach",
  milestone: "Meilenstein",
  deadline: "Frist",
};

export function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const all = useDemoStore(selectNotifications);
  const enabled = useDemoStore((state) => state.notificationTypes);
  const markRead = useDemoStore((state) => state.markNotificationRead);
  const markAll = useDemoStore((state) => state.markAllNotificationsRead);
  const rules = useDemoStore(selectRulesById);
  const items = all.filter((item) => enabled[item.type]);
  const unread = items.filter((item) => !item.read).length;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Benachrichtigungen${unread ? `, ${unread} ungelesen` : ""}`}
          className="relative"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 rounded-full bg-primary px-1.5 text-meta text-primary-foreground tabular-nums"
            >
              {unread}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        className="data-[side=right]:w-full overflow-y-auto sm:max-w-lg"
        aria-describedby={undefined}
      >
        <SheetHeader>
          <SheetTitle>Benachrichtigungen</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-6 pb-6">
          <ResourceBoundary
            services={["website"]}
            skeleton={
              <Skeleton
                role="status"
                aria-label="Benachrichtigungen werden geladen"
                className="h-40"
              />
            }
          >
            {() => (
              <>
                <Button variant="outline" disabled={!unread} onClick={markAll}>
                  Alle als gelesen markieren
                </Button>
                {items.length === 0 && (
                  <EmptyState
                    title="Keine Benachrichtigungen"
                    description="Du kannst die Benachrichtigungstypen in den Einstellungen auswählen."
                  />
                )}
                <ul className="space-y-4">
                  {items.map((item) => {
                    const Icon = ICONS[item.type];
                    const citations = item.ruleIds.flatMap((id) =>
                      rules[id] ? [rules[id].citation] : [],
                    );
                    return (
                      <li
                        key={item.id}
                        className="space-y-2 rounded-xl border p-3 text-body"
                      >
                        <p className="flex flex-wrap items-center gap-2 text-meta">
                          <Icon className="size-4" aria-hidden="true" />
                          {LABELS[item.type]} ·{" "}
                          {item.read ? "Gelesen" : "Ungelesen"}
                        </p>
                        <p>{item.message}</p>
                        <time
                          className="text-meta text-muted-foreground"
                          dateTime={item.createdAt}
                        >
                          {formatDateTime(new Date(item.createdAt))}
                        </time>
                        <CitationList
                          citations={
                            citations.length
                              ? citations
                              : [
                                  {
                                    document: item.ruleIds.length
                                      ? "SPO und Modulhandbuch Wirtschaftsinformatik (Beispiel; Regelwerk gerade nicht verfügbar)"
                                      : item.type === "inbox"
                                        ? "Mail – Raumänderung Statistik (Demodaten)"
                                        : "TH-Website – Rückmeldung (Demodaten)",
                                    summary: item.message,
                                    verified: false,
                                  },
                                ]
                          }
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              to={item.href}
                              onClick={() => {
                                markRead(item.id);
                                setOpen(false);
                              }}
                            >
                              Ansehen
                            </Link>
                          </Button>
                          {!item.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markRead(item.id)}
                            >
                              Als gelesen markieren
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </ResourceBoundary>
        </div>
      </SheetContent>
    </Sheet>
  );
}
