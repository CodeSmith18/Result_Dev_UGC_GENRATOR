import { NextResponse } from "next/server";
import { createAssistantReply } from "@/lib/chatFlow";

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
    return NextResponse.json(
      {
        message: {
          role: "assistant",
          status: "error",
          content: "I could not read that message. Please try again."
        }
      },
      { status: 400 }
    );
  }
}
