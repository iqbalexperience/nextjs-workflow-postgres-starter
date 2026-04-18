import ChatInterface from "@/components/chat-interface";
import { ModeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <ChatInterface />
    </main>
  );
}

