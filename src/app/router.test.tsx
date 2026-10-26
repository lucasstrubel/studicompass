import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers";
import { routes } from "@/app/router";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/components/layout/navigation";
import { APP_NAME } from "@/config/demo";

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

const sidebar = () => within(screen.getByTestId("sidebar"));
const tabBar = () => within(screen.getByTestId("tab-bar"));
const pageTitle = () => screen.getByRole("heading", { level: 1 });
const currentLinks = (links: HTMLElement[]) =>
  links.filter((link) => link.hasAttribute("aria-current"));

describe("routes (KONZEPT §7)", () => {
  it.each([
    ["/", "Übersicht"],
    ["/verlauf", "Studienverlauf"],
    ["/module", "Module & Noten"],
    ["/module/m-stat", "Module & Noten"],
    ["/postfach", "Postfach"],
    ["/assistent", "Assistent"],
    ["/fristen", "Fristen"],
    ["/entscheidung/e-stat-ws26", "Folgen-Check"],
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

  it("answers unknown paths with the 404 page, which leads back to the Übersicht", async () => {
    const user = userEvent.setup();
    const router = renderApp("/module/m-stat/gibt-es-nicht");

    expect(screen.getByText("Diese Seite gibt es nicht.")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Zur Übersicht" }));

    expect(router.state.location.pathname).toBe("/");
    expect(pageTitle()).toHaveTextContent("Übersicht");
  });

  it("shows the onboarding without the app shell, with a way into the demo", () => {
    renderApp("/start");

    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Demo ohne Einrichtung starten" }),
    ).toHaveAttribute("href", "/");
  });
});

describe("sidebar", () => {
  it.each([...NAV_ITEMS, SETTINGS_ITEM].map((item) => [item.label, item.to]))(
    "the link %s opens %s and marks it as the current page",
    async (label, to) => {
      const user = userEvent.setup();
      const router = renderApp("/gibt-es-nicht");

      await user.click(sidebar().getByRole("link", { name: label }));

      expect(router.state.location.pathname).toBe(to);
      expect(pageTitle()).toHaveTextContent(label);
      expect(currentLinks(sidebar().getAllByRole("link"))).toEqual([
        sidebar().getByRole("link", { name: label }),
      ]);
    },
  );

  it("marks Module & Noten on a module detail page, and the Übersicht only on /", () => {
    renderApp("/module/m-stat");

    expect(currentLinks(sidebar().getAllByRole("link"))).toEqual([
      sidebar().getByRole("link", { name: "Module & Noten" }),
    ]);
  });

  it("marks no entry on the Folgen-Check, which is not in the navigation", () => {
    renderApp("/entscheidung/e-stat-ws26");

    expect(currentLinks(sidebar().getAllByRole("link"))).toEqual([]);
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
    await user.tab(); // Übersicht
    await user.tab(); // Studienverlauf
    expect(
      sidebar().getByRole("link", { name: "Studienverlauf" }),
    ).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(router.state.location.pathname).toBe("/verlauf");
  });
});

describe("top bar", () => {
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

describe("mobile tab bar", () => {
  it("shows Übersicht, Verlauf, Postfach and Assistent, then Mehr", () => {
    renderApp("/");

    expect(
      tabBar()
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Übersicht", "Verlauf", "Postfach", "Assistent"]);
    expect(tabBar().getByRole("button", { name: "Mehr" })).toBeInTheDocument();
  });

  it("opens the other areas from Mehr and closes the sheet after navigating", async () => {
    const user = userEvent.setup();
    const router = renderApp("/");

    await user.click(tabBar().getByRole("button", { name: "Mehr" }));
    const sheet = within(screen.getByRole("dialog", { name: "Mehr" }));
    expect(sheet.getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Module & Noten",
      "Fristen",
      "Einstellungen",
    ]);

    await user.click(sheet.getByRole("link", { name: "Fristen" }));
    expect(router.state.location.pathname).toBe("/fristen");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(tabBar().getByRole("button", { name: "Mehr" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});

describe("scroll position", () => {
  it("starts a newly opened page at the top", async () => {
    const user = userEvent.setup();
    const scrollTo = vi.spyOn(window, "scrollTo");
    renderApp("/");
    scrollTo.mockClear();

    await user.click(sidebar().getByRole("link", { name: "Postfach" }));

    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
  });
});
