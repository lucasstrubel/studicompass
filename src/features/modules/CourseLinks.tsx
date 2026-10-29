import { useId, useRef, useState, type FormEvent } from "react";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CourseLink } from "@/domain/types";
import { parseWebUrl } from "@/lib/url";
import { LINK_LABEL_MAX_LENGTH } from "@/store/demo-store";
import { useDemoStore } from "@/store/use-demo-store";

const FIELD =
  "h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-body placeholder:text-muted-foreground aria-invalid:border-status-critical";

/** Stable empty list: a fresh [] in a store selector would re-render without end. */
const NO_LINKS: CourseLink[] = [];

/** Shown host of an address, e.g. "example.org". */
function host(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/** Form for a link: with a label for own links, address only for the Moodle course. */
function LinkForm({
  initial,
  withLabel,
  submitLabel,
  onSave,
  onCancel,
}: {
  initial?: { label: string; url: string };
  withLabel: boolean;
  submitLabel: string;
  onSave: (label: string, url: string) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const [label, setLabel] = useState(initial?.label ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [errors, setErrors] = useState<{ label?: string; url?: string }>({});
  const labelRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: { label?: string; url?: string } = {};
    if (withLabel && !label.trim()) next.label = "Gib eine Bezeichnung ein.";
    else if (withLabel && label.trim().length > LINK_LABEL_MAX_LENGTH)
      next.label = `Höchstens ${LINK_LABEL_MAX_LENGTH} Zeichen.`;
    if (!parseWebUrl(url))
      next.url = "Gib eine vollständige Adresse mit https:// ein.";
    setErrors(next);
    if (next.label) labelRef.current?.focus();
    else if (next.url) urlRef.current?.focus();
    else onSave(label.trim(), url);
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-3">
      {withLabel && (
        <div className="space-y-1">
          <label htmlFor={`${id}-label`} className="text-meta font-semibold">
            Bezeichnung
          </label>
          <input
            ref={labelRef}
            id={`${id}-label`}
            value={label}
            maxLength={LINK_LABEL_MAX_LENGTH + 20}
            placeholder="Z. B. Website der Lehrenden"
            aria-invalid={errors.label ? true : undefined}
            aria-describedby={errors.label ? `${id}-label-error` : undefined}
            onChange={(event) => setLabel(event.target.value)}
            className={FIELD}
          />
          {errors.label && (
            <p
              id={`${id}-label-error`}
              className="text-meta text-status-critical-foreground"
            >
              {errors.label}
            </p>
          )}
        </div>
      )}
      <div className="space-y-1">
        <label htmlFor={`${id}-url`} className="text-meta font-semibold">
          Adresse
        </label>
        <input
          ref={urlRef}
          id={`${id}-url`}
          type="url"
          inputMode="url"
          value={url}
          placeholder="https://"
          aria-invalid={errors.url ? true : undefined}
          aria-describedby={errors.url ? `${id}-url-error` : undefined}
          onChange={(event) => setUrl(event.target.value)}
          className={FIELD}
        />
        {errors.url && (
          <p
            id={`${id}-url-error`}
            className="text-meta text-status-critical-foreground"
          >
            {errors.url}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm">
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}

function OwnLink({ moduleId, link }: { moduleId: string; link: CourseLink }) {
  const saveCourseLink = useDemoStore((state) => state.saveCourseLink);
  const removeCourseLink = useDemoStore((state) => state.removeCourseLink);
  const [editing, setEditing] = useState(false);
  if (editing)
    return (
      <li className="rounded-lg border p-3">
        <LinkForm
          withLabel
          initial={link}
          submitLabel="Speichern"
          onSave={(label, url) => {
            saveCourseLink(moduleId, { id: link.id, label, url });
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  return (
    <li className="flex items-start justify-between gap-2">
      <span className="min-w-0">
        {/* Own address: opens for real, in a new tab without access to this page. */}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-sm font-semibold break-all text-accent-strong underline-offset-2 hover:underline"
        >
          {link.label}
          <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="sr-only">(öffnet in neuem Tab)</span>
        </a>
        <span className="block text-meta break-all text-muted-foreground">
          {host(link.url)}
        </span>
      </span>
      <span className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${link.label} bearbeiten`}
          onClick={() => setEditing(true)}
        >
          <Pencil aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${link.label} entfernen`}
          onClick={() => removeCourseLink(moduleId, link.id)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </span>
    </li>
  );
}

/**
 * Links to the course (P5-12, US-24): the Moodle course comes automatically – in the prototype only as a
 * neutral hint, as with "Im Original öffnen" – and Niklas can set its real address or add own links,
 * e.g. the lecturer's website.
 */
export function CourseLinks({
  moduleId,
  title,
}: {
  moduleId: string;
  title: string;
}) {
  const links = useDemoStore(
    (state) => state.courseLinks[moduleId] ?? NO_LINKS,
  );
  const moodleUrl = useDemoStore((state) => state.moodleUrls[moduleId]);
  const saveCourseLink = useDemoStore((state) => state.saveCourseLink);
  const setMoodleUrl = useDemoStore((state) => state.setMoodleUrl);
  const [hint, setHint] = useState(false);
  const [editing, setEditing] = useState<"moodle" | "new" | null>(null);
  const id = useId();

  return (
    <section
      className="space-y-4 rounded-xl border bg-card p-4"
      aria-labelledby={id}
    >
      <h3 id={id} className="text-card-title">
        Links zum Kurs
      </h3>
      <div className="space-y-2">
        <p className="text-meta font-semibold text-muted-foreground">Moodle</p>
        {editing === "moodle" ? (
          <LinkForm
            withLabel={false}
            initial={{ label: "", url: moodleUrl ?? "" }}
            submitLabel="Adresse speichern"
            onSave={(_label, url) => {
              setMoodleUrl(moduleId, url);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {moodleUrl ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={moodleUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink aria-hidden="true" />
                    Moodle-Kurs öffnen
                    <span className="sr-only">(öffnet in neuem Tab)</span>
                  </a>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHint(true)}
                >
                  <ExternalLink aria-hidden="true" />
                  Moodle-Kurs öffnen
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setHint(false);
                  setEditing("moodle");
                }}
              >
                {moodleUrl ? "Adresse ändern" : "Eigene Adresse festlegen"}
              </Button>
              {moodleUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMoodleUrl(moduleId, null)}
                >
                  Automatisch verwenden
                </Button>
              )}
            </div>
            <p role="status" className="text-meta text-muted-foreground">
              {moodleUrl
                ? `Eigene Adresse: ${host(moodleUrl)}`
                : hint
                  ? `Im echten Betrieb öffnet sich der Moodle-Kurs „${title}“. Im Prototyp bleibst du hier.`
                  : ""}
            </p>
          </>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-meta font-semibold text-muted-foreground">
          Eigene Links
        </p>
        {links.length > 0 ? (
          <ul className="space-y-3">
            {links.map((link) => (
              <OwnLink key={link.id} moduleId={moduleId} link={link} />
            ))}
          </ul>
        ) : (
          editing !== "new" && (
            <p className="text-meta text-muted-foreground">
              Noch keine eigenen Links, etwa zur Website der Lehrenden.
            </p>
          )
        )}
        {editing === "new" ? (
          <div className="rounded-lg border p-3">
            <LinkForm
              withLabel
              submitLabel="Link hinzufügen"
              onSave={(label, url) => {
                saveCourseLink(moduleId, { label, url });
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" />
            Link hinzufügen
          </Button>
        )}
      </div>
    </section>
  );
}
