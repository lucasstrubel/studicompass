import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import type { MoodleResult } from "@/store/demo-store";
import { useDemoStore } from "@/store/use-demo-store";

/**
 * Moodle as the backend for the own entries (ADR 0004): Prüfungsvorleistungen, notes, course links
 * and own dates as one file in the private files of the connected Moodle. Saving and loading are
 * explicit, so nothing is overwritten unasked on either side.
 */
export function MoodleBackup() {
  const backupAt = useDemoStore((state) => state.moodleBackupAt);
  const check = useDemoStore((state) => state.checkMoodleBackup);
  const save = useDemoStore((state) => state.saveToMoodle);
  const restore = useDemoStore((state) => state.restoreFromMoodle);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    kind: "status" | "alert";
    text: string;
  } | null>(null);

  useEffect(() => {
    void check();
  }, [check]);

  const run = (action: () => Promise<MoodleResult>, done: string) => {
    setBusy(true);
    setMessage(null);
    void action().then((result) => {
      setBusy(false);
      setMessage(
        result.ok
          ? { kind: "status", text: done }
          : { kind: "alert", text: result.error },
      );
    });
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <h3 className="text-card-title">Eigene Einträge in Moodle sichern</h3>
      <p className="text-body">
        Prüfungsvorleistungen, Notizen, Kurs-Links und eigene Termine liegen
        sonst nur in diesem Browser. Als Datei in deinen privaten Dateien in
        Moodle stehen sie auch auf einem anderen Gerät bereit.
      </p>
      <p className="text-meta text-muted-foreground">
        {backupAt === null
          ? "Sicherung wird gesucht …"
          : backupAt === "none"
            ? "In diesem Moodle liegt noch keine Sicherung."
            : `Letzte Sicherung in Moodle: ${formatDateTime(new Date(backupAt))}`}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => run(save, "Deine Einträge sind in Moodle gesichert.")}
        >
          In Moodle sichern
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={busy || backupAt === null || backupAt === "none"}
            >
              Aus Moodle laden
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Einträge aus Moodle laden?</AlertDialogTitle>
              <AlertDialogDescription>
                Deine Prüfungsvorleistungen, Notizen, Kurs-Links und eigenen
                Termine in diesem Browser werden durch die Sicherung ersetzt.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  run(restore, "Die Einträge aus Moodle sind geladen.")
                }
              >
                Laden
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {message && (
        <p
          role={message.kind}
          className={
            message.kind === "alert"
              ? "text-body text-status-critical-foreground"
              : "text-body"
          }
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
