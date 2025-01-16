"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnalysisResults, Message } from "@/types/analysis";
import { createOrGetChatHistory, saveChatMessage, ChatHistory } from "@/lib/chat-utils";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ChatInterfaceProps {
  analysisResults: AnalysisResults;
  imageData: string | null | undefined;
  analysisId: string | null;
}

export function ChatInterface({
  analysisResults,
  imageData,
  analysisId,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      if (!analysisId) return;

      try {
        const history = await createOrGetChatHistory(analysisId);
        if (!history) {
          console.error('Failed to create/get chat history');
          return;
        }

        setChatHistory(history);
        
        // 過去のメッセージを読み込む
        const { data: messages } = await supabaseClient
          .from('chat_messages')
          .select('*')
          .eq('chat_history_id', history.id)
          .order('created_at', { ascending: true });
          
        if (messages) {
          const formattedMessages: Message[] = messages.map(msg => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: new Date(msg.created_at).getTime()
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };
    
    initChat();
  }, [analysisId]);

  const scrollToBottom = () => {
    const scrollArea = messagesEndRef.current?.closest('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!chatHistory || chatHistory.messageCount >= 5) {
      toast({
        title: "チャット制限",
        description: "この分析のチャット回数制限に達しました",
        variant: "destructive"
      });
      return;
    }

    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("message", input);
      formData.append(
        "analysisData",
        JSON.stringify({
          ...analysisResults,
          image_url: analysisResults.imageUrl,
        })
      );
      formData.append(
        "chatHistory",
        JSON.stringify(messages)
      );

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // メッセージを保存
      await saveChatMessage(chatHistory.id, userMessage);
      await saveChatMessage(chatHistory.id, aiMessage);
    } catch (error) {
      console.error("詳細なエラー情報:", error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error: any) => {
    console.error("チャットエラー:", error);
    // エラーメッセージをユーザーに表示
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <ScrollArea className="flex-1 p-4 h-[500px]">
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
          <div ref={messagesEndRef} />
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">入力中...</div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
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
