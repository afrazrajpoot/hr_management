"use client";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, X, Trash2, Bot, User, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

interface ChatMessage {
  role: string;
  content: string;
  timestamp?: string;
}

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  department: any;
  hrId: string;
  dashboardData: any[];
  messages: ChatMessage[];
  onMessagesUpdate: (department: string, messages: ChatMessage[]) => void;
}

export default function ChatPopup({
  isOpen,
  onClose,
  department,
  dashboardData,
  hrId,
  messages,
  onMessagesUpdate,
}: ChatPopupProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStream, setCurrentStream] = useState("");
  const [isFetchingConversation, setIsFetchingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    // Only fetch if dialog is open and we have required data
    if (isOpen && hrId && department?.department) {
      let isMounted = true;

      const fetchConversation = async () => {
        setIsFetchingConversation(true);
        try {
          const response = await fetch(
            `/api/get-conversation?department=${encodeURIComponent(
              department.department
            )}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.user?.fastApiToken}`,
              },
            }
          );

          if (!isMounted) return;

          const result = await response.json();
          if (response.ok && result.data) {
            const fetchedMessages: ChatMessage[] = result.data.messages || [];
            onMessagesUpdate(department.department, fetchedMessages);
          } else {
            console.error(result.error || "Failed to fetch conversation");
            const welcomeMessage: ChatMessage = {
              role: "assistant",
              content: `Hello! I'm your AI assistant for the ${department.department} department. I'm here to help you analyze data, provide insights, and answer questions about employee retention, performance metrics, and strategic recommendations.\n\nHow may I assist you today?`,
              timestamp: new Date().toISOString(),
            };
            onMessagesUpdate(department.department, [welcomeMessage]);
          }
        } catch (error) {
          if (!isMounted) return;
          console.error("Error fetching conversation:", error);
          const errorMessage: ChatMessage = {
            role: "assistant",
            content: "Failed to load conversation history. Please try again.",
            timestamp: new Date().toISOString(),
          };
          onMessagesUpdate(department.department, [errorMessage]);
        } finally {
          if (isMounted) {
            setIsFetchingConversation(false);
          }
        }
      };

      fetchConversation();

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, hrId, department?.department]);

  // Auto-scroll to bottom when messages change or streaming updates
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStream]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Format message content for professional display
  const formatMessageContent = (content: string) => {
    const paragraphs = content.split("\n\n").filter((p) => p.trim());
    return paragraphs.map((paragraph, index) => {
      if (paragraph.includes("•") || /^\d+\./.test(paragraph.trim())) {
        const items = paragraph.split("\n").filter((item) => item.trim());
        return (
          <ul
            key={index}
            className="list-disc list-inside space-y-1.5 my-3 pl-4"
          >
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-sm leading-relaxed">
                {item.replace(/^[•\d+\.\-\*]\s*/, "")}
              </li>
            ))}
          </ul>
        );
      }
      if (paragraph.startsWith("#")) {
        const level = paragraph.match(/^#+/)?.[0].length || 1;
        const text = paragraph.replace(/^#+\s*/, "");
        const HeadingTag = `h${Math.min(
          level + 2,
          6
        )}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={index} className="font-semibold text-sm my-3">
            {text}
          </HeadingTag>
        );
      }
      if (paragraph.includes("**")) {
        const parts = paragraph.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="text-sm leading-relaxed my-3">
            {parts.map((part, partIndex) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={partIndex} className="font-semibold">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </p>
        );
      }
      return (
        <p key={index} className="text-sm leading-relaxed my-3">
          {paragraph}
        </p>
      );
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !hrId || !department?.department) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    const newMessages = [...messages, userMessage];
    onMessagesUpdate(department.department, newMessages);

    setInput("");
    setIsLoading(true);
    setCurrentStream("");

    try {
      const payload = {
        hr_id: hrId,
        department: department.department,
        message: input,
        dashboard_data: dashboardData,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.fastApiToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          accumulatedResponse += chunk;
          setCurrentStream(accumulatedResponse);
        }

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: accumulatedResponse,
          timestamp: new Date().toISOString(),
        };
        onMessagesUpdate(department.department, [
          ...newMessages,
          assistantMessage,
        ]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      onMessagesUpdate(department.department, [...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setCurrentStream("");
    }
  };

  const clearChat = async () => {
    try {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/chat/${hrId}/${encodeURIComponent(department.department)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.fastApiToken}`,
          },
        }
      );

      const welcomeMessage: ChatMessage = {
        role: "assistant",
        content: `Hello! I'm your AI assistant for the ${department.department} department. I'm here to help you analyze data, provide insights, and answer questions about employee retention, performance metrics, and strategic recommendations.\n\nHow may I assist you today?`,
        timestamp: new Date().toISOString(),
      };
      onMessagesUpdate(department.department, [welcomeMessage]);
    } catch (error) {
      console.error("Failed to clear chat");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 flex flex-col overflow-hidden bg-background text-foreground border-border rounded-2xl shadow-xl">
        {/* Compact Header */}
        <div className=" text-primary-foreground px-6 py-4  bg-gradient-to-r from-primary to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/10 rounded-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {department?.department} AI Assistant
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-primary-foreground/15 rounded-full">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                    <span className="text-xs">Online</span>
                  </div>
                  <span className="text-xs opacity-80">
                    • Ready to analyze department data
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                title="Clear conversation"
                className="h-8 w-8 hover:bg-primary-foreground/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                title="Close"
                className="h-8 w-8 hover:bg-primary-foreground/20"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Prominent Chat Messages Area - Much larger */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 card-primary card-hover border-0 shadow-lg group"
          style={{ maxHeight: "calc(90vh - 160px)" }}
        >
          {isFetchingConversation ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
                <Bot className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm text-muted-foreground">
                Loading conversation...
              </p>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 text-center px-4">
                  <div className="p-5 bg-primary/5 rounded-2xl">
                    <Sparkles className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">
                      Welcome to {department?.department} AI Assistant
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      I can help you analyze retention rates, performance
                      metrics, and provide strategic recommendations for your
                      department.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                    <div
                      className="text-left p-4 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() =>
                        setInput("Analyze current retention rates")
                      }
                    >
                      <div className="font-medium text-sm mb-1">
                        Retention Analysis
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Get insights on employee retention
                      </div>
                    </div>
                    <div
                      className="text-left p-4 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                      onClick={() => setInput("Show performance metrics")}
                    >
                      <div className="font-medium text-sm mb-1">
                        Performance Metrics
                      </div>
                      <div className="text-xs text-muted-foreground">
                        View key performance indicators
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`relative max-w-[80%] rounded-2xl p-4 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border text-card-foreground"
                        }`}
                      >
                        {/* Message header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold opacity-90">
                            {message.role === "user" ? "You" : "AI Assistant"}
                          </span>
                          {message.timestamp && (
                            <span
                              className={`text-xs opacity-70 ${
                                message.role === "user"
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          )}
                        </div>

                        {/* Message content */}
                        <div>
                          {message.role === "assistant" ? (
                            formatMessageContent(message.content)
                          ) : (
                            <p className="leading-relaxed">{message.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {currentStream && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="relative max-w-[80%] rounded-2xl p-4 bg-card border border-border text-card-foreground">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold opacity-90">
                            AI Assistant
                          </span>
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-150"></div>
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-300"></div>
                          </div>
                        </div>
                        <div>{formatMessageContent(currentStream)}</div>
                      </div>
                    </div>
                  )}

                  {isLoading && !currentStream && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="relative max-w-[80%] rounded-2xl p-4 bg-card border border-border text-card-foreground">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm font-medium">
                            Processing your query...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Compact */}
        <div className="p-4 border-t border-border card-primary card-hover border-0 shadow-lg group">
          <div className="relative">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about retention strategies, performance metrics, or departmental insights..."
              disabled={isLoading || isFetchingConversation}
              className="pl-4 pr-28 py-5 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
            />

            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim() || isFetchingConversation}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center mt-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setInput("Analyze retention trends")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Retention
              </button>
              <button
                type="button"
                onClick={() => setInput("Show performance metrics")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Performance
              </button>
              <button
                type="button"
                onClick={() => setInput("Provide strategic recommendations")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Strategy
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
