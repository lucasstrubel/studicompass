import type { PreviewModule } from "./dashboard-preview";

/** Original local line art; decorative because the adjacent module heading names the subject. */
export function ModuleIllustration({ kind }: { kind: PreviewModule["art"] }) {
  return (
    <svg
      viewBox="0 0 88 88"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-20 shrink-0 text-foreground/75"
    >
      <path
        d="M9 69Q44 81 79 67L76 74Q41 86 12 75Z"
        className="fill-muted stroke-border"
      />
      {kind === "chart" && (
        <>
          <path d="M17 66V29M17 66H73" />
          <path
            d="M26 65V48H36V65M43 65V35H53V65M60 65V20H70V65"
            className="fill-accent-soft stroke-accent-strong"
          />
          <path d="M22 37L40 24L52 28L72 10M64 10H72V18" />
          <circle cx="25" cy="19" r="5" className="fill-muted" />
        </>
      )}
      {kind === "database" && (
        <>
          <path
            d="M21 24V63C21 76 69 76 69 63V24"
            className="fill-accent-soft"
          />
          <ellipse cx="45" cy="24" rx="24" ry="10" className="fill-card" />
          <path d="M21 42C21 55 69 55 69 42M21 59C21 72 69 72 69 59" />
          <path d="M29 38L35 40M29 55L35 57" className="stroke-accent-strong" />
        </>
      )}
      {kind === "books" && (
        <>
          <path
            d="M14 61L53 49L76 57L37 71ZM14 61V68L37 78L76 64V57"
            className="fill-accent-soft"
          />
          <path
            d="M13 45L52 33L75 41L36 55ZM13 45V53L36 62L75 49V41"
            className="fill-card"
          />
          <path
            d="M22 20Q34 16 44 23Q55 17 67 21V44Q55 40 44 46Q33 40 22 43Z"
            className="fill-muted"
          />
          <path d="M44 23V46M28 26L37 28M28 32L37 34M51 27L60 26M51 33L60 32" />
        </>
      )}
      {kind === "process" && (
        <>
          <path d="M44 28V38M25 48H14V65H31M63 48H75V65H58M44 58V69" />
          <rect
            x="27"
            y="11"
            width="34"
            height="17"
            rx="4"
            className="fill-accent-soft"
          />
          <path d="M44 36L62 48L44 60L26 48Z" className="fill-card" />
          <rect
            x="31"
            y="67"
            width="27"
            height="13"
            rx="3"
            className="fill-muted"
          />
        </>
      )}
      {kind === "globe" && (
        <>
          <circle cx="44" cy="40" r="27" className="fill-accent-soft" />
          <ellipse cx="44" cy="40" rx="13" ry="27" />
          <path d="M18 40H70M23 25Q44 35 65 25M23 55Q44 45 65 55M44 13V67M29 75H60M44 67V75" />
        </>
      )}
    </svg>
  );
}
