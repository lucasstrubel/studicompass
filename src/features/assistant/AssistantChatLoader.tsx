import { createElement, useEffect, useState } from "react";
import { ErrorState } from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssistantChatProps } from "./AssistantChat";
import {
  loadedAssistantChat,
  preloadAssistantChat,
} from "./assistant-chat-module";

/** Loads the chat on first use, with the usual loading and error states; renders at once when already loaded. */
export function AssistantChatLoader(props: AssistantChatProps) {
  const [chat, setChat] = useState(loadedAssistantChat);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (chat) return;
    let active = true;
    preloadAssistantChat().then(
      (module) => {
        if (active) setChat(module);
      },
      () => {
        if (active) setFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, [chat]);
  if (failed)
    return (
      <ErrorState
        className="m-4"
        title="Assistent konnte nicht geladen werden"
        message="Bitte lade die Seite erneut. Deine gespeicherten Einträge bleiben erhalten."
        retryLabel="Seite neu laden"
        onRetry={() => window.location.reload()}
      />
    );
  if (!chat)
    return (
      <Skeleton
        role="status"
        aria-label="Assistent wird geladen"
        className="m-4 h-40"
      />
    );
  return createElement(chat.AssistantChat, props);
}
