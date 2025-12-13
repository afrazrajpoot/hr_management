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

      const response = await fetch(`http://127.0.0.1:8000/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          user_id: session?.user.id,
          message: input,
        }),
      });

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
      <div className="h-full w-full p-6 bg-gradient-to-b from-indigo-50/30 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/10">
        <div className="h-full max-w-6xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-4 px-2">
            <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Genius Factor AI
                </h1>
                {session?.user?.paid == true && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full">
                    <Crown className="h-3 w-3" />
                    PRO
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Ask me anything about any policies and procedures
              </p>
            </div>
            {session?.user?.paid == false && (
              <Button
                onClick={() => (window.location.href = "/pricing")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}
          </div>

          {/* Chat Container */}
          <Card className="flex-1 flex flex-col min-h-0 shadow-xl border border-indigo-100 dark:border-gray-700 bg-gradient-to-b from-white to-indigo-50/20 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
                <div className="p-6 space-y-6">
                  {messages.length === 0 && session?.user?.paid == true && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-3xl mb-6">
                        <div className="p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl">
                          <Bot className="h-20 w-20 text-white" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Welcome to Genius Factor AI Assistant
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md text-sm leading-relaxed">
                        Start a conversation by typing a message below. I'm here
                        to help with your HR questions!
                      </p>
                      <div className="flex flex-wrap gap-3 mt-6 justify-center">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800">
                          Policies
                        </span>
                        <span className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 text-xs font-medium rounded-full border border-green-200 dark:border-green-800">
                          Procedures
                        </span>
                        <span className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full border border-purple-200 dark:border-purple-800">
                          HR Guidelines
                        </span>
                        <span className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full border border-amber-200 dark:border-amber-800">
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
                            ? "bg-gradient-to-br from-indigo-500 to-purple-500"
                            : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-5 w-5 text-white" />
                        ) : (
                          <Bot className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        )}
                      </div>

                      <div
                        className={`flex-1 max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                            : "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700"
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
              <div className="border-t border-indigo-100 dark:border-gray-700 bg-gradient-to-b from-white to-indigo-50/30 dark:from-gray-800 dark:to-gray-900 p-6">
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
                      className="flex-1 min-h-[52px] text-base rounded-xl resize-none pl-4 pr-12 border-2 border-indigo-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 bg-white dark:bg-gray-800 shadow-sm"
                    />
                    {session?.user?.paid == false && (
                      <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                    className="h-14 w-14 p-0 rounded-xl shrink-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-6 w-6" />
                    )}
                  </Button>
                </div>

                {/* Status Messages */}
                <div className="mt-3 space-y-2">
                  {session?.user?.paid == false && (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        ⚠️ Please subscribe to access the AI assistant.
                      </p>
                    </div>
                  )}
                  {session?.user?.paid == true &&
                    !session?.user?.fastApiToken && (
                      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <p className="text-sm text-red-700 dark:text-red-300">
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
                        className="text-xs border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                      >
                        Leave Policies
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setInput("Explain the performance review process")
                        }
                        className="text-xs border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                      >
                        Performance Reviews
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setInput("What is the remote work policy?")
                        }
                        className="text-xs border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/30"
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
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800/30 dark:to-indigo-800/30 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {messages.filter((m) => m.role === "assistant").length}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 opacity-80">
                  AI Responses
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800/30 dark:to-emerald-800/30 rounded-lg">
                <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {session?.user?.paid ? "PRO" : "FREE"}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 opacity-80">
                  Subscription Plan
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800/30 dark:to-pink-800/30 rounded-lg">
                <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  v1.0
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400 opacity-80">
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
