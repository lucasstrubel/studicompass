import { useStore } from "zustand";
import { demoStore, type DemoState } from "./demo-store";

export function useDemoStore<T>(selector: (state: DemoState) => T): T {
  return useStore(demoStore, selector);
}
