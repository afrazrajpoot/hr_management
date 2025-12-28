"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Crown,
  AlertCircle,
  Lock,
} from "lucide-react";
import { AppLayout } from "@/components/employee/layout/AppLayout";
import { useSession } from "next-auth/react";
import Link from "next/link";

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
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history when component mounts or session changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!session?.user?.id) {
        setIsLoadingHistory(false);
        // Show subscription message for non-paid users
        if (session?.user?.paid == false) {
          setMessages([
            {
              role: "assistant",
              content: "Please subscribe to access the AI assistant.",
            },
          ]);
        }
        return;
      }

      if (session?.user?.paid == false) {
        setIsLoadingHistory(false);
        setMessages([
          {
            role: "assistant",
            content: "Please subscribe to access the AI assistant.",
          },
        ]);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Add FastAPI token to headers if available
        if (session.user.fastApiToken) {
          headers["Authorization"] = `Bearer ${session.user.fastApiToken}`;
        }

        const response = await fetch(
          `https://api.geniusfactor.ai/chat/${session.user.id}`,
          {
            method: "GET",
            headers,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const chatHistory = await response.json();
        
        // If no chat history, keep messages empty
        if (!chatHistory || chatHistory.length === 0) {
          setMessages([]);
          setIsLoadingHistory(false);
          return;
        }

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
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, [session?.user?.id, session?.user?.paid, session?.user?.fastApiToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    // Check if user is paid before allowing message sending
    if (session?.user?.paid == false) {
      setInput("");
      setMessages([
        {
          role: "assistant",
          content:
            "This feature requires a subscription. Please subscribe to access the AI assistant.",
        },
      ]);
      return;
    }

    // Check if FastAPI token is available
    if (!session?.user?.fastApiToken) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Authentication error: No API token found. Please log in again.",
        },
      ]);
      return;
    }

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
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.fastApiToken}`,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PYTHON_URL}/chat`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            user_id: session?.user.id,
            message: input,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Invalid or expired token");
        }
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

      let errorMessage =
        "Error: Failed to connect to the server. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("Unauthorized")) {
          errorMessage =
            "Authentication error: Your session has expired. Please log in again.";
        }
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "assistant") {
          newMessages[newMessages.length - 1] = {
            role: "assistant",
            content: errorMessage,
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

  // Check if there are real conversation messages (user has sent at least one message)
  const hasUserMessages = messages.some(msg => msg.role === "user");
  const showCenteredView = session?.user?.paid == true && !hasUserMessages;

  return (
    <AppLayout>
      <div className="h-full w-full gradient-bg-primary flex flex-col">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 border-b border-input bg-card/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="ai-recommendation-icon-wrapper">
                  <Bot className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold gradient-text-primary">
                      Genius Factor AI
                    </h1>
                    {session?.user?.paid == true && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-warning to-warning/80 text-primary-foreground text-xs font-semibold rounded-full">
                        <Crown className="h-3 w-3" />
                        PRO
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {session?.user?.paid == false && (
                <Link
                  href="https://www.skool.com/geniusfactoracademy/about?ref=9991102cdf9d4b378471534355a57fce"
                >
                  <Button className="btn-gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 text-sm h-9">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Chat Container - Flexible */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {showCenteredView ? (
            /* Centered Welcome Screen with Input */
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="max-w-3xl w-full space-y-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="ai-recommendation-card">
                      <div className="p-6 ai-recommendation-icon-wrapper">
                        <Bot className="h-16 w-16 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-card-foreground mb-2">
                      How can I help you today?
                    </h2>
                    <p className="text-muted-foreground text-base">
                      Ask me anything about policies, procedures, and HR guidelines
                    </p>
                  </div>
                </div>
                
                {/* Centered Input */}
                <div className="max-w-2xl mx-auto">
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Message Genius Factor AI..."
                        disabled={isLoading || session?.user?.paid == false}
                        className="w-full min-h-[56px] text-base rounded-2xl resize-none pl-5 pr-14 border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card shadow-lg"
                        autoFocus
                      />
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={
                        isLoading ||
                        !input.trim() ||
                        session?.user?.paid == false ||
                        !session?.user?.fastApiToken
                      }
                      size="lg"
                      className="h-[56px] w-[56px] p-0 rounded-2xl shrink-0 btn-gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Messages View */}
              <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
                <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                  {isLoadingHistory ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">Loading chat history...</div>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 items-start ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary border border-input">
                          <Bot className="h-4 w-4 text-card-foreground" />
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-br-sm"
                            : "bg-card border border-input rounded-bl-sm"
                        } ${msg.isStreaming ? "animate-pulse-subtle" : ""}`}
                      >
                        <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                          {msg.content}
                          {msg.isStreaming && (
                            <span className="ml-1 inline-flex items-center gap-1">
                              <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" />
                              <span
                                className="h-1.5 w-1.5 bg-current rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                              <span
                                className="h-1.5 w-1.5 bg-current rounded-full animate-bounce"
                                style={{ animationDelay: "0.4s" }}
                              />
                            </span>
                          )}
                        </div>
                      </div>

                      {msg.role === "user" && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area - Fixed at bottom */}
              <div className="flex-shrink-0 border-t border-input bg-card/50 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                  {/* Status Messages */}
                  {session?.user?.paid == false && (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-warning/10 rounded-lg border border-warning/20 mb-3">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <p className="text-sm text-warning">
                        ⚠️ Please subscribe to access the AI assistant.
                      </p>
                    </div>
                  )}
                  {session?.user?.paid == true && !session?.user?.fastApiToken && (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 rounded-lg border border-destructive/20 mb-3">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <p className="text-sm text-destructive">
                        ⚠️ Authentication token missing. Please log in again.
                      </p>
                    </div>
                  )}

                  {/* Input Container */}
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                          session?.user?.paid == false
                            ? "Subscribe to start chatting..."
                            : "Message Genius Factor AI..."
                        }
                        disabled={isLoading || session?.user?.paid == false}
                        className="w-full min-h-[52px] text-base rounded-2xl resize-none pl-5 pr-14 border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card shadow-sm"
                      />
                      {session?.user?.paid == false && (
                        <Lock className="absolute right-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={
                        isLoading ||
                        !input.trim() ||
                        session?.user?.paid == false ||
                        !session?.user?.fastApiToken
                      }
                      size="lg"
                      className="h-[52px] w-[52px] p-0 rounded-2xl shrink-0 btn-gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
