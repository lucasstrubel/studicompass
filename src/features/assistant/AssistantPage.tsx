import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CitationList } from "@/components/common/CitationList";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoStore } from "@/store/use-demo-store";
import { demoStore } from "@/store/demo-store";
import {
  selectAssistantMatch,
  selectAssistantPersonal,
} from "@/store/assistant-selectors";
import type { AssistantEntry } from "@/domain/types";
import { selectAcademicState } from "@/store/selectors";
import { semesterNumber } from "@/domain/terms";

function AnswerText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*\*.*?\*\*)/g)
        .map((part, index) =>
          part.startsWith("**") ? (
            <strong key={index}>{part.slice(2, -2)}</strong>
          ) : (
            part
          ),
        )}
    </>
  );
}

function Answer({
  entry,
  ask,
  pending,
}: {
  entry: AssistantEntry;
  ask: (question: string, id?: string) => void;
  pending: boolean;
}) {
  const personal = useDemoStore((state) =>
    selectAssistantPersonal(state, entry),
  );
  const rules = useDemoStore((state) => state.resources.rules.data);
  const catalog = useDemoStore(
    (state) => state.resources.assistant.data?.catalog ?? [],
  );
  const sources =
    rules?.rules.filter((rule) => entry.ruleIds.includes(rule.id)) ?? [];
  const officeIds = new Set([
    ...entry.officeIds,
    ...sources.flatMap((rule) => (rule.officeId ? [rule.officeId] : [])),
  ]);
  const offices =
    rules?.offices.filter((office) => officeIds.has(office.id)) ?? [];
  return (
    <article className="min-w-0 space-y-4 rounded-xl border bg-card p-4 text-body">
      <p className="text-meta text-muted-foreground">
        KI-Antwort · verbindlich ist die SPO · Antworten im Prototyp vorbereitet
      </p>
      <p>
        <AnswerText
          text={
            entry.resolver === "progressSummary" ? personal : entry.shortAnswer
          }
        />
      </p>
      <p>
        <strong>Für dich heißt das: </strong>
        {personal}
      </p>
      {entry.details && (
        <details>
          <summary className="cursor-pointer font-semibold">Details</summary>
          <p className="mt-2">{entry.details}</p>
        </details>
      )}
      <CitationList citations={sources.map((rule) => rule.citation)} />
      <div>
        <h3 className="font-semibold">Zuständig</h3>
        {offices.map((office) => (
          <p key={office.id} className="break-words">
            {office.name} · {office.email}
            {office.hours && ` · ${office.hours}`}
          </p>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {entry.actions.map((action) => (
          <Button key={action.href} variant="outline" asChild>
            <Link to={action.href}>{action.label}</Link>
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {entry.followUpIds
          .map((id) => catalog.find((item) => item.id === id))
          .map(
            (item) =>
              item && (
                <Button
                  key={item.id}
                  variant="outline"
                  className="h-auto max-w-full whitespace-normal text-left"
                  disabled={pending}
                  onClick={() => ask(item.question, item.id)}
                >
                  {item.question}
                </Button>
              ),
          )}
      </div>
    </article>
  );
}

function Chat() {
  const [params] = useSearchParams();
  const data = useDemoStore((state) => state.resources.assistant.data);
  const pos = useDemoStore((state) => state.resources.pos.data);
  const academic = useDemoStore(selectAcademicState);
  const offices = useDemoStore((state) => state.resources.rules.data?.offices);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    { question: string; id: string | null }[]
  >([]);
  const [pending, setPending] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const initial = useRef("");
  const module = pos?.modules.find(
    (item) => item.id === (params.get("module") ?? params.get("modul")),
  );
  function ask(text: string, id?: string) {
    if (!text.trim() || timer.current) return;
    setPending(true);
    setQuestion("");
    timer.current = setTimeout(() => {
      setMessages((items) => [
        ...items,
        {
          question: text.trim(),
          id: id ?? selectAssistantMatch(demoStore.getState(), text),
        },
      ]);
      setPending(false);
      timer.current = null;
      input.current?.focus();
    }, 800);
  }
  const incoming = params.get("frage") ?? params.get("q") ?? "";
  useEffect(() => {
    if (!incoming || initial.current === incoming || !data) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    initial.current = incoming;
    const entry = data.catalog.find((item) => item.id === incoming);
    ask(entry?.question ?? incoming, entry?.id);
    // The URL is an entry action; later store changes must not resubmit it.
  }, [incoming, data]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      initial.current = "";
    },
    [],
  );
  if (!data) return null;
  const draft =
    draftQuestion === data.fallback.question
      ? data.fallback.draft
      : `Betreff: Frage zur Prüfungsordnung\n\nGuten Tag, ich studiere ${pos?.program.title ?? "Wirtschaftsinformatik"}${academic ? ` im ${semesterNumber(academic.currentTerm, academic.student.startTerm)}. Fachsemester` : ""}. Meine Matrikelnummer ist ${pos?.student.matriculationNo ?? "nicht verfügbar"}.\n\n${draftQuestion ?? ""}\n\nViele Grüße\n${pos?.student.firstName ?? ""} ${pos?.student.lastName ?? ""}`;
  return (
    <div className="min-w-0 max-w-3xl space-y-5">
      <p className="text-body">
        Fragen zu deinem Studium? Antworten stützen sich auf SPO und
        Modulhandbuch. Verbindlich ist das Prüfungsamt.
      </p>
      {module && (
        <p className="inline-block rounded-full bg-muted px-3 py-1 text-meta">
          bezogen auf: {module.title}
        </p>
      )}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {data.catalog
            .filter((entry) => entry.suggested)
            .map((entry) => (
              <Button
                key={entry.id}
                variant="outline"
                className="h-auto max-w-full whitespace-normal text-left"
                disabled={pending}
                onClick={() => ask(entry.question, entry.id)}
              >
                {entry.question}
              </Button>
            ))}
        </div>
      )}
      <div
        className="space-y-5"
        aria-label="Chatverlauf"
        role="log"
        aria-live="polite"
        aria-busy={pending}
      >
        {messages.map((message, index) => {
          const entry = data.catalog.find((item) => item.id === message.id);
          return (
            <section key={index} className="space-y-3">
              <h2 className="text-card-title break-words">
                {message.question}
              </h2>
              {entry ? (
                <Answer entry={entry} ask={ask} pending={pending} />
              ) : (
                <article className="space-y-3 rounded-xl border bg-card p-4 text-body">
                  <p className="text-meta text-muted-foreground">
                    KI-Antwort · verbindlich ist die SPO · Antworten im Prototyp
                    vorbereitet
                  </p>
                  <p>{data.fallback.answer}</p>
                  <p>
                    Quellenlage: In SPO und Modulhandbuch ist dazu keine
                    eindeutige Regel hinterlegt.
                  </p>
                  <h3 className="font-semibold">Zuständig</h3>
                  {offices
                    ?.filter((office) =>
                      data.fallback.officeIds.includes(office.id),
                    )
                    .map((office) => (
                      <p key={office.id} className="break-words">
                        {office.name} · {office.email} · {office.hours}
                      </p>
                    ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDraftQuestion(message.question);
                      setCopyStatus("");
                    }}
                  >
                    Anfrage vorbereiten
                  </Button>
                </article>
              )}
            </section>
          );
        })}
      </div>
      <p role="status" className="text-meta text-muted-foreground">
        {pending ? "Antwort wird vorbereitet …" : ""}
      </p>
      <details>
        <summary className="cursor-pointer text-body font-semibold">
          Weitere Beispielfragen
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.catalog
            .filter((entry) => !entry.suggested)
            .map((entry) => (
              <Button
                key={entry.id}
                variant="outline"
                className="h-auto max-w-full whitespace-normal text-left"
                disabled={pending}
                onClick={() => ask(entry.question, entry.id)}
              >
                {entry.question}
              </Button>
            ))}
          <Button
            variant="outline"
            className="h-auto max-w-full whitespace-normal text-left"
            disabled={pending}
            onClick={() => ask(data.fallback.question)}
          >
            {data.fallback.question}
          </Button>
        </div>
      </details>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          ask(question);
        }}
      >
        <label htmlFor="chat-question" className="sr-only">
          Deine Frage
        </label>
        <input
          ref={input}
          id="chat-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="min-w-0 flex-1 rounded-lg border bg-card px-3 py-2 text-body"
        />
        <Button disabled={pending || !question.trim()}>Frage stellen</Button>
      </form>
      <Dialog
        open={draftQuestion !== null}
        onOpenChange={(open) => {
          if (!open) setDraftQuestion(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Anfrage vorbereiten</DialogTitle>
            <DialogDescription>
              Du kannst den Text kopieren und selbst versenden. Hier wird nichts
              gesendet.
            </DialogDescription>
          </DialogHeader>
          <label htmlFor="request-draft" className="text-body font-semibold">
            Dein Anfrageentwurf
          </label>
          <textarea
            id="request-draft"
            readOnly
            value={draft}
            rows={10}
            className="w-full rounded-lg border bg-card p-3 text-body"
          />
          <Button
            onClick={() => {
              void navigator.clipboard?.writeText(draft).then(
                () => setCopyStatus("Text kopiert."),
                () =>
                  setCopyStatus("Bitte markiere und kopiere den Text im Feld."),
              );
              if (!navigator.clipboard)
                setCopyStatus("Bitte markiere und kopiere den Text im Feld.");
            }}
          >
            Text kopieren
          </Button>
          <p role="status">{copyStatus}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AssistantPage() {
  return (
    <ResourceBoundary
      services={["assistant", "rules"]}
      skeleton={
        <Skeleton
          role="status"
          aria-label="Assistent wird geladen"
          className="h-48"
        />
      }
    >
      {() => <Chat />}
    </ResourceBoundary>
  );
}
