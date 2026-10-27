import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CitationList } from "@/components/common/CitationList";
import { useDemoStore } from "@/store/use-demo-store";
import { selectAssistantPersonal } from "@/store/assistant-selectors";
import type { AssistantEntry, Office } from "@/domain/types";
import { selectAcademicState } from "@/store/selectors";
import { semesterNumber } from "@/domain/terms";
import { cn } from "@/lib/utils";

const ANSWER_LABEL =
  "KI-Antwort · verbindlich ist die SPO · Antworten im Prototyp vorbereitet";

type Heading = "h2" | "h3";
const SUBHEADING: Record<Heading, "h3" | "h4"> = { h2: "h3", h3: "h4" };

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
  heading,
}: {
  entry: AssistantEntry;
  ask: (question: string, id?: string) => void;
  pending: boolean;
  heading: Heading;
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
  const Subheading = SUBHEADING[heading];
  return (
    <article className="min-w-0 space-y-4 rounded-xl border bg-card p-4 text-body">
      <p className="text-meta text-muted-foreground">{ANSWER_LABEL}</p>
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
        <Subheading className="font-semibold">Zuständig</Subheading>
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

/**
 * Assistant conversation (KONZEPT §8 S5, §11). The page shows it full width; the assistant window (P5-06)
 * shows the same conversation compactly with the input pinned at the bottom. Both read and extend the
 * conversation in the store, so a question asked in the window continues on the page.
 */
export function AssistantChat({
  variant = "page",
  initialQuestion = "",
  moduleId,
}: {
  variant?: "page" | "panel";
  /** Catalog id or free text from the URL; asked once when the chat opens. */
  initialQuestion?: string;
  /** Context chip "bezogen auf: …" when the assistant is opened from a module. */
  moduleId?: string | null;
}) {
  const panel = variant === "panel";
  const heading: Heading = panel ? "h3" : "h2";
  const QuestionHeading = heading;
  const data = useDemoStore((state) => state.resources.assistant.data);
  const pos = useDemoStore((state) => state.resources.pos.data);
  const academic = useDemoStore(selectAcademicState);
  const offices = useDemoStore((state) => state.resources.rules.data?.offices);
  const messages = useDemoStore((state) => state.assistantThread);
  // The answer is prepared in the store, so it arrives even if the window closes in between.
  const pending = useDemoStore((state) => state.assistantPending !== null);
  const askAssistant = useDemoStore((state) => state.askAssistant);
  const [question, setQuestion] = useState("");
  const [draftQuestion, setDraftQuestion] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const latest = useRef<HTMLElement>(null);
  const initial = useRef("");
  const answered = useRef(messages.length);
  const inputId = useId();
  const module = pos?.modules.find((item) => item.id === moduleId);
  function ask(text: string, id?: string) {
    if (!text.trim() || pending) return;
    setQuestion("");
    askAssistant(text, id);
  }
  useEffect(() => {
    if (!initialQuestion || initial.current === initialQuestion || !data)
      return;
    initial.current = initialQuestion;
    const entry = data.catalog.find((item) => item.id === initialQuestion);
    askAssistant(entry?.question ?? initialQuestion, entry?.id);
    // The URL is an entry action; later store changes must not resubmit it.
  }, [initialQuestion, data, askAssistant]);
  // A new answer returns the focus to the input; in the window it is also scrolled into view.
  useEffect(() => {
    if (messages.length <= answered.current) return;
    answered.current = messages.length;
    input.current?.focus();
    if (panel) latest.current?.scrollIntoView?.({ block: "start" });
  }, [panel, messages.length]);
  if (!data) return null;
  const draft =
    draftQuestion === data.fallback.question
      ? data.fallback.draft
      : `Betreff: Frage zur Prüfungsordnung\n\nGuten Tag, ich studiere ${pos?.program.title ?? "Wirtschaftsinformatik"}${academic ? ` im ${semesterNumber(academic.currentTerm, academic.student.startTerm)}. Fachsemester` : ""}. Meine Matrikelnummer ist ${pos?.student.matriculationNo ?? "nicht verfügbar"}.\n\n${draftQuestion ?? ""}\n\nViele Grüße\n${pos?.student.firstName ?? ""} ${pos?.student.lastName ?? ""}`;
  const form = (
    <form
      className={cn("flex gap-2", panel ? "border-t bg-card p-3" : "flex-wrap")}
      onSubmit={(event) => {
        event.preventDefault();
        ask(question);
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        Deine Frage
      </label>
      <input
        ref={input}
        id={inputId}
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder={panel ? "Deine Frage …" : undefined}
        className="min-w-0 flex-1 rounded-lg border border-input bg-card px-3 py-2 text-body placeholder:text-muted-foreground"
      />
      {panel ? (
        <Button
          size="icon"
          aria-label="Frage stellen"
          disabled={pending || !question.trim()}
        >
          <Send aria-hidden="true" />
        </Button>
      ) : (
        <Button disabled={pending || !question.trim()}>Frage stellen</Button>
      )}
    </form>
  );
  return (
    <div
      className={panel ? "flex min-h-0 flex-1 flex-col" : "min-w-0 max-w-3xl"}
    >
      <div
        className={
          panel ? "min-h-0 flex-1 space-y-4 overflow-y-auto p-4" : "space-y-5"
        }
      >
        {!panel && (
          <p className="text-body">
            Fragen zu deinem Studium? Antworten stützen sich auf SPO und
            Modulhandbuch. Verbindlich ist das Prüfungsamt.
          </p>
        )}
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
              <section
                key={index}
                ref={index === messages.length - 1 ? latest : undefined}
                className="space-y-3"
              >
                <QuestionHeading className="text-card-title break-words">
                  {message.question}
                </QuestionHeading>
                {entry ? (
                  <Answer
                    entry={entry}
                    ask={ask}
                    pending={pending}
                    heading={heading}
                  />
                ) : (
                  <FallbackAnswer
                    heading={heading}
                    answer={data.fallback.answer}
                    offices={
                      offices?.filter((office) =>
                        data.fallback.officeIds.includes(office.id),
                      ) ?? []
                    }
                    onPrepare={() => {
                      setDraftQuestion(message.question);
                      setCopyStatus("");
                    }}
                  />
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
        {!panel && form}
      </div>
      {panel && form}
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

function FallbackAnswer({
  heading,
  answer,
  offices,
  onPrepare,
}: {
  heading: Heading;
  answer: string;
  offices: Office[];
  onPrepare: () => void;
}) {
  const Subheading = SUBHEADING[heading];
  return (
    <article className="space-y-3 rounded-xl border bg-card p-4 text-body">
      <p className="text-meta text-muted-foreground">{ANSWER_LABEL}</p>
      <p>{answer}</p>
      <p>
        Quellenlage: In SPO und Modulhandbuch ist dazu keine eindeutige Regel
        hinterlegt.
      </p>
      <Subheading className="font-semibold">Zuständig</Subheading>
      {offices.map((office) => (
        <p key={office.id} className="break-words">
          {office.name} · {office.email}
          {office.hours && ` · ${office.hours}`}
        </p>
      ))}
      <Button variant="outline" onClick={onPrepare}>
        Anfrage vorbereiten
      </Button>
    </article>
  );
}
