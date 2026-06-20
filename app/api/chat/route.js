import { NextResponse } from "next/server";
import { createAssistantReply } from "@/lib/chatFlow";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const context = body.context && typeof body.context === "object" ? body.context : {};
    const reply = await createAssistantReply(messages, context);

    return NextResponse.json({
      message: {
        role: "assistant",
        ...reply.message
      },
      context: {
        ...context,
        ...reply.contextPatch
      }
    });
  } catch (error) {
    console.error("Chat route failed", error);

    return NextResponse.json(
      {
        message: {
          role: "assistant",
          status: "error",
          content:
            "I could not finish that step. Please try again, or send a shorter product URL/message."
        }
      },
      { status: 400 }
    );
  }
}
