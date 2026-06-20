import { NextResponse } from "next/server";
import { createAssistantReply } from "@/lib/basicAssistant";

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const reply = createAssistantReply(messages);

    return NextResponse.json({
      message: {
        role: "assistant",
        ...reply
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
