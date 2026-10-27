import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { formatDistanceStrict } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ChannelBadge } from "@/components/common/ChannelBadge";
import { ChannelStatus } from "@/components/common/ChannelStatus";
import { CHANNEL_LABELS } from "@/components/common/labels";
import { EmptyState } from "@/components/common/EmptyState";
import { useDemoStore } from "@/store/use-demo-store";
import { selectInbox } from "@/store/selectors";
import { selectInboxReason } from "@/store/inbox-selectors";
import type { Channel, InboxItem } from "@/domain/types";
import { CHANNELS } from "@/services/types";
import { formatDateTime } from "@/lib/format";
import { DEMO_NOW } from "@/config/demo";

function Message({
  item,
  open,
}: {
  item: InboxItem;
  open: (id: string, trigger: HTMLButtonElement) => void;
}) {
  const reason = useDemoStore((state) => selectInboxReason(state, item));
  const module = useDemoStore((state) =>
    state.resources.pos.data?.modules.find(
      (module) => module.id === item.moduleId,
    ),
  );
  return (
    <li>
      <button
        onClick={(event) => open(item.id, event.currentTarget)}
        className="w-full space-y-2 rounded-xl border bg-card p-4 text-left hover:bg-muted"
      >
        <span className="flex flex-wrap items-center gap-2">
          <ChannelBadge channel={item.channel} />
          <span className="text-meta text-muted-foreground">{item.sender}</span>
          {!item.read && (
            <span className="text-meta font-semibold">● Ungelesen</span>
          )}
        </span>
        <span className="block text-card-title">{item.subject}</span>
        <span className="block text-body text-muted-foreground">
          {item.preview}
        </span>
        <span className="block text-meta text-muted-foreground">
          {formatDistanceStrict(new Date(item.receivedAt), DEMO_NOW, {
            locale: de,
            addSuffix: true,
          })}
          {module && ` · ${module.title}`}
        </span>
        {reason && (
          <span className="block text-meta font-semibold">{reason}</span>
        )}
      </button>
    </li>
  );
}

export function InboxPage() {
  const all = useDemoStore(selectInbox);
  const resources = useDemoStore((state) => state.resources);
  const markRead = useDemoStore((state) => state.markRead);
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [unread, setUnread] = useState(false);
  const [params, setParams] = useSearchParams();
  const [original, setOriginal] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const id = params.get("eintrag");
  const selected = all.find((item) => item.id === id);
  const connected = useDemoStore((state) => state.connectedChannels);
  const busy = CHANNELS.some(
    (key) =>
      connected[key] &&
      (resources[key].status === "loading" || resources[key].status === "idle"),
  );
  const incomplete = CHANNELS.some((key) => resources[key].data === null);
  const filtered = all.filter(
    (item) =>
      (channel === "all" || item.channel === channel) &&
      (!unread || !item.read),
  );
  const high = filtered.filter((item) => item.relevance === "high");
  const normal = filtered.filter((item) => item.relevance !== "high");
  function close() {
    const next = new URLSearchParams(params);
    next.delete("eintrag");
    setParams(next, { preventScrollReset: true });
  }
  function open(itemId: string, button: HTMLButtonElement) {
    trigger.current = button;
    setOriginal(false);
    const next = new URLSearchParams(params);
    next.set("eintrag", itemId);
    setParams(next, { preventScrollReset: true });
  }
  return (
    <div className="space-y-5">
      <ChannelStatus />
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Nach Kanal filtern"
      >
        <Button
          variant={channel === "all" ? "default" : "outline"}
          aria-pressed={channel === "all"}
          onClick={() => setChannel("all")}
        >
          Alle
        </Button>
        {CHANNELS.map((key) => (
          <Button
            key={key}
            variant={channel === key ? "default" : "outline"}
            aria-pressed={channel === key}
            onClick={() => setChannel(key)}
          >
            {CHANNEL_LABELS[key]}
          </Button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-body">
        <input
          className="accent-primary"
          type="checkbox"
          checked={unread}
          onChange={(event) => setUnread(event.target.checked)}
        />
        Nur ungelesene
      </label>
      {busy && (
        <Skeleton
          role="status"
          aria-label="Nachrichten werden geladen"
          className="h-24"
        />
      )}
      {!busy && incomplete && (
        <p role="status" className="text-body text-muted-foreground">
          Das Postfach ist unvollständig. Prüfe den Sync-Status und verbinde
          getrennte Kanäle in den Einstellungen erneut.
        </p>
      )}
      {high.length > 0 && (
        <section aria-labelledby="important-inbox">
          <h2 id="important-inbox" className="mb-3 text-section-title">
            Für dich wichtig
          </h2>
          <ul className="grid gap-3 lg:grid-cols-2">
            {high.map((item) => (
              <Message key={item.id} item={item} open={open} />
            ))}
          </ul>
        </section>
      )}
      {normal.length > 0 && (
        <section aria-labelledby="other-inbox">
          <h2 id="other-inbox" className="mb-3 text-section-title">
            Weitere Nachrichten
          </h2>
          <ul className="grid gap-3 lg:grid-cols-2">
            {normal.map((item) => (
              <Message key={item.id} item={item} open={open} />
            ))}
          </ul>
        </section>
      )}
      {filtered.length === 0 && !busy && !incomplete && (
        <EmptyState
          title="Keine Nachrichten für diesen Filter"
          description="Wähle einen anderen Kanal oder zeige auch gelesene Nachrichten."
        />
      )}
      <Sheet
        open={!!id}
        onOpenChange={(value) => {
          if (!value) close();
        }}
      >
        <SheetContent
          className="data-[side=right]:w-full overflow-y-auto sm:max-w-xl"
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (trigger.current?.isConnected) trigger.current.focus();
            else document.getElementById("inhalt")?.focus();
          }}
        >
          <SheetHeader className="pr-16">
            <SheetTitle>
              {selected?.subject ??
                (busy
                  ? "Nachricht wird geladen …"
                  : "Nachricht nicht gefunden")}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-6 pb-6 text-body">
            {selected ? (
              <>
                <ChannelBadge channel={selected.channel} />
                <p>
                  {selected.sender} ·{" "}
                  {formatDateTime(new Date(selected.receivedAt))}
                </p>
                <p className="whitespace-pre-wrap break-words">
                  {selected.body}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setOriginal(true)}>
                    Im Original öffnen
                  </Button>
                  <Button
                    variant="outline"
                    disabled={selected.read}
                    onClick={() => markRead(selected.id)}
                  >
                    {selected.read ? "Gelesen" : "Als gelesen markieren"}
                  </Button>
                </div>
                {original && (
                  <p role="status">
                    Im echten Betrieb öffnet sich{" "}
                    {CHANNEL_LABELS[selected.channel]}. Im Prototyp bleibst du
                    hier.
                  </p>
                )}
                {selected.moduleId && (
                  <p>
                    <Link
                      className="underline"
                      to={`/module/${selected.moduleId}`}
                    >
                      Zum Modul
                    </Link>
                  </p>
                )}
              </>
            ) : (
              !busy && (
                <EmptyState
                  title="Diese Nachricht ist nicht verfügbar"
                  description="Prüfe den Link oder lade den betroffenen Kanal erneut."
                />
              )
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
