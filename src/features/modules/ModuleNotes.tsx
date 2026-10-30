import { useId, useState } from "react";
import { NOTE_MAX_LENGTH } from "@/store/demo-store";
import { useDemoStore } from "@/store/use-demo-store";

/** Own notes per module (P5-12, US-23): stored only in this browser, cleared by "Demo zurücksetzen". */
export function ModuleNotes({ moduleId }: { moduleId: string }) {
  const stored = useDemoStore((state) => state.moduleNotes[moduleId] ?? "");
  const setModuleNote = useDemoStore((state) => state.setModuleNote);
  const [text, setText] = useState(stored);
  const [saved, setSaved] = useState(false);
  const id = useId();

  return (
    <section className="rounded-xl border bg-card p-4" aria-labelledby={id}>
      <h3 id={id} className="text-card-title">
        Notizen
      </h3>
      <p className="mt-1 text-meta text-muted-foreground">
        Nur für dich, gespeichert in diesem Browser.
      </p>
      <label htmlFor={`${id}-text`} className="sr-only">
        Notizen zum Modul
      </label>
      <textarea
        id={`${id}-text`}
        value={text}
        maxLength={NOTE_MAX_LENGTH}
        rows={6}
        placeholder="Z. B. Fragen für die Übung, Stoff für die Klausur …"
        onChange={(event) => {
          // Persist each edit before a hard reload or tab close can discard component state.
          setText(event.target.value);
          setModuleNote(moduleId, event.target.value);
          setSaved(true);
        }}
        className="mt-3 w-full rounded-lg border border-input bg-card p-3 text-body placeholder:text-muted-foreground"
      />
      <p className="mt-1 flex justify-between gap-3 text-meta text-muted-foreground">
        <span role="status">{saved ? "Gespeichert" : ""}</span>
        <span className="tabular-nums">
          {text.length}/{NOTE_MAX_LENGTH}
        </span>
      </p>
    </section>
  );
}
