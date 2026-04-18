"use client";

import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageToolbar,
  MessageAction,
} from "@/components/ai-elements/message";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { SpeechInput } from "@/components/ai-elements/speech-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
  type ToolPart,
} from "@/components/ai-elements/tool";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@ai-sdk/react";
import { WorkflowChatTransport } from "@workflow/ai";
import { isToolUIPart, type UIMessage } from "ai";
import {
  CheckIcon,
  RefreshCwIcon,
  SquareIcon,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// constants
// ---------------------------------------------------------------------------

const suggestions = [
  "What are the latest trends in AI?",
  "How does machine learning work?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "How to optimize database queries?",
  "What is the difference between SQL and NoSQL?",
  "Explain cloud computing basics",
];

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Render all parts of a UIMessage: text, reasoning, tool calls, and sources. */
const MessageParts = ({
  message,
  isStreaming,
}: {
  message: UIMessage;
  isStreaming: boolean;
}) => {
  const isAssistantMessage = message.role === "assistant";

  // Collect source-url parts for the Sources panel
  const sourceParts = message.parts.filter(
    (p) => p.type === "source-url"
  ) as Array<{ type: "source-url"; sourceId: string; url: string; title?: string }>;

  return (
    <>
      {message.parts.map((part, i) => {
        // ── text ──────────────────────────────────────────────────────────
        if (part.type === "text") {
          return (
            <MessageContent key={`text-${i}`}>
              <MessageResponse isAnimating={isStreaming && isAssistantMessage}>
                {part.text}
              </MessageResponse>
            </MessageContent>
          );
        }

        // ── reasoning ──────────────────────────────────────────────────────
        if (part.type === "reasoning") {
          return (
            <Reasoning
              isStreaming={isStreaming && part.state === "streaming"}
              key={`reasoning-${i}`}
            >
              <ReasoningTrigger />
              <ReasoningContent>{part.text}</ReasoningContent>
            </Reasoning>
          );
        }

        // ── tool-call / dynamic-tool ────────────────────────────────────
        if (isToolUIPart(part)) {
          const toolPart = part as unknown as ToolPart;
          return (
            <Tool key={`tool-${i}`}>
              {/* @ts-ignore */}
              <ToolHeader
                state={toolPart.state}
                type={toolPart.type as ToolPart["type"]}
                {...(toolPart.type === "dynamic-tool"
                  ? { toolName: (toolPart as { toolName: string }).toolName }
                  : {})}
              />
              <ToolContent>
                <ToolInput input={toolPart.input} />
                <ToolOutput
                  errorText={toolPart.errorText}
                  output={toolPart.output}
                />
              </ToolContent>
            </Tool>
          );
        }

        // skip source-url parts here; rendered in the Sources panel below
        return null;
      })}

      {/* Sources panel – shown if the message has source citations */}
      {sourceParts.length > 0 && (
        <Sources>
          <SourcesTrigger count={sourceParts.length} />
          <SourcesContent>
            {sourceParts.map((s) => (
              <Source href={s.url} key={s.sourceId} title={s.title ?? s.url} />
            ))}
          </SourcesContent>
        </Sources>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// sub-components
// ---------------------------------------------------------------------------

const AttachmentItem = ({
  attachment,
  onRemove,
}: {
  attachment: { id: string; name: string; type: string; url: string };
  onRemove: (id: string) => void;
}) => {
  const handleRemove = useCallback(() => {
    onRemove(attachment.id);
  }, [onRemove, attachment.id]);

  return (
    // @ts-ignore
    <Attachment data={attachment} onRemove={handleRemove}>
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  );
};

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();

  const handleRemove = useCallback(
    (id: string) => {
      attachments.remove(id);
    },
    [attachments]
  );

  if (attachments.files.length === 0) return null;

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <AttachmentItem
          // @ts-ignore
          attachment={attachment}
          key={attachment.id}
          onRemove={handleRemove}
        />
      ))}
    </Attachments>
  );
};

const SuggestionItem = ({
  suggestion,
  onClick,
}: {
  suggestion: string;
  onClick: (suggestion: string) => void;
}) => {
  const handleClick = useCallback(() => {
    onClick(suggestion);
  }, [onClick, suggestion]);

  return <Suggestion onClick={handleClick} suggestion={suggestion} />;
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ChatInterface = () => {
  const [input, setInput] = useState("");

  const {
    messages,
    sendMessage,
    regenerate,
    status,
    stop,
    error,
    clearError,
  } = useChat({
    transport: new WorkflowChatTransport({
      api: "/api/chat",
    }),
  });

  // ---- handlers ----

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const isStreaming = status === "submitted" || status === "streaming";

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const text = message.text || input;
      const hasText = Boolean(text.trim());
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) return;

      if (message.files?.length) {
        toast.success("Files attached", {
          description: `${message.files.length} file(s) attached to message`,
        });
      }

      sendMessage({ text });
      setInput("");
    },
    [input, sendMessage]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      sendMessage({ text: suggestion });
    },
    [sendMessage]
  );

  const handleTranscriptionChange = useCallback((transcript: string) => {
    setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, []);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleRegenerate = useCallback(() => {
    regenerate();
  }, [regenerate]);

  const isSubmitDisabled = useMemo(
    () => !input.trim() && !isStreaming,
    [input, isStreaming]
  );

  return (
    <div className="flex h-screen w-full flex-col divide-y bg-background">
      {/* ── UPPER half: message history ─────────────────────────────────── */}
      <div className=" h-full w-full overflow-hidden">
        <ScrollArea className="h-full">
          <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
            {/* Empty state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <div className="text-5xl">🤖</div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  How can I help you today?
                </h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Ask me anything — I can help you with your tasks.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => {
              const isAssistant = message.role === "assistant";

              return (
                <Message
                  from={message.role === "user" ? "user" : "assistant"}
                  key={message.id}
                >
                  <MessageParts
                    isStreaming={isStreaming && isAssistant}
                    message={message}
                  />

                  {isAssistant && (
                    <MessageToolbar>
                      <div />
                      <div className="flex items-center gap-1">
                        <MessageAction
                          disabled={isStreaming}
                          label="Regenerate"
                          onClick={handleRegenerate}
                          tooltip="Regenerate response"
                        >
                          <RefreshCwIcon size={14} />
                        </MessageAction>
                      </div>
                    </MessageToolbar>
                  )}
                </Message>
              );
            })}

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <span className="flex-1">{error.message}</span>
                <button
                  className="shrink-0 font-medium underline-offset-2 hover:underline"
                  onClick={clearError}
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ── LOWER half: prompt input ────────────────────────────────────── */}
      <div className=" h-fit w-full overflow-hidden p-2 ">
        {/* Prompt input box */}
        <div className="relative pb-10 max-w-4xl mx-auto">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>

            <PromptInputBody>
              <PromptInputTextarea
                className="min-h-[120px] text-lg"
                onChange={handleInputChange}
                placeholder="Message the assistant…"
                value={input}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <div className="flex-1" />
              <PromptInputSubmit
                disabled={isSubmitDisabled}
                onStop={handleStop}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
