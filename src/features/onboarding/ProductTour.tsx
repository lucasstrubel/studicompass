import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Dein Studienstand",
    text: "Hier siehst du erreichte und vorgesehene ECTS. Die Prognose zeigt deinen weiteren Studienverlauf.",
    target: "study-progress",
  },
  {
    title: "Jetzt wichtig",
    text: "Hier findest du Entscheidungen mit Sonderregeln. Über „Folgen prüfen“ kannst du die Auswirkungen vergleichen.",
    target: "important",
  },
  {
    title: "Dein Assistent",
    text: "Stelle eine Frage oder wähle einen Vorschlag. Jede Antwort nennt Quellen oder sagt offen, wenn eine eindeutige Regel fehlt.",
    target: "inhalt",
  },
];

export function ProductTour() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const value = params.get("tour");
  const index = value === "1" ? 0 : value === "2" ? 1 : value === "3" ? 2 : -1;
  const step = STEPS[index];
  useEffect(() => {
    if (step)
      document
        .getElementById(step.target)
        ?.scrollIntoView?.({ block: "center" });
  }, [step, location.pathname]);
  function close() {
    const next = new URLSearchParams(params);
    next.delete("tour");
    setParams(next, { replace: true, preventScrollReset: true });
  }
  return (
    <Dialog
      open={!!step}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("inhalt")?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            Produkt-Tour · {index + 1}/3: {step?.title}
          </DialogTitle>
          <DialogDescription>{step?.text}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={close}>
            Tour abbrechen
          </Button>
          {index > 0 && (
            <Button
              variant="outline"
              onClick={() => void navigate(`/?tour=${index}`)}
            >
              Zurück
            </Button>
          )}
          <Button
            onClick={() =>
              index === 2
                ? close()
                : void navigate(index === 1 ? "/assistent?tour=3" : "/?tour=2")
            }
          >
            {index === 2 ? "Tour abschließen" : "Weiter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
