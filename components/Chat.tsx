"use client";

import { VoiceProvider, ToolCallHandler } from "@humeai/voice-react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import { ComponentRef, useRef } from "react";
import { toast } from "sonner";

const ALLOWLISTED_COMPOSIO_TOOLS = new Set([
  "send_gmail_email",
  "gmail_send_email",
  "GMAIL_SEND_EMAIL",
  "create_github_issue",
  "github_create_an_issue",
  "GITHUB_CREATE_AN_ISSUE",
  "create_calendar_event",
  "googlecalendar_create_event",
  "GOOGLECALENDAR_CREATE_EVENT",
]);

const handleToolCall: ToolCallHandler = async (message, send) => {
  if (!ALLOWLISTED_COMPOSIO_TOOLS.has(message.name)) {
    return send.error({
      error: "Tool not allowlisted",
      code: "composio_not_allowlisted",
      level: "warn",
      content:
        "Demo only supports GMAIL_SEND_EMAIL, GITHUB_CREATE_AN_ISSUE, GOOGLECALENDAR_CREATE_EVENT",
    });
  }

  try {
    const response = await fetch("/api/composio/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: message.name,
        parameters: message.parameters,
      }),
    });
    const result = await response.json();
    if (result.success) {
      return send.success(result.data);
    }
    return send.error(
      result.error ?? {
        error: "Composio tool error",
        code: "composio_tool_error",
        level: "warn",
        content: "Composio tool call failed",
      }
    );
  } catch {
    return send.error({
      error: "Composio tool error",
      code: "composio_tool_error",
      level: "warn",
      content: "There was an error calling the Composio demo tool",
    });
  }
};

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string;
}) {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);

  const configId = process.env["NEXT_PUBLIC_HUME_CONFIG_ID"];

  return (
    <div
      className={
        "relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]"
      }
    >
      <VoiceProvider
        onToolCall={handleToolCall}
        onMessage={() => {
          if (timeout.current) {
            window.clearTimeout(timeout.current);
          }

          timeout.current = window.setTimeout(() => {
            if (ref.current) {
              const scrollHeight = ref.current.scrollHeight;

              ref.current.scrollTo({
                top: scrollHeight,
                behavior: "smooth",
              });
            }
          }, 200);
        }}
        onError={(error) => {
          toast.error(error.message);
        }}
      >
        <Messages ref={ref} />
        <Controls />
        <StartCall configId={configId} accessToken={accessToken} />
      </VoiceProvider>
    </div>
  );
}
