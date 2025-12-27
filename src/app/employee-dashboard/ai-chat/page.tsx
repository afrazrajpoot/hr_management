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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Please subscribe to access the AI assistant.",
    },
  ]);
  const [input, setInput] = useState("");
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat history when component mounts or session changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!session?.user?.id || session?.user?.paid == false) return;

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

  return (
    <AppLayout>
      <div className="h-full w-full p-6 gradient-bg-primary">
        <div className="h-full max-w-6xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-4 px-2">
            <div className="ai-recommendation-icon-wrapper">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold gradient-text-primary">
                  Genius Factor AI
                </h1>
                {session?.user?.paid == true && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-warning to-warning/80 text-primary-foreground text-xs font-semibold rounded-full">
                    <Crown className="h-3 w-3" />
                    PRO
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Ask me anything about any policies and procedures
              </p>
            </div>
            {session?.user?.paid == false && (
              <Link
                href="https://www.skool.com/geniusfactoracademy/about?ref=9991102cdf9d4b378471534355a57fce"
                className=""
              >
                <Button className="btn-gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </Link>
            )}
          </div>

          {/* Chat Container */}
          <Card className="flex-1 flex flex-col min-h-0 card-primary border border-input">
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
                <div className="p-6 space-y-6">
                  {messages.length === 0 && session?.user?.paid == true && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="ai-recommendation-card">
                        <div className="p-4 ai-recommendation-icon-wrapper">
                          <Bot className="h-20 w-20 text-primary-foreground" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-card-foreground mb-3">
                        Welcome to Genius Factor AI Assistant
                      </h3>
                      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                        Start a conversation by typing a message below. I'm here
                        to help with your HR questions!
                      </p>
                      <div className="flex flex-wrap gap-3 mt-6 justify-center">
                        <span className="px-3 py-1.5 badge-blue">Policies</span>
                        <span className="px-3 py-1.5 badge-green">
                          Procedures
                        </span>
                        <span className="px-3 py-1.5 badge-purple">
                          HR Guidelines
                        </span>
                        <span className="px-3 py-1.5 badge-amber">
                          Compliance
                        </span>
                      </div>
                    </div>
                  )}

                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-4 items-start animate-fadeIn ${
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-primary to-accent"
                            : "bg-gradient-to-br from-muted to-secondary border"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <Bot className="h-5 w-5 text-card-foreground" />
                        )}
                      </div>

                      <div
                        className={`flex-1 max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                            : "bg-gradient-to-br from-card to-secondary border border-input"
                        } ${msg.isStreaming ? "animate-pulse-subtle" : ""}`}
                      >
                        <div className="whitespace-pre-wrap break-words leading-relaxed">
                          {msg.content}
                          {msg.isStreaming && (
                            <span className="ml-1 inline-flex items-center gap-1">
                              <span className="h-2 w-2 bg-current rounded-full animate-bounce" />
                              <span
                                className="h-2 w-2 bg-current rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                              <span
                                className="h-2 w-2 bg-current rounded-full animate-bounce"
                                style={{ animationDelay: "0.4s" }}
                              />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t border-input bg-gradient-to-b from-card to-secondary p-6">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        session?.user?.paid == false
                          ? "Subscribe to start chatting..."
                          : "Type your message here..."
                      }
                      disabled={isLoading || session?.user?.paid == false}
                      className="flex-1 min-h-[52px] text-base rounded-xl resize-none pl-4 pr-12 border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 bg-card shadow-sm"
                    />
                    {session?.user?.paid == false && (
                      <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                    className="h-14 w-14 p-0 rounded-xl shrink-0 btn-gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-6 w-6" />
                    )}
                  </Button>
                </div>

                {/* Status Messages */}
                <div className="mt-3 space-y-2">
                  {session?.user?.paid == false && (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-warning/10 rounded-lg border border-warning/20">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <p className="text-sm text-warning">
                        ⚠️ Please subscribe to access the AI assistant.
                      </p>
                    </div>
                  )}
                  {session?.user?.paid == true &&
                    !session?.user?.fastApiToken && (
                      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 rounded-lg border border-destructive/20">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <p className="text-sm text-destructive">
                          ⚠️ Authentication token missing. Please log in again.
                        </p>
                      </div>
                    )}

                  {/* Quick Prompts */}
                  {session?.user?.paid == true && (
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setInput("What are the company's leave policies?")
                        }
                        className="text-xs border-input text-secondary-foreground hover:bg-secondary"
                      >
                        Leave Policies
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setInput("Explain the performance review process")
                        }
                        className="text-xs border-input text-secondary-foreground hover:bg-secondary"
                      >
                        Performance Reviews
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setInput("What is the remote work policy?")
                        }
                        className="text-xs border-input text-secondary-foreground hover:bg-secondary"
                      >
                        Remote Work
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
            <div className="flex items-center gap-3 p-4 card-primary card-hover">
              <div className="icon-wrapper-blue">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {messages.filter((m) => m.role === "assistant").length}
                </div>
                <div className="text-sm text-primary/80">AI Responses</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 card-primary card-hover">
              <div className="icon-wrapper-green">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">
                  {session?.user?.paid ? "PRO" : "FREE"}
                </div>
                <div className="text-sm text-accent/80">Subscription Plan</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 card-primary card-hover">
              <div className="icon-wrapper-purple">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">v1.0</div>
                <div className="text-sm text-accent/80">
                  AI Assistant Version
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
