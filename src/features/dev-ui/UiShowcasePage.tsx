import { useEffect, useState, type ReactNode } from "react";
import { CircleHelp, MoreHorizontal, Undo2 } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// The components from ROADMAP P1-02; each one gets its own section.
type ShowcaseComponent =
  | "button"
  | "card"
  | "badge"
  | "dialog"
  | "alert-dialog"
  | "sheet"
  | "tabs"
  | "tooltip"
  | "popover"
  | "progress"
  | "separator"
  | "select"
  | "switch"
  | "slider"
  | "skeleton"
  | "sonner"
  | "dropdown-menu"
  | "avatar"
  | "scroll-area"
  | "accordion"
  | "toggle-group"
  | "chart";
type Theme = "light" | "dark";

// Sample texts for this developer page only; the app's data comes from src/data via services (P2).
const DEADLINES = [
  "Abmeldung Statistik – Di, 26.01.2027, 23:59",
  "Abmeldung Datenbanken – Do, 28.01.2027, 23:59",
  "Abgabe Fallstudie 5 Marketing – So, 31.01.2027, 23:59",
  "Abmeldung Software Engineering 1 – Mo, 01.02.2027, 23:59",
  "Abmeldung Geschäftsprozessmanagement – Mi, 03.02.2027, 23:59",
  "Abmeldung Marketing – So, 07.02.2027, 23:59",
  "Infoveranstaltung Praxissemester WS 2027/28 – Mi, 10.02.2027, 14:00",
  "Rückmeldung zum SS 2027 – Mo, 15.02.2027",
  "Prüfungsanmeldung SS 2027 – 10.05.–24.05.2027",
  "Antrag auf Zulassung zum Praxissemester WS 2027/28 – Fr, 14.05.2027",
];

const ECTS_DATA = [
  { term: "Start", actual: 0, target: 0 },
  { term: "1. Sem.", actual: 30, target: 30 },
  { term: "2. Sem.", actual: 48, target: 60 },
];

const ECTS_CHART_CONFIG = {
  actual: { label: "Ist", color: "var(--chart-2)" },
  target: { label: "Soll", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function Section({
  name,
  children,
}: {
  name: ShowcaseComponent;
  children: ReactNode;
}) {
  const headingId = `ui-${name}`;
  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border p-5"
    >
      <h2 id={headingId} className="font-mono text-sm text-muted-foreground">
        {name}
      </h2>
      {children}
    </section>
  );
}

export function UiShowcasePage() {
  const [theme, setTheme] = useState<Theme>("light");
  const dark = theme === "dark";

  // Dialogs, menus and toasts render in a portal under <body>, outside the page container,
  // so the dark class goes on <body> too. This dev page stores nothing; the ThemeProvider follows in P1-03.
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    return () => document.body.classList.remove("dark");
  }, [dark]);

  return (
    <TooltipProvider>
      <div
        data-testid="ui-showcase"
        className={cn(
          "min-h-svh bg-background px-4 py-8 text-foreground md:px-8",
          dark && "dark",
        )}
      >
        <main className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold">Komponenten</h1>
              <p className="text-sm text-muted-foreground">
                Entwickler-Route, nur im Dev-Build. Farben und Schrift folgen
                mit den Design-Tokens.
              </p>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              value={theme}
              onValueChange={(value) => {
                if (value === "light" || value === "dark") setTheme(value);
              }}
              aria-label="Darstellung"
            >
              <ToggleGroupItem value="light">Hell</ToggleGroupItem>
              <ToggleGroupItem value="dark">Dunkel</ToggleGroupItem>
            </ToggleGroup>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Section name="button">
              <div className="flex flex-wrap items-center gap-2">
                <Button>Folgen prüfen</Button>
                <Button variant="outline">Ich trete an</Button>
                <Button variant="secondary">Später erinnern</Button>
                <Button variant="ghost">Abbrechen</Button>
                <Button variant="destructive">Demo zurücksetzen</Button>
                <Button variant="link">Quelle ansehen</Button>
                <Button variant="outline" size="icon" aria-label="Rückgängig">
                  <Undo2 />
                </Button>
                <Button disabled>Nicht verfügbar</Button>
              </div>
            </Section>

            <Section name="card">
              <Card>
                <CardHeader>
                  <CardTitle>Statistik</CardTitle>
                  <CardDescription>
                    Klausur 90 Min. · Mi, 27.01.2027, 10:30 Uhr · Raum A 210
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  Übungsblätter 5/12 · letzte Aktivität vor 16 Tagen
                </CardContent>
                <CardFooter className="gap-2">
                  <Badge variant="secondary">Angemeldet</Badge>
                  <Badge variant="outline">6 ECTS</Badge>
                </CardFooter>
              </Card>
            </Section>

            <Section name="badge">
              <div className="flex flex-wrap gap-2">
                <Badge>Demo</Badge>
                <Badge variant="secondary">Moodle</Badge>
                <Badge variant="outline">Beispiel</Badge>
                <Badge variant="destructive">Frist morgen</Badge>
                <Badge variant="ghost">POS</Badge>
              </div>
            </Section>

            <Section name="dialog">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-fit">
                    Raumänderung ansehen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Raumänderung: Klausur Statistik am 27.01.
                    </DialogTitle>
                    <DialogDescription>
                      Prüfungsamt · Fr, 22.01.2027, 14:05
                    </DialogDescription>
                  </DialogHeader>
                  <p className="text-sm">
                    Liebe Studierende, die Klausur Statistik am Mittwoch,
                    27.01.2027, 10:30 Uhr findet in Raum A 210 statt (bisher B
                    104). Bitte seid 15 Minuten vorher da und bringt euren
                    Studierendenausweis mit.
                  </p>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button>Schließen</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Section>

            <Section name="alert-dialog">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-fit">
                    Entscheidung treffen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Wie entscheidest du dich bei Statistik?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Die Abmeldung wird nur simuliert und lässt sich rückgängig
                      machen. Im echten Betrieb meldest du dich im POS ab.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Ich trete an</AlertDialogCancel>
                    <AlertDialogAction variant="outline">
                      Abmeldung vornehmen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Section>

            <Section name="sheet">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-fit">
                    Mehr
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom">
                  <SheetHeader>
                    <SheetTitle>Mehr</SheetTitle>
                    <SheetDescription>Weitere Bereiche</SheetDescription>
                  </SheetHeader>
                  <ul className="flex flex-col gap-1 px-4 pb-6 text-sm">
                    <li>Module &amp; Noten</li>
                    <li>Fristen</li>
                    <li>Einstellungen</li>
                  </ul>
                </SheetContent>
              </Sheet>
            </Section>

            <Section name="tabs">
              <Tabs defaultValue="exams">
                <TabsList>
                  <TabsTrigger value="exams">Prüfungen</TabsTrigger>
                  <TabsTrigger value="deadlines">Fristen</TabsTrigger>
                  <TabsTrigger value="grades">Noten</TabsTrigger>
                </TabsList>
                <TabsContent value="exams" className="text-sm">
                  5 Prüfungen im WS 2026/27, alle angemeldet.
                </TabsContent>
                <TabsContent value="deadlines" className="text-sm">
                  Nächste Frist: Abmeldung Statistik, Di, 26.01.2027, 23:59.
                </TabsContent>
                <TabsContent value="grades" className="text-sm">
                  48 ECTS bestanden, Notenschnitt 2,4.
                </TabsContent>
              </Tabs>
            </Section>

            <Section name="tooltip">
              <div className="flex items-center gap-2 text-sm">
                Fachsemester 3
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Was heißt Fachsemester?"
                    >
                      <CircleHelp />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Semester, die du in diesem Studiengang eingeschrieben bist.
                  </TooltipContent>
                </Tooltip>
              </div>
            </Section>

            <Section name="popover">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-fit">
                    Quelle anzeigen
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverHeader>
                    <PopoverTitle>
                      Modulhandbuch Wirtschaftsinformatik
                    </PopoverTitle>
                    <PopoverDescription>
                      Modul Statistik · Beispiel
                    </PopoverDescription>
                  </PopoverHeader>
                  <p className="text-sm">
                    Statistik wird nur im Wintersemester angeboten.
                  </p>
                </PopoverContent>
              </Popover>
            </Section>

            <Section name="progress">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span id="progress-label">Statistik: Übungsblätter</span>
                  <span className="tabular-nums">5/12</span>
                </div>
                <Progress value={42} aria-labelledby="progress-label" />
              </div>
            </Section>

            <Section name="separator">
              <div className="flex flex-col gap-3 text-sm">
                <span>Moodle · Statistik</span>
                <Separator />
                <div className="flex h-5 items-center gap-3">
                  <span>POS</span>
                  <Separator orientation="vertical" />
                  <span>Mail</span>
                  <Separator orientation="vertical" />
                  <span>Website</span>
                </div>
              </div>
            </Section>

            <Section name="select">
              <Select defaultValue="factual">
                <SelectTrigger className="w-56" aria-label="Hinweis-Stil">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="factual">Sachlich</SelectItem>
                  <SelectItem value="direct">Direkt</SelectItem>
                </SelectContent>
              </Select>
            </Section>

            <Section name="switch">
              <label className="flex items-center gap-3 text-sm">
                <Switch />
                Fehler der Kanäle simulieren
              </label>
            </Section>

            <Section name="slider">
              <div className="flex flex-col gap-3 text-sm">
                <span id="slider-label">Nebenjob: 15 Std./Woche</span>
                <Slider
                  defaultValue={[15]}
                  max={20}
                  step={1}
                  aria-labelledby="slider-label"
                />
              </div>
            </Section>

            <Section name="skeleton">
              <div
                className="flex items-center gap-4"
                aria-label="Wird geladen"
              >
                <Skeleton className="size-10 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </Section>

            <Section name="sonner">
              <Button
                variant="outline"
                className="w-fit"
                onClick={() =>
                  toast.success("Abmeldung von Statistik simuliert", {
                    description:
                      "Nur in dieser Demo, im POS hat sich nichts geändert.",
                    action: { label: "Rückgängig", onClick: () => undefined },
                  })
                }
              >
                Hinweis anzeigen
              </Button>
            </Section>

            <Section name="dropdown-menu">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Weitere Aktionen"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Niklas Brandt</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Einstellungen</DropdownMenuItem>
                  <DropdownMenuItem>Demo zurücksetzen</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Section>

            <Section name="avatar">
              <div className="flex items-center gap-3 text-sm">
                <Avatar>
                  <AvatarFallback>NB</AvatarFallback>
                </Avatar>
                Niklas Brandt · Wirtschaftsinformatik, 3. Semester
              </div>
            </Section>

            <Section name="scroll-area">
              <ScrollArea className="h-40 rounded-xl border border-border">
                <ul className="flex flex-col gap-2 p-3 text-sm">
                  {DEADLINES.map((deadline) => (
                    <li key={deadline}>{deadline}</li>
                  ))}
                </ul>
              </ScrollArea>
            </Section>

            <Section name="accordion">
              <Accordion type="single" collapsible>
                <AccordionItem value="withdraw">
                  <AccordionTrigger>
                    Bis wann kann ich mich von einer Prüfung abmelden?
                  </AccordionTrigger>
                  <AccordionContent>
                    Bis zum Vortag der Prüfung um 23:59 Uhr – ohne Angabe von
                    Gründen, im POS. Eine Abmeldung zählt nicht als
                    Prüfungsversuch.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="offering">
                  <AccordionTrigger>
                    Wann wird Statistik angeboten?
                  </AccordionTrigger>
                  <AccordionContent>
                    Statistik wird nur im Wintersemester angeboten.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Section>

            <Section name="toggle-group">
              <ToggleGroup
                type="single"
                defaultValue="semester"
                aria-label="Zeitraum"
              >
                <ToggleGroupItem value="week">Woche</ToggleGroupItem>
                <ToggleGroupItem value="month">Monat</ToggleGroupItem>
                <ToggleGroupItem value="semester">Semester</ToggleGroupItem>
              </ToggleGroup>
            </Section>

            <Section name="chart">
              <p className="text-sm text-muted-foreground">
                ECTS kumuliert: Ist 48, Soll 60
              </p>
              <ChartContainer
                config={ECTS_CHART_CONFIG}
                className="h-56 w-full"
              >
                <ComposedChart
                  data={ECTS_DATA}
                  margin={{ left: -16, right: 8 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="term" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area
                    dataKey="actual"
                    type="monotone"
                    stroke="var(--color-actual)"
                    fill="var(--color-actual)"
                    fillOpacity={0.15}
                  />
                  <Line
                    dataKey="target"
                    type="monotone"
                    stroke="var(--color-target)"
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </ComposedChart>
              </ChartContainer>
            </Section>
          </div>
        </main>
      </div>
      <Toaster theme={theme} />
    </TooltipProvider>
  );
}
