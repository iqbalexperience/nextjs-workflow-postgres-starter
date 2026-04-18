import { createUIMessageStreamResponse } from "ai";
import { start } from "workflow/api";
import { chatAgent } from "@/workflows/chat-agent";
import type { UIMessage } from "ai";
import { convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[]; model?: string } =
    await req.json();

  // Convert UI messages to the format expected by the model
  const modelMessages = await convertToModelMessages(messages);

  // Start the durable agent workflow
  const run = await start(chatAgent, [modelMessages, model]);

  // Return a streaming response that the client's useChat hook can consume
  return createUIMessageStreamResponse({
    stream: run.readable,
    headers: {
      "x-workflow-run-id": run.runId,
    },
  });
}
