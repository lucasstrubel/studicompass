import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers";
import { routes } from "@/app/router";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/components/layout/navigation";
import { APP_NAME, THEME_STORAGE_KEY } from "@/config/demo";
import { SYSTEM_DARK_QUERY } from "@/lib/theme";

afterEach(() => {
  vi.restoreAllMocks();
});

function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

const menu = () => within(screen.getByRole("dialog", { name: APP_NAME }));
async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Navigation öffnen" }));
}
const pageTitle = () => screen.getByRole("heading", { level: 1 });
const currentLinks = (links: HTMLElement[]) =>
  links.filter((link) => link.hasAttribute("aria-current"));

describe("routes (KONZEPT §7)", () => {
  it.each([
    ["/verlauf", "Studienverlauf"],
    ["/module", "Module & Noten"],
    ["/module/m-stat", "Module & Noten"],
    ["/postfach", "Postfach"],
    ["/assistent", "Assistent"],
    ["/fristen", "Fristen"],
    ["/einstellungen", "Einstellungen"],
    ["/start", "Onboarding"],
    ["/gibt-es-nicht", "Seite nicht gefunden"],
  ])(
    "%s shows the title %s on the page and in the browser tab",
    (path, title) => {
      renderApp(path);

      expect(pageTitle()).toHaveTextContent(title);
      expect(document.title).toBe(`${title} · ${APP_NAME}`);
    },
  );

  it("/ greets on the page and shows Übersicht in the browser tab", () => {
    renderApp("/");

    expect(pageTitle()).toHaveTextContent("Guten Abend");
    expect(document.title).toBe(`Übersicht · ${APP_NAME}`);
  });

  it("answers unknown paths with the 404 page, which leads back to the Übersicht", async () => {
    const user = userEvent.setup();
    const router = renderApp("/module/m-stat/gibt-es-nicht");

    expect(screen.getByText("Diese Seite gibt es nicht.")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Zur Übersicht" }));

    expect(router.state.location.pathname).toBe("/");
    expect(document.title).toBe(`Übersicht · ${APP_NAME}`);
  });

  it("shows the onboarding without the app shell, with a way into the demo", () => {
    renderApp("/start");

    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Demo ohne Einrichtung starten" }),
    ).toHaveAttribute("href", "/");
  });

  it("keeps the developer route /_ui outside the shell", async () => {
    renderApp("/_ui");

    expect(
      await screen.findByRole(
        "heading",
        { level: 1, name: "Komponenten" },
        { timeout: 10000 },
      ),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
    expect(document.title).toBe(APP_NAME);
  });
});

describe("full navigation", () => {
  it.each([...NAV_ITEMS, SETTINGS_ITEM].map((item) => [item.label, item.to]))(
    "the link %s opens %s and marks it as the current page",
    async (label, to) => {
      const user = userEvent.setup();
      const router = renderApp("/gibt-es-nicht");

      await openMenu(user);
      await user.click(menu().getByRole("link", { name: label }));

      expect(router.state.location.pathname).toBe(to);
      expect(document.title).toBe(`${label} · ${APP_NAME}`);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await openMenu(user);
      expect(currentLinks(menu().getAllByRole("link"))).toEqual([
        menu().getByRole("link", { name: label }),
      ]);
    },
  );

  it("marks Module & Noten on a module detail page, and the Übersicht only on /", async () => {
    const user = userEvent.setup();
    renderApp("/module/m-stat");
    await openMenu(user);

    expect(currentLinks(menu().getAllByRole("link"))).toEqual([
      menu().getByRole("link", { name: "Module & Noten" }),
    ]);
  });

  it("marks no entry on the Folgen-Check, which is not in the navigation", async () => {
    const user = userEvent.setup();
    renderApp("/entscheidung/e-stat-ws26");
    await openMenu(user);

    expect(currentLinks(menu().getAllByRole("link"))).toEqual([]);
  });
});

describe("keyboard", () => {
  it("starts with the skip link, which moves the focus to the content", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await user.tab();
    expect(screen.getByRole("link", { name: "Zum Inhalt" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("navigates with Tab and Enter", async () => {
    const user = userEvent.setup();
    const router = renderApp("/");

    await user.tab(); // skip link
    await user.tab(); // hamburger
    await user.keyboard("{Enter}");
    await user.tab(); // hamburger close -> close button
    await user.tab(); // close button -> Übersicht
    await user.tab(); // Studienverlauf
    expect(menu().getByRole("link", { name: "Studienverlauf" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(router.state.location.pathname).toBe("/verlauf");
  });
});

describe("top bar", () => {
  it("toggles between light and dark by click and keyboard and remembers the choice", async () => {
    const user = userEvent.setup();
    renderApp("/");
    const toggle = screen.getByRole("switch", { name: "Dunkelmodus" });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(toggle).toBeChecked();
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    await user.keyboard(" ");
    expect(toggle).not.toBeChecked();
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("switches to explicit light when the system starts in dark mode", async () => {
    const user = userEvent.setup();
    const matchMedia = window.matchMedia.bind(window);
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      ...matchMedia(query),
      matches: query === SYSTEM_DARK_QUERY,
    }));
    renderApp("/");
    const toggle = screen.getByRole("switch", { name: "Dunkelmodus" });
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("shows the demo time", () => {
    renderApp("/");

    expect(screen.getByText("Demo · Mo, 25.01.2027")).toBeInTheDocument();
  });

  it("opens the notifications from the bell", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await user.click(
      screen.getByRole("button", { name: "Benachrichtigungen" }),
    );
    const sheet = within(
      screen.getByRole("dialog", { name: "Benachrichtigungen" }),
    );
    expect(
      sheet.getByText("Du hast keine neuen Benachrichtigungen."),
    ).toBeInTheDocument();

    await user.click(sheet.getByRole("button", { name: "Schließen" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("leads from the profile menu to the settings, also by keyboard", async () => {
    const user = userEvent.setup();
    const router = renderApp("/");

    screen.getByRole("button", { name: "Profil" }).focus();
    await user.keyboard("{Enter}");
    expect(
      await screen.findByRole("menuitem", { name: "Einstellungen" }),
    ).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(router.state.location.pathname).toBe("/einstellungen");
  });
});

describe("responsive navigation structure", () => {
  it("has no permanent sidebar or bottom tab bar", () => {
    renderApp("/");
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tab-bar")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Navigation öffnen" }),
    ).toHaveAttribute("aria-expanded", "false");
  });
});

describe("scroll position", () => {
  it("starts a newly opened page at the top", async () => {
    const user = userEvent.setup();
    const scrollTo = vi.spyOn(window, "scrollTo");
    renderApp("/");
    scrollTo.mockClear();

    await openMenu(user);
    await user.click(menu().getByRole("link", { name: "Postfach" }));

    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
  });
});
