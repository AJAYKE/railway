import { Message } from "@/types/discord";
import { MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No messages yet. Waiting for Discord activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border bg-white space-y-4 h-[50vh] sm:h-[80vh] md:h-[70vh] overflow-y-auto"
    >
      {messages.map((message, index) => (
        <MessageItem key={`${message.id}-${index}`} message={message} />
      ))}
    </div>
  );
}
