import { Message } from "@/types/discord";
import { useCallback, useEffect, useState } from "react";

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((message: Message) => {
    setMessages((prevMessages) => {
      if (prevMessages.some((msg) => msg.id === message.id)) {
        return prevMessages;
      }

      const newMessages = [...prevMessages, message];
      return newMessages.slice(-100);
    });
  }, []);

  const loadInitialMessages = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages?limit=50`
      );
      if (response.ok) {
        const initialMessages = await response.json();
        setMessages(initialMessages.reverse());
      }
    } catch (error) {
      console.error("Failed to load initial messages:", error);
    }
  }, []);

  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);

  return { messages, addMessage, loadInitialMessages };
}
