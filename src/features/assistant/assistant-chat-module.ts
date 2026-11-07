type AssistantChatModule = typeof import("./AssistantChat");

let loaded: AssistantChatModule | null = null;

export function loadedAssistantChat() {
  return loaded;
}

/** The chat and assistant-ui are only needed once someone opens them, so they load on their own. */
export function preloadAssistantChat() {
  return import("./AssistantChat").then((module) => {
    loaded = module;
    return module;
  });
}
