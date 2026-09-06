import { NextRequest, NextResponse } from "next/server";

/**
 * Demo-only Composio allowlist — small surface, not full toolkit.
 * Product Android day-one stays Convex lessons (no full Composio).
 */
const ALLOWLIST = [
  "GMAIL_SEND_EMAIL",
  "GITHUB_CREATE_AN_ISSUE",
  "GOOGLECALENDAR_CREATE_EVENT",
] as const;

type Allowlisted = (typeof ALLOWLIST)[number];

const HUME_NAME_TO_COMPOSIO: Record<string, Allowlisted> = {
  send_gmail_email: "GMAIL_SEND_EMAIL",
  gmail_send_email: "GMAIL_SEND_EMAIL",
  GMAIL_SEND_EMAIL: "GMAIL_SEND_EMAIL",
  create_github_issue: "GITHUB_CREATE_AN_ISSUE",
  github_create_an_issue: "GITHUB_CREATE_AN_ISSUE",
  GITHUB_CREATE_AN_ISSUE: "GITHUB_CREATE_AN_ISSUE",
  create_calendar_event: "GOOGLECALENDAR_CREATE_EVENT",
  googlecalendar_create_event: "GOOGLECALENDAR_CREATE_EVENT",
  GOOGLECALENDAR_CREATE_EVENT: "GOOGLECALENDAR_CREATE_EVENT",
};

function resolveSlug(name: string): Allowlisted | null {
  const mapped = HUME_NAME_TO_COMPOSIO[name] ?? HUME_NAME_TO_COMPOSIO[name.toLowerCase()];
  if (mapped) return mapped;
  if ((ALLOWLIST as readonly string[]).includes(name)) return name as Allowlisted;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const toolName = String(body?.name ?? body?.tool_slug ?? "");
    const parameters =
      typeof body?.parameters === "string"
        ? JSON.parse(body.parameters)
        : (body?.parameters ?? body?.arguments ?? {});

    const slug = resolveSlug(toolName);
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "Tool not allowlisted",
            code: "composio_not_allowlisted",
            level: "warn",
            content: `Demo Composio allowlist only: ${ALLOWLIST.join(", ")}`,
          },
        },
        { status: 403 }
      );
    }

    const apiKey = process.env.COMPOSIO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "Composio not configured",
            code: "composio_missing_api_key",
            level: "warn",
            content:
              "COMPOSIO_API_KEY is not set on the demo host. Allowlisted tools are wired in code but not executable yet.",
          },
        },
        { status: 503 }
      );
    }

    const entityId = process.env.COMPOSIO_ENTITY_ID ?? "default";
    const res = await fetch(
      `https://backend.composio.dev/api/v2/actions/${slug}/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          entityId,
          input: parameters,
        }),
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "Composio execution failed",
            code: "composio_execute_failed",
            level: "warn",
            content: JSON.stringify(data).slice(0, 500),
          },
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: JSON.stringify(data),
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          error: "Composio route error",
          code: "composio_route_error",
          level: "error",
          content: err instanceof Error ? err.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
