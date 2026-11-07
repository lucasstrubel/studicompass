import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode, Ref } from "react";
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  useExternalStoreRuntime,
  type ThreadMessageLike,
} from "@assistant-ui/react";
import { Link } from "react-router";
import { ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CitationList } from "@/components/common/CitationList";
import { DEMO_NOW } from "@/config/demo";
import { useDemoStore } from "@/store/use-demo-store";
import { selectAssistantPersonal } from "@/store/assistant-selectors";
import type { AssistantEntry, Office } from "@/domain/types";
import { selectAcademicState, selectProfileName } from "@/store/selectors";
import { semesterNumber } from "@/domain/terms";
import { cn } from "@/lib/utils";
import { AssistantAvatar } from "./AssistantAvatar";

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

/** Who is responsible, kept compact: the question has been answered above it. */
function Responsible({
  heading,
  offices,
}: {
  heading: Heading;
  offices: Office[];
}) {
  const Subheading = SUBHEADING[heading];
  return (
    <div>
      <Subheading className="text-meta font-semibold text-muted-foreground">
        Zuständig
      </Subheading>
      {offices.map((office) => (
        <p key={office.id} className="break-words">
          <Link
            to={`/anlaufstellen#${office.id}`}
            className="rounded-sm text-accent-strong underline underline-offset-2"
          >
            {office.name}
          </Link>{" "}
          {/* Wraps as a unit, so a narrow window does not break the address in the middle. */}
          <span className="inline-block text-meta text-muted-foreground">
            {office.email}
            {office.hours && ` · ${office.hours}`}
          </span>
        </p>
      ))}
    </div>
  );
}

const QUESTION_CHIP =
  "h-auto max-w-full rounded-full py-1 text-left text-meta whitespace-normal";

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
  // The progress summary is personal already; the highlighted line would only repeat it.
  const summary = entry.resolver === "progressSummary";
  return (
    <article className="min-w-0 space-y-3 text-body">
      <p className="text-meta font-medium text-muted-foreground">KI-Antwort</p>
      <p>
        <AnswerText text={summary ? personal : entry.shortAnswer} />
      </p>
      {!summary && (
        <p className="rounded-xl bg-accent-soft px-3.5 py-3">
          <strong>Für dich heißt das: </strong>
          {personal}
        </p>
      )}
      {entry.details && (
        <details>
          <summary className="w-fit cursor-pointer rounded-sm font-medium">
            Details
          </summary>
          <p className="mt-1">{entry.details}</p>
        </details>
      )}
      <Responsible heading={heading} offices={offices} />
      {entry.actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entry.actions.map((action) => (
            <Button key={action.href} variant="outline" size="sm" asChild>
              <Link to={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {entry.followUpIds
          .map((id) => catalog.find((item) => item.id === id))
          .map(
            (item) =>
              item && (
                <Button
                  key={item.id}
                  variant="outline"
                  size="sm"
                  className={QUESTION_CHIP}
                  disabled={pending}
                  onClick={() => ask(item.question, item.id)}
                >
                  {item.question}
                </Button>
              ),
          )}
      </div>
      <CitationList
        variant="footer"
        className="mt-0"
        citations={[
          ...sources.map((rule) => rule.citation),
          ...(entry.citations ?? []),
        ]}
      />
    </article>
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
  return (
    <article className="min-w-0 space-y-3 text-body">
      <p className="text-meta font-medium text-muted-foreground">KI-Antwort</p>
      <p>{answer}</p>
      <p>
        Quellenlage: In StuPO und Modulhandbuch ist dazu keine eindeutige Regel
        hinterlegt.
      </p>
      <Responsible heading={heading} offices={offices} />
      <Button variant="outline" size="sm" onClick={onPrepare}>
        Anfrage vorbereiten
      </Button>
    </article>
  );
}

/** One exchange: the student's question on the right, the needle with its answer on the left. */
function Exchange({
  question,
  heading,
  thinking = false,
  sectionRef,
  children,
}: {
  question: string;
  heading: Heading;
  thinking?: boolean;
  sectionRef?: Ref<HTMLElement>;
  children?: ReactNode;
}) {
  const QuestionHeading = heading;
  return (
    <section ref={sectionRef} className="scroll-mt-4 space-y-3">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-foreground px-4 py-2.5 text-background motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-200">
          <QuestionHeading className="text-body font-medium break-words">
            {question}
          </QuestionHeading>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <AssistantAvatar thinking={thinking} />
        <div className="min-w-0 flex-1 pt-1">
          {thinking ? (
            // The status line below the log announces this; here it is only what sighted people see.
            <p aria-hidden="true" className="text-body text-muted-foreground">
              Antwort wird vorbereitet …
            </p>
          ) : (
            <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export interface AssistantChatProps {
  variant?: "page" | "panel";
  /** Catalog id or free text from the URL; asked once when the chat opens. */
  initialQuestion?: string;
  /** Context chip "bezogen auf: …" when the assistant is opened from a module. */
  moduleId?: string | null;
}

/**
 * Assistant conversation. The page shows it full width; the assistant window (P5-06) shows the same conversation
 * compactly with the input pinned at the bottom. Both read and extend the conversation in the store, so a
 * question asked in the window continues on the page. assistant-ui provides the runtime and the input's keyboard
 * handling; the store stays the source of truth and the messages keep their own markup.
 */
export function AssistantChat({
  variant = "page",
  initialQuestion = "",
  moduleId,
}: AssistantChatProps) {
  const panel = variant === "panel";
  const heading: Heading = panel ? "h3" : "h2";
  const data = useDemoStore((state) => state.resources.assistant.data);
  const pos = useDemoStore((state) => state.resources.pos.data);
  const academic = useDemoStore(selectAcademicState);
  const profileName = useDemoStore(selectProfileName);
  const offices = useDemoStore((state) => state.resources.rules.data?.offices);
  const messages = useDemoStore((state) => state.assistantThread);
  // The answer is prepared in the store, so it arrives even if the window closes in between.
  const pendingQuestion = useDemoStore(
    (state) => state.assistantPending?.question ?? null,
  );
  const pending = pendingQuestion !== null;
  const askAssistant = useDemoStore((state) => state.askAssistant);
  const [draftQuestion, setDraftQuestion] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const latest = useRef<HTMLElement>(null);
  const initial = useRef("");
  const answered = useRef(messages.length);
  const asked = useRef(messages.length + (pending ? 1 : 0));
  const inputId = useId();
  const module = pos?.modules.find((item) => item.id === moduleId);
  function ask(text: string, id?: string) {
    if (!text.trim() || pending) return;
    askAssistant(text, id);
  }
  // One record in the store is one exchange; index ids, because catalog ids repeat when a question comes again.
  const threadMessages = useMemo<ThreadMessageLike[]>(
    () =>
      messages.flatMap((message, index) => [
        {
          id: `q${index}`,
          role: "user" as const,
          content: message.question,
          createdAt: DEMO_NOW,
        },
        {
          id: `a${index}`,
          role: "assistant" as const,
          content: message.id ?? "fallback",
          createdAt: DEMO_NOW,
        },
      ]),
    [messages],
  );
  const runtime = useExternalStoreRuntime<ThreadMessageLike>({
    messages: threadMessages,
    convertMessage: (message) => message,
    // isRunning would add an empty message of its own; the waiting state comes from the store.
    isRunning: false,
    isSendDisabled: pending,
    onNew: (message) => {
      const part = message.content[0];
      if (part?.type === "text") ask(part.text);
      return Promise.resolve();
    },
  });
  useEffect(() => {
    if (!initialQuestion || initial.current === initialQuestion || !data)
      return;
    initial.current = initialQuestion;
    const entry = data.catalog.find((item) => item.id === initialQuestion);
    askAssistant(entry?.question ?? initialQuestion, entry?.id);
    // The URL is an entry action; later store changes must not resubmit it.
  }, [initialQuestion, data, askAssistant]);
  // In the window the input takes the focus, also when the chat arrives after the window opened.
  useEffect(() => {
    if (panel) input.current?.focus();
  }, [panel]);
  // A new exchange scrolls into view as soon as it is asked.
  const exchanges = messages.length + (pending ? 1 : 0);
  useEffect(() => {
    if (exchanges <= asked.current) return;
    asked.current = exchanges;
    latest.current?.scrollIntoView?.({ block: panel ? "start" : "nearest" });
  }, [panel, exchanges]);
  // A new answer returns the focus to the input.
  useEffect(() => {
    if (messages.length <= answered.current) return;
    answered.current = messages.length;
    input.current?.focus();
  }, [messages.length]);
  if (!data) return null;
  const signature = profileName
    ? `${profileName.firstName} ${profileName.lastName}`
    : "";
  const fallbackDraft = data.fallback.draft.replace(
    /\n\nViele Grüße\n[\s\S]*$/,
    () => `\n\nViele Grüße\n${signature}`,
  );
  const draft =
    draftQuestion === data.fallback.question
      ? fallbackDraft
      : `Betreff: Frage zur Prüfungsordnung\n\nGuten Tag, ich studiere ${pos?.program.title ?? "Unternehmens- und Wirtschaftsinformatik"}${academic ? ` im ${semesterNumber(academic.currentTerm, academic.student.startTerm)}. Fachsemester` : ""}. Meine Matrikelnummer ist ${pos?.student.matriculationNo ?? "nicht verfügbar"}.\n\n${draftQuestion ?? ""}\n\nViele Grüße\n${signature}`;
  const composer = (
    <div
      className={
        panel
          ? "border-t bg-card p-3"
          : "sticky bottom-0 bg-background pt-3 pb-4"
      }
    >
      <ComposerPrimitive.Root className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Deine Frage
        </label>
        <ComposerPrimitive.Input asChild>
          <input
            ref={input}
            id={inputId}
            placeholder="Deine Frage …"
            className="min-w-0 flex-1 rounded-lg border border-input bg-card px-3 py-2 text-body placeholder:text-muted-foreground"
          />
        </ComposerPrimitive.Input>
        <ComposerPrimitive.Send asChild>
          {panel ? (
            <Button size="icon" aria-label="Frage stellen">
              <Send aria-hidden="true" />
            </Button>
          ) : (
            <Button className="h-auto">Frage stellen</Button>
          )}
        </ComposerPrimitive.Send>
      </ComposerPrimitive.Root>
      <p className="mt-2 text-meta text-muted-foreground">
        Antworten stützen sich auf StuPO und Modulhandbuch. Verbindlich ist das
        Zentrale Prüfungsverwaltung; im Prototyp sind die Antworten vorbereitet.
      </p>
    </div>
  );
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div
        className={panel ? "flex min-h-0 flex-1 flex-col" : "min-w-0 max-w-3xl"}
      >
        <div
          className={
            panel ? "min-h-0 flex-1 space-y-5 overflow-y-auto p-4" : "space-y-5"
          }
        >
          {module && (
            <p className="inline-block rounded-full bg-muted px-3 py-1 text-meta">
              bezogen auf: {module.title}
            </p>
          )}
          {exchanges === 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AssistantAvatar />
                <p className="text-body">
                  Frag mich zu Prüfungsordnung, Fristen und Folgen. Ich antworte
                  mit Quelle.
                </p>
              </div>
              <div className="divide-y overflow-hidden rounded-xl border bg-card">
                {data.catalog
                  .filter((entry) => entry.suggested)
                  .map((entry) => (
                    <Button
                      key={entry.id}
                      variant="ghost"
                      className="h-auto min-h-10 w-full justify-between rounded-none px-4 py-2 text-left font-normal whitespace-normal focus-visible:-outline-offset-2"
                      disabled={pending}
                      onClick={() => ask(entry.question, entry.id)}
                    >
                      {entry.question}
                      <ArrowRight
                        className="text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Button>
                  ))}
                <Link
                  to="/anlaufstellen"
                  className="flex min-h-10 items-center justify-between gap-2 px-4 py-2 text-body font-medium transition-colors hover:bg-muted focus-visible:-outline-offset-2"
                >
                  Alle Anlaufstellen: Wer ist wofür zuständig?
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          )}
          <div
            className="space-y-6"
            aria-label="Chatverlauf"
            role="log"
            aria-live="polite"
            aria-busy={pending}
          >
            {messages.map((message, index) => {
              const entry = data.catalog.find((item) => item.id === message.id);
              return (
                <Exchange
                  key={index}
                  question={message.question}
                  heading={heading}
                  sectionRef={
                    !pending && index === messages.length - 1
                      ? latest
                      : undefined
                  }
                >
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
                </Exchange>
              );
            })}
            {pendingQuestion !== null && (
              <Exchange
                key={messages.length}
                question={pendingQuestion}
                heading={heading}
                thinking
                sectionRef={latest}
              />
            )}
          </div>
          <p role="status" className="sr-only">
            {pending ? "Antwort wird vorbereitet …" : ""}
          </p>
          <details>
            <summary className="w-fit cursor-pointer rounded-sm text-body font-medium">
              Weitere Beispielfragen
            </summary>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.catalog
                .filter((entry) => !entry.suggested)
                .map((entry) => (
                  <Button
                    key={entry.id}
                    variant="outline"
                    size="sm"
                    className={cn(QUESTION_CHIP)}
                    disabled={pending}
                    onClick={() => ask(entry.question, entry.id)}
                  >
                    {entry.question}
                  </Button>
                ))}
              <Button
                variant="outline"
                size="sm"
                className={cn(QUESTION_CHIP)}
                disabled={pending}
                onClick={() => ask(data.fallback.question)}
              >
                {data.fallback.question}
              </Button>
              {exchanges > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(QUESTION_CHIP)}
                  asChild
                >
                  <Link to="/anlaufstellen">Alle Anlaufstellen</Link>
                </Button>
              )}
            </div>
          </details>
          {!panel && composer}
        </div>
        {panel && composer}
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
                Du kannst den Text kopieren und selbst versenden. Hier wird
                nichts gesendet.
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
                    setCopyStatus(
                      "Bitte markiere und kopiere den Text im Feld.",
                    ),
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
    </AssistantRuntimeProvider>
  );
}
