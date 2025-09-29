"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import { useSession } from "next-auth/react";

interface Message {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history when component mounts or session changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/chat/${session.user.id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const chatHistory = await response.json();
        // Sort by createdAt to ensure chronological order
        const sortedHistory = [...chatHistory].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Transform into a paired message structure
        const formattedMessages: Message[] = [];
        sortedHistory.forEach((chat) => {
          // Add user message
          if (chat.message) {
            formattedMessages.push({
              role: "user",
              content: chat.message,
            });
          }
          // Add assistant response if it exists in the same record
          if (chat.response) {
            formattedMessages.push({
              role: "assistant",
              content: chat.response,
            });
          }
        });

        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();
  }, [session?.user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const newMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        isStreaming: true,
      },
    ]);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: session?.user.id,
          message: input,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        accumulatedContent += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === "assistant") {
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              content: accumulatedContent,
              isStreaming: true,
            };
          }
          return newMessages;
        });
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "assistant") {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            isStreaming: false,
          };
        }
        return newMessages;
      });
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "assistant") {
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content:
              "Error: Failed to connect to the server. Please try again.",
            isStreaming: false,
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AppLayout>
      <div className="h-full w-full p-6">
        <div className="h-full max-w-6xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-4 px-2">
            <div className="p-3 bg-primary rounded-xl shadow-md">
              <Bot className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                HR Assistant
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ask me anything about HR policies and procedures
              </p>
            </div>
          </div>

          {/* Chat Container */}
          <Card className="flex-1 flex flex-col min-h-0 shadow-lg">
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-6 space-y-4">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="p-5 bg-primary/5 rounded-full mb-5">
                        <Bot className="h-16 w-16 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Welcome to HR Assistant
                      </h3>
                      <p className="text-muted-foreground max-w-md text-sm">
                        Start a conversation by typing a message below. I'm here
                        to help with your HR questions!
                      </p>
                    </div>
                  )}

                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 items-start ${
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                          msg.role === "user" ? "bg-primary" : "bg-muted border"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <Bot className="h-5 w-5 text-foreground" />
                        )}
                      </div>

                      <div
                        className={`flex-1 max-w-[75%] rounded-2xl px-5 py-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words leading-relaxed">
                          {msg.content}
                          {msg.isStreaming && (
                            <span className="ml-1 inline-block h-2 w-2 animate-pulse bg-current rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-6">
                <div className="flex gap-3 items-end">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    disabled={isLoading}
                    className="flex-1 min-h-[48px] text-base rounded-xl resize-none"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    size="lg"
                    className="h-12 w-12 p-0 rounded-xl shrink-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
