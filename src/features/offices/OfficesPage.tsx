import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router";
import { CitationList } from "@/components/common/CitationList";
import { EmptyState } from "@/components/common/EmptyState";
import { ResourceBoundary } from "@/components/common/ResourceBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoStore } from "@/store/use-demo-store";

/** S10: responsibilities, contacts and matching catalog questions from the connected services. */
export function OfficesPage() {
  const offices = useDemoStore((state) => state.resources.rules.data?.offices);
  const catalog = useDemoStore(
    (state) => state.resources.assistant.data?.catalog,
  );
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash || !offices?.some((office) => `#${office.id}` === hash)) return;
    const target = document.getElementById(hash.slice(1));
    target?.scrollIntoView?.({ block: "start" });
    target?.focus();
  }, [hash, offices]);
  return (
    <div className="space-y-5">
      {/* The page has no navigation entry of its own; visitors come from the assistant. */}
      <Link
        to="/assistent"
        className="inline-flex items-center gap-1 rounded-sm text-meta font-semibold text-accent-strong"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Zum Assistenten
      </Link>
      <p className="max-w-3xl text-body text-muted-foreground">
        Hier findest du die passende Stelle für dein Anliegen. Zuständigkeiten
        und Kontaktdaten sind Beispiele; im echten Betrieb gelten die Angaben
        der Hochschule.
      </p>
      <ResourceBoundary
        services={["rules"]}
        skeleton={
          <Skeleton
            role="status"
            aria-label="Anlaufstellen werden geladen"
            className="h-56"
          />
        }
      >
        {() =>
          !offices?.length ? (
            <EmptyState title="Keine Anlaufstellen vorhanden" />
          ) : (
            <div className="grid items-start gap-4 lg:grid-cols-2">
              {offices.map((office) => (
                <section
                  key={office.id}
                  id={office.id}
                  tabIndex={-1}
                  aria-labelledby={`${office.id}-title`}
                  className="min-w-0 scroll-mt-24 space-y-4 rounded-xl border bg-card p-5"
                >
                  <h2 id={`${office.id}-title`} className="text-section-title">
                    {office.name}
                  </h2>
                  <div className="space-y-1">
                    <h3 className="text-card-title">Zuständig für</h3>
                    {office.topics?.length ? (
                      <ul className="list-disc pl-5 text-body">
                        {office.topics.map((topic) => (
                          <li key={topic}>{topic}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-body">
                        Die Stelle klärt mit dir, wer dein Anliegen bearbeitet.
                      </p>
                    )}
                  </div>
                  <dl className="space-y-1 text-body">
                    <div>
                      <dt className="font-semibold">Kontakt</dt>
                      <dd className="break-words">
                        <a
                          className="text-accent-strong underline underline-offset-2"
                          href={`mailto:${office.email}`}
                        >
                          {office.email}
                        </a>
                      </dd>
                    </div>
                    {office.hours && (
                      <div>
                        <dt className="font-semibold">Sprechzeiten</dt>
                        <dd>{office.hours}</dd>
                      </div>
                    )}
                  </dl>
                  <div>
                    <h3 className="text-card-title">Passende Fragen</h3>
                    <ResourceBoundary
                      services={["assistant"]}
                      skeleton={
                        <Skeleton
                          role="status"
                          aria-label="Passende Fragen werden geladen"
                          className="h-12"
                        />
                      }
                    >
                      {() => (
                        <ul className="divide-y">
                          {catalog
                            ?.filter((entry) =>
                              entry.officeIds.includes(office.id),
                            )
                            .map((entry) => (
                              <li key={entry.id}>
                                <Link
                                  to={`/assistent?frage=${encodeURIComponent(entry.id)}`}
                                  className="flex min-h-9 items-center justify-between gap-3 rounded-sm py-2 text-body transition-colors hover:text-accent-strong"
                                >
                                  {entry.question}
                                  <ArrowRight
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden="true"
                                  />
                                </Link>
                              </li>
                            ))}
                          {!catalog?.some((entry) =>
                            entry.officeIds.includes(office.id),
                          ) && (
                            <li className="py-2 text-body text-muted-foreground">
                              Für diese Stelle sind keine Beispielfragen
                              hinterlegt.
                            </li>
                          )}
                        </ul>
                      )}
                    </ResourceBoundary>
                  </div>
                  <CitationList
                    variant="footer"
                    className="mt-0"
                    citations={[
                      {
                        document:
                          "Website der Hochschule, Seite „Ansprechpartner“",
                        summary:
                          "Zuständigkeit, Kontakt und Sprechzeiten (Beispiel).",
                        verified: false,
                      },
                    ]}
                  />
                </section>
              ))}
            </div>
          )
        }
      </ResourceBoundary>
    </div>
  );
}
