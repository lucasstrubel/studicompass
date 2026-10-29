import { useEffect, useId, useRef, useState } from "react";
import { NOTE_MAX_LENGTH } from "@/store/demo-store";
import { useDemoStore } from "@/store/use-demo-store";

/** Saves after a short pause while typing, and right away when the field loses focus. */
const SAVE_DELAY_MS = 600;

/** Own notes per module (P5-12, US-23): stored only in this browser, cleared by "Demo zurücksetzen". */
export function ModuleNotes({ moduleId }: { moduleId: string }) {
  const stored = useDemoStore((state) => state.moduleNotes[moduleId] ?? "");
  const setModuleNote = useDemoStore((state) => state.setModuleNote);
  const [text, setText] = useState(stored);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();

  const save = (value: string) => {
    clearTimeout(timer.current);
    setModuleNote(moduleId, value);
    setSaved(true);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

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
          const value = event.target.value;
          setText(value);
          setSaved(false);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => save(value), SAVE_DELAY_MS);
        }}
        onBlur={() => {
          if (text !== stored) save(text);
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
