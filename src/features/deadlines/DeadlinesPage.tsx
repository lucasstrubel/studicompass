import { useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { CalendarDays, List, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SegmentedButton, SegmentedGroup } from "@/components/common/Segmented";
import { ChannelStatus } from "@/components/common/ChannelStatus";
import { EmptyState } from "@/components/common/EmptyState";
import { useDemoStore } from "@/store/use-demo-store";
import { selectAcademicState, selectAgenda } from "@/store/selectors";
import { DEMO_NOW } from "@/config/demo";
import type { PersonalDeadline } from "@/domain/types";
import { downloadDeadlines } from "@/lib/ics";
import { CHANNELS } from "@/services/types";
import { DeadlineDialog } from "./DeadlineDialog";
import { groupDeadlines } from "./deadline-groups";
import { DeadlineCalendar } from "./DeadlineCalendar";
import { DeadlineItem } from "./DeadlineItem";
import { calendarItems, type CalendarItem } from "./calendar-model";

/** Fristen (S7): the existing grouped list and a calendar share sources and own-entry actions. */
export function DeadlinesPage() {
  const agenda = useDemoStore(selectAgenda);
  const academic = useDemoStore(selectAcademicState);
  const [params, setParams] = useSearchParams();
  const calendar = params.get("ansicht") === "kalender";
  const setView = (value: "liste" | "kalender") => {
    const next = new URLSearchParams(params);
    if (value === "kalender") next.set("ansicht", value);
    else next.delete("ansicht");
    setParams(next, { preventScrollReset: true });
  };
  const pos = useDemoStore((state) => state.resources.pos.data);
  const resources = useDemoStore((state) => state.resources);
  const connected = useDemoStore((state) => state.connectedChannels);
  const personal = useDemoStore((state) => state.personalDeadlines);
  const savePersonalDeadline = useDemoStore(
    (state) => state.savePersonalDeadline,
  );
  const removePersonalDeadline = useDemoStore(
    (state) => state.removePersonalDeadline,
  );
  const [dialog, setDialog] = useState<PersonalDeadline | "new" | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const openDialog = (
    target: PersonalDeadline | "new",
    button: HTMLElement,
  ) => {
    opener.current = button;
    setDialog(target);
  };
  const loading = CHANNELS.some(
    (channel) =>
      connected[channel] &&
      (resources[channel].status === "loading" ||
        resources[channel].status === "idle"),
  );
  const incomplete = CHANNELS.some(
    (channel) => resources[channel].data === null,
  );
  const groups = groupDeadlines(agenda, DEMO_NOW);
  const future = groups.flatMap((group) => group.items);
  const remove = (entry: PersonalDeadline) => {
    removePersonalDeadline(entry.id);
    toast(`Termin gelöscht: ${entry.title}`, {
      action: {
        label: "Rückgängig",
        onClick: () => savePersonalDeadline(entry),
      },
    });
  };
  const renderItem = (item: CalendarItem) => {
    const moduleId =
      item.moduleId ??
      pos?.exams.find((exam) => exam.id === item.examId)?.moduleId;
    const module = pos?.modules.find((entry) => entry.id === moduleId);
    const own =
      item.origin === "personal"
        ? personal.find((entry) => entry.id === item.sourceId)
        : undefined;
    return (
      <DeadlineItem
        key={item.id}
        item={item}
        moduleTitle={module?.title}
        moduleId={moduleId}
        own={own}
        onEdit={openDialog}
        onRemove={remove}
      />
    );
  };
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <SegmentedGroup label="Fristenansicht">
            <SegmentedButton
              pressed={!calendar}
              onClick={() => setView("liste")}
            >
              <List aria-hidden="true" />
              Liste
            </SegmentedButton>
            <SegmentedButton
              pressed={calendar}
              onClick={() => setView("kalender")}
            >
              <CalendarDays aria-hidden="true" />
              Kalender
            </SegmentedButton>
          </SegmentedGroup>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={future.length === 0}
              onClick={() => downloadDeadlines(future)}
            >
              Alle Fristen zum Kalender hinzufügen
            </Button>
            <Button onClick={(event) => openDialog("new", event.currentTarget)}>
              <Plus aria-hidden="true" />
              Termin hinzufügen
            </Button>
          </div>
        </div>
        <ChannelStatus />
      </div>
      {loading && (
        <Skeleton
          role="status"
          aria-label="Fristen werden geladen"
          className="h-24"
        />
      )}
      {!loading && incomplete && (
        <p role="status" className="text-body text-muted-foreground">
          Die Fristen sind unvollständig. Prüfe den Sync-Status und verbinde
          getrennte Kanäle in den Einstellungen erneut.
        </p>
      )}
      {calendar ? (
        <DeadlineCalendar
          items={calendarItems(agenda, academic)}
          loading={loading}
          incomplete={incomplete}
          renderItem={renderItem}
        />
      ) : (
        groups.map((group) => (
          <section key={group.title} aria-label={group.title}>
            <h2 className="mb-3 text-section-title">{group.title}</h2>
            {group.items.length === 0 ? (
              loading || incomplete ? null : (
                <p className="text-body text-muted-foreground">
                  Keine Fristen in diesem Zeitraum.
                </p>
              )
            ) : (
              <ul className="divide-y rounded-xl border bg-card">
                {group.items.map(renderItem)}
              </ul>
            )}
          </section>
        ))
      )}
      {!calendar && future.length === 0 && !loading && !incomplete && (
        <EmptyState title="Keine anstehenden Fristen" />
      )}
      {dialog && (
        <DeadlineDialog
          key={dialog === "new" ? "new" : dialog.id}
          open
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
          entry={dialog === "new" ? undefined : dialog}
          onSaved={(title) => toast(`Termin gespeichert: ${title}`)}
          returnFocus={() => opener.current}
        />
      )}
    </div>
  );
}
