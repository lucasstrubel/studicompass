import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Check,
  Flag,
  MessageCircleQuestionMark,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  dashboardPreview,
  type DashboardPreviewData,
  type PreviewModule,
} from "./dashboard-preview";
import { ModuleIllustration } from "./ModuleIllustration";

function Source({ children }: { children: string }) {
  return (
    <p className="mt-3 text-meta text-muted-foreground">
      Beispiel · Quelle: {children}
    </p>
  );
}

function NextDeadline({
  deadline,
}: {
  deadline: DashboardPreviewData["deadline"];
}) {
  return (
    <section aria-label="Nächste Frist">
      <h2 className="mb-3 flex items-center gap-2 text-card-title">
        <CalendarClock className="size-4" />
        Nächste Frist
      </h2>
      <Card size="sm">
        <CardContent>
          <p className="mb-2 text-meta text-accent-strong">{deadline.day}</p>
          <h3 className="text-card-title">{deadline.title}</h3>
          <p className="mt-2 text-body tabular-nums">{deadline.remaining}</p>
          <p className="mt-1 text-meta text-muted-foreground">
            {deadline.date}
          </p>
          <Source>{deadline.source}</Source>
          <Link
            to="/fristen"
            className="mt-4 inline-flex items-center gap-2 text-meta font-semibold"
          >
            Alle Fristen <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}

function ModuleCard({ module }: { module: PreviewModule }) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start gap-3">
        <div className="hidden sm:block">
          <ModuleIllustration kind={module.art} />
        </div>
        <div className="min-w-0 flex-1">
          <Link
            to={`/module/${module.id}`}
            className="block rounded-sm text-card-title hover:underline"
          >
            {module.name}
          </Link>
          <p className="mt-1 text-meta text-muted-foreground">
            {module.description}
          </p>
          <p className="mt-4 text-meta tabular-nums">{module.exam}</p>
          <p className="mt-1 text-meta text-muted-foreground">
            Raum {module.room} · 6 ECTS
          </p>
          <p className="mt-2 flex items-center gap-1 text-meta">
            <Check className="size-3.5" />
            Angemeldet
          </p>
          <div
            role="progressbar"
            aria-label={`${module.name}: Moodle-Fortschritt`}
            aria-valuenow={module.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-3 h-1 rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-accent-strong"
              style={{ width: `${module.percent}%` }}
            />
          </div>
          <p className="mt-2 text-meta text-muted-foreground">
            {module.progress}
          </p>
          {module.winterOnly && (
            <p className="mt-2 text-meta text-muted-foreground">
              Nur im WS · Beispiel
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Presentation only: every value is passed in, without calculations or service access. */
export function DashboardPreview({ data }: { data: DashboardPreviewData }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-section-title">Guten Abend, {data.name}.</p>
          <p className="mt-1 text-body text-muted-foreground">
            Dein Studium auf einen Blick.
          </p>
        </div>
        <span className="rounded-full border px-3 py-1 text-meta text-muted-foreground">
          {data.semesterNumber}. Semester · {data.semester}
        </span>
      </div>
      <p className="text-meta text-muted-foreground">
        Designvorschau · Fiktive Beispieldaten.
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        <section aria-labelledby="study-progress" className="[&>div]:h-full">
          <Card size="sm">
            <CardContent>
              <div className="flex items-center justify-between gap-3">
                <h2 id="study-progress" className="text-card-title">
                  Dein Studienstand
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-status-tight-soft px-2.5 py-1 text-meta text-status-tight-foreground">
                  <TriangleAlert className="size-3.5" />
                  Knapp
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-baseline gap-2">
                <span className="text-figure tabular-nums">{data.earned}</span>
                <span className="text-body text-muted-foreground">
                  ECTS von {data.total}
                </span>
              </div>
              <div
                className="relative mt-4 h-2 rounded-full bg-muted"
                role="progressbar"
                aria-label="Bestandene ECTS"
                aria-valuenow={data.earned}
                aria-valuemin={0}
                aria-valuemax={data.total}
              >
                <div
                  className="h-full rounded-full bg-accent-strong"
                  style={{ width: `${data.earnedPercent}%` }}
                />
                <span
                  aria-hidden="true"
                  className="absolute -top-1 h-4 w-0.5 bg-foreground"
                  style={{ left: `${data.targetPercent}%` }}
                />
              </div>
              <p className="mt-3 text-meta text-muted-foreground">
                {data.behindTarget} ECTS hinter dem Regelverlauf · Soll nach 2
                Semestern: {data.target}
              </p>
              <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t pt-4">
                <div>
                  <p className="text-meta font-semibold">
                    Ende dieses Semesters
                  </p>
                  <p className="mt-1 text-body">{data.forecast}</p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/verlauf">
                    Studienverlauf ansehen
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
              <Source>
                SPO Wirtschaftsinformatik; Studienverlaufsplan
                Wirtschaftsinformatik
              </Source>
            </CardContent>
          </Card>
        </section>
        <section
          aria-labelledby="important"
          className="rounded-xl border border-accent-strong bg-accent p-5 text-accent-foreground [--ring:var(--accent-foreground)] dark:border-border dark:bg-accent-soft dark:text-accent-soft-foreground dark:[--ring:var(--accent-strong)]"
        >
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4" />
            <h2 id="important" className="text-card-title">
              Jetzt wichtig
            </h2>
          </div>
          <h3 className="mt-3 text-section-title">
            Statistik: Deine Entscheidung zählt.
          </h3>
          <p className="mt-2 text-body font-medium">
            Abmeldung nur noch bis morgen, 23:59 Uhr. Statistik wird nur im
            Wintersemester angeboten. Eine Abmeldung kann dein Praxissemester
            verschieben.
          </p>
          <p className="mt-3 text-meta">
            Beispiel · Quellen: SPO Wirtschaftsinformatik; Modulhandbuch
            Wirtschaftsinformatik, Modul Statistik
          </p>
          <Button asChild className="mt-4">
            <Link to="/entscheidung/e-stat-ws26">
              Folgen prüfen
              <ArrowRight />
            </Link>
          </Button>
        </section>
      </div>
      <div className="xl:hidden">
        <NextDeadline deadline={data.deadline} />
      </div>
      <section aria-labelledby="semester-modules">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 id="semester-modules" className="text-section-title">
            Dieses Semester
          </h2>
          <Link
            to="/module"
            className="inline-flex items-center gap-2 text-meta text-muted-foreground"
          >
            Alle Module
            <BookOpen className="size-4" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {data.modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
        <p className="mt-3 text-meta text-muted-foreground">
          Beispieldaten · Kanäle: POS und Moodle · Quelle zum Angebot:
          Modulhandbuch Wirtschaftsinformatik
        </p>
      </section>
      <section aria-labelledby="milestone" className="rounded-xl border p-5">
        <p className="flex items-center gap-2 text-meta text-muted-foreground">
          <Flag className="size-4" />
          Dein nächster Meilenstein
        </p>
        <h2 id="milestone" className="mt-2 text-section-title">
          {data.milestone.title}
        </h2>
        <p className="mt-2 text-body">{data.milestone.description}</p>
        <p className="mt-2 text-meta text-muted-foreground">
          {data.milestone.requirement}
        </p>
        <Source>{data.milestone.source}</Source>
        <Link
          to="/verlauf"
          className="mt-4 inline-flex items-center gap-2 text-meta font-semibold"
        >
          Meilenstein im Studienverlauf
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}

export function DashboardPreviewRail({ data }: { data: DashboardPreviewData }) {
  return (
    <div className="space-y-7">
      <div className="hidden xl:block">
        <NextDeadline deadline={data.deadline} />
      </div>
      <section aria-labelledby="inbox-title">
        <h2 id="inbox-title" className="mb-3 text-card-title">
          Neu im Postfach
        </h2>
        <ul className="space-y-2">
          {data.inbox.map((item) => (
            <li key={item.id}>
              <Link
                to={`/postfach?eintrag=${item.id}`}
                className="block rounded-xl border bg-card p-3 hover:bg-muted"
              >
                <span className="text-meta text-muted-foreground">
                  {item.channel}
                </span>
                <p className="mt-1 text-body font-semibold">{item.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="grades-title">
        <h2 id="grades-title" className="mb-3 text-card-title">
          Letzte bestandene Prüfungen
        </h2>
        <ul className="space-y-2">
          {data.grades.map((item) => (
            <li
              key={item.name}
              className="flex items-center gap-3 rounded-xl border bg-card p-3"
            >
              <BookOpen className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-meta">{item.name}</span>
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-card-title tabular-nums"
                aria-label={`Note ${item.grade}`}
              >
                {item.grade}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-meta text-muted-foreground">
          Beispieldaten · Kanal: POS
        </p>
      </section>
      <section aria-labelledby="assistant-title" className="border-t pt-5">
        <h2
          id="assistant-title"
          className="flex items-center gap-2 text-card-title"
        >
          <MessageCircleQuestionMark className="size-4" />
          Frag den Assistenten
        </h2>
        <p className="mt-2 text-meta text-muted-foreground">
          Fragen zu deinem Studium? Hier geht’s weiter.
        </p>
        <div className="mt-3 space-y-2">
          {[
            "Bis wann kann ich mich von einer Prüfung abmelden?",
            "Was brauche ich fürs Praxissemester?",
          ].map((question) => (
            <Link
              key={question}
              to={`/assistent?frage=${encodeURIComponent(question)}`}
              className="block rounded-lg border bg-card p-3 text-meta hover:bg-muted"
            >
              {question}
              <ArrowRight className="mt-2 size-4" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function DashboardPreviewPage() {
  return <DashboardPreview data={dashboardPreview} />;
}
export function DashboardPreviewRightRail() {
  return <DashboardPreviewRail data={dashboardPreview} />;
}
