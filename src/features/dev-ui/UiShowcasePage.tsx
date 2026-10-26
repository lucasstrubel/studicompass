import type { ReactNode } from "react";
import {
  CircleCheck,
  CircleHelp,
  Info,
  MoreHorizontal,
  OctagonAlert,
  TriangleAlert,
  Undo2,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useTheme } from "@/app/theme-context";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ModuleIllustration } from "@/features/dashboard/ModuleIllustration";
import { isThemePreference } from "@/lib/theme";

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
// Design tokens from KONZEPT §12.2 and §12.3, shown above the components.
type TokenGroup = "farben" | "typografie";

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

// KONZEPT §12.2 charts: Ist = line --accent with surface --accent-soft, Soll = dashed --muted-foreground.
const ECTS_CHART_CONFIG = {
  actual: { label: "Ist", color: "var(--chart-1)" },
  target: { label: "Soll", color: "var(--chart-2)" },
} satisfies ChartConfig;

// Text on surface for the token pairs from KONZEPT §12.2.
const COLOR_PAIRS = [
  {
    label: "foreground auf background",
    className: "bg-background text-foreground",
  },
  {
    label: "card-foreground auf card",
    className: "bg-card text-card-foreground",
  },
  {
    label: "muted-foreground auf muted",
    className: "bg-muted text-muted-foreground",
  },
  {
    label: "primary-foreground auf primary",
    className: "bg-primary text-primary-foreground",
  },
  {
    label: "accent-foreground auf accent",
    className: "bg-accent text-accent-foreground",
  },
  { label: "accent-strong auf card", className: "bg-card text-accent-strong" },
  {
    label: "accent-soft-foreground auf accent-soft",
    className: "bg-accent-soft text-accent-soft-foreground",
  },
];

// Status colours: soft surface with text, plus the surface/icon colour; always icon and text (KONZEPT §12.2).
const STATUSES = [
  {
    label: "Im Plan",
    Icon: CircleCheck,
    badgeClassName: "bg-status-on-track-soft text-status-on-track-foreground",
    iconClassName: "text-status-on-track",
  },
  {
    label: "Knapp",
    Icon: TriangleAlert,
    badgeClassName: "bg-status-tight-soft text-status-tight-foreground",
    iconClassName: "text-status-tight",
  },
  {
    label: "Kritisch",
    Icon: OctagonAlert,
    badgeClassName: "bg-status-critical-soft text-status-critical-foreground",
    iconClassName: "text-status-critical",
  },
  {
    label: "Info",
    Icon: Info,
    badgeClassName: "bg-status-info-soft text-status-info-foreground",
    iconClassName: "text-status-info",
  },
];

// Type scale from KONZEPT §12.3 with texts from KONZEPT and docs/INHALTE.md.
const TYPE_SCALE = [
  {
    token: "text-page-title · 28/36 · 600",
    className: "text-page-title",
    text: "Übersicht",
  },
  {
    token: "text-section-title · 20/28 · 600",
    className: "text-section-title",
    text: "Dieses Semester (WS 2026/27)",
  },
  {
    token: "text-card-title · 16/24 · 600",
    className: "text-card-title",
    text: "Studienstand",
  },
  {
    token: "text-body · 15/22",
    className: "text-body",
    text: "Die Abmeldefrist für Statistik endet morgen um 23:59 Uhr.",
  },
  {
    token: "text-meta · 13/18 · 500",
    className: "text-meta text-muted-foreground",
    text: "Moodle · aktualisiert vor 12 Min.",
  },
  {
    token: "text-figure · 40/44 · 700",
    className: "text-figure tabular-nums",
    text: "48 ECTS",
  },
];

const ECTS_FIGURES = [
  { label: "Rückstand", value: 12 },
  { label: "Ist", value: 48 },
  { label: "Soll", value: 60 },
  { label: "Prognose", value: 78 },
];

function Section({
  name,
  children,
}: {
  name: ShowcaseComponent | TokenGroup;
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
  // The app-wide theme (class on <html>, stored like in the app), so portals and toasts switch too.
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-svh bg-background px-4 py-8 text-foreground md:px-8">
      <main className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Komponenten</h1>
            <p className="text-sm text-muted-foreground">
              Entwickler-Route, nur im Dev-Build. Farben, Schrift und Fokusring
              kommen aus den Design-Tokens (KONZEPT §12).
            </p>
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            value={theme}
            onValueChange={(value) => {
              if (isThemePreference(value)) setTheme(value);
            }}
            aria-label="Darstellung"
          >
            <ToggleGroupItem value="light">Hell</ToggleGroupItem>
            <ToggleGroupItem value="dark">Dunkel</ToggleGroupItem>
            <ToggleGroupItem value="system">System</ToggleGroupItem>
          </ToggleGroup>
        </header>

        <Section name="farben">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COLOR_PAIRS.map((pair) => (
              <div
                key={pair.label}
                className={cn(
                  "flex flex-col gap-1 rounded-xl border border-border p-3",
                  pair.className,
                )}
              >
                <span className="text-card-title tabular-nums">
                  48 ECTS · Soll 60
                </span>
                <span className="text-meta">{pair.label}</span>
              </div>
            ))}
            <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3 text-card-foreground">
              <span className="text-card-title">Rahmen</span>
              <span className="text-meta text-muted-foreground">
                border (dekorativ) und input (Eingabefeld)
              </span>
              <div className="mt-1 flex gap-2">
                <span className="h-6 flex-1 rounded-lg border border-border" />
                <span className="h-6 flex-1 rounded-lg border border-input" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {STATUSES.map(({ label, Icon, badgeClassName, iconClassName }) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-meta",
                    badgeClassName,
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </span>
                <Icon
                  className={cn("size-5", iconClassName)}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
          {/* Dark overlay menu tokens from the P1-07 navigation revision. */}
          <div className="flex max-w-64 flex-col gap-1 rounded-xl bg-sidebar p-2 text-sidebar-foreground">
            <span className="rounded-r-lg border-l-3 border-sidebar-primary bg-sidebar-active px-3 py-2 font-semibold">
              Übersicht
            </span>
            <span className="px-3 py-2 text-sidebar-muted">Studienverlauf</span>
            <span className="px-3 py-2 text-sidebar-muted">Postfach</span>
          </div>
        </Section>

        <Section name="typografie">
          <dl className="flex flex-col gap-3">
            {TYPE_SCALE.map((step) => (
              <div key={step.token} className="flex flex-col gap-0.5">
                <dt className="font-mono text-xs text-muted-foreground">
                  {step.token}
                </dt>
                <dd className={step.className}>{step.text}</dd>
              </div>
            ))}
          </dl>
          <div className="grid max-w-sm grid-cols-2 gap-6 text-card-title">
            {[true, false].map((tabular) => (
              <div key={String(tabular)} className="flex flex-col">
                <span className="font-mono text-xs font-normal text-muted-foreground">
                  {tabular ? "tabular-nums" : "proportional"}
                </span>
                {ECTS_FIGURES.map((figure) => (
                  <span
                    key={figure.label}
                    className="flex justify-between gap-4"
                  >
                    {figure.label}
                    <span className={cn(tabular && "tabular-nums")}>
                      {figure.value}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Section>

        <div
          data-testid="ui-components"
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
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
            <div className="flex items-center gap-3">
              <ModuleIllustration kind="books" />
              <p className="text-meta text-muted-foreground">
                Referenz 1: kompakte Karten, feine Rahmen, lokale
                Linienillustrationen.
              </p>
            </div>
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
            <div className="flex items-center gap-4" aria-label="Wird geladen">
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
            <ChartContainer config={ECTS_CHART_CONFIG} className="h-56 w-full">
              <ComposedChart data={ECTS_DATA} margin={{ left: -16, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="term" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  dataKey="actual"
                  type="monotone"
                  stroke="var(--color-actual)"
                  fill="var(--accent-soft)"
                  fillOpacity={1}
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
  );
}
