"use client";

import { useState, useMemo } from "react";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnalysisResults, Message } from "@/types/analysis";
import { generateAIResponse } from "@/lib/chat-utils";

interface ChatInterfaceProps {
  analysisResults: string;
}

export function ChatInterface({ analysisResults }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await generateAIResponse(input, analysisResults, 'chat');
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <pre className="whitespace-pre-wrap break-words font-sans">
                  {message.content}
                </pre>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                入力中...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="メッセージを入力..."
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}