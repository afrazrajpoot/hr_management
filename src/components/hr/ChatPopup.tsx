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
import { Loader2, Send, X, Trash2 } from "lucide-react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
    // Split content into paragraphs and format
    const paragraphs = content.split("\n\n").filter((p) => p.trim());

    return paragraphs.map((paragraph, index) => {
      // Check if it's a list item
      if (paragraph.includes("•") || /^\d+\./.test(paragraph.trim())) {
        const items = paragraph.split("\n").filter((item) => item.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-1 my-2">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-sm leading-relaxed">
                {item.replace(/^[•\d+\.\-\*]\s*/, "")}
              </li>
            ))}
          </ul>
        );
      }

      // Check if it's a heading (starts with #, ##, etc.)
      if (paragraph.startsWith("#")) {
        const level = paragraph.match(/^#+/)?.[0].length || 1;
        const text = paragraph.replace(/^#+\s*/, "");
        const HeadingTag = `h${Math.min(
          level + 2,
          6
        )}` as keyof JSX.IntrinsicElements;

        return (
          <HeadingTag key={index} className="font-semibold text-sm my-2">
            {text}
          </HeadingTag>
        );
      }

      // Check if it contains bold text (**text**)
      if (paragraph.includes("**")) {
        const parts = paragraph.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="text-sm leading-relaxed my-2">
            {parts.map((part, partIndex) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={partIndex}>{part.slice(2, -2)}</strong>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </p>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="text-sm leading-relaxed my-2">
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

      const response = await fetch("https://13.89.121.86/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

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
        `https://13.89.121.86/api/chat/${hrId}/${encodeURIComponent(
          department.department
        )}`,
        {
          method: "DELETE",
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
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              AI Assistant - {department?.department} Department
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={clearChat}
                title="Clear conversation"
                className="hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ maxHeight: "calc(85vh - 160px)" }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-lg shadow-sm ${message.role === "user"
                  ? "rounded-br-sm"
                  : "rounded-bl-sm border"
                  }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center mb-2 pb-2 border-b">
                    <div className="w-2 h-2 rounded-full mr-2"></div>
                    <span className="text-xs font-medium">AI Assistant</span>
                  </div>
                )}

                <div>
                  {message.role === "assistant" ? (
                    formatMessageContent(message.content)
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>

                {message.timestamp && (
                  <div className="text-xs mt-2">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {currentStream && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-lg rounded-bl-sm border max-w-[75%] shadow-sm">
                <div className="flex items-center mb-2 pb-2 border-b">
                  <div className="w-2 h-2 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs font-medium">
                    AI Assistant (typing...)
                  </span>
                </div>
                <div>{formatMessageContent(currentStream)}</div>
              </div>
            </div>
          )}

          {isLoading && !currentStream && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-lg rounded-bl-sm border flex items-center shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Analyzing your request...</span>
              </div>
            </div>
          )}

          {/* Invisible element for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about retention strategies, performance metrics, or departmental insights..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
