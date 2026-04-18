import { DurableAgent } from "@workflow/ai/agent";
import { getWritable } from "workflow";
import { z } from "zod";
import type { ModelMessage, UIMessageChunk } from "ai";
import { openai } from "@workflow/ai/openai";
import { anthropic } from "@workflow/ai/anthropic";
import { google } from "@workflow/ai/google";


// Step: Get weather - simple tool example
async function getWeather({ city }: { city: string }) {
  "use step";
  console.log(`Fetching weather for: ${city}`);
  // In a real app, you'd call a weather API here
  const temperatures = {
    London: 15,
    Paris: 18,
    "New York": 22,
    Tokyo: 20,
  };
  const temp = temperatures[city as keyof typeof temperatures] || 25;
  return { city, temperature: temp, unit: "Celsius", description: "Sunny" };
}

function getModel(modelId: string) {
  if (modelId.startsWith("gpt")) return openai(modelId);
  if (modelId.startsWith("claude")) return anthropic(modelId);
  if (modelId.startsWith("gemini")) return google(modelId);
  return openai("gpt-4o");
}

export async function chatAgent(
  messages: ModelMessage[],
  modelId: string = "gpt-4o"
) {
  "use workflow";
  const writable = getWritable<UIMessageChunk>();

  const agent = new DurableAgent({
    model: getModel(modelId),
    instructions:
      "You are a helpful and friendly AI assistant. You can provide weather information using your tools.",
    tools: {
      getWeather: {
        description: "Get the current weather for a city",
        inputSchema: z.object({
          city: z.string().describe("The name of the city"),
        }),
        execute: getWeather,
      },
    },
  });

  const result = await agent.stream({
    messages,
    writable,
    maxSteps: 10,
  });

  return { messages: result.messages };
}
