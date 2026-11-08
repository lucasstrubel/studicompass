import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { installPresentationBridge } from "@/lib/presentation";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/hanken-grotesk";
import "@/styles/globals.css";

installPresentationBridge();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
