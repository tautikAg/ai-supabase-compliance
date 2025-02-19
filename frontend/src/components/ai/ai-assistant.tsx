'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { APIService } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Lightbulb, Send } from 'lucide-react';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await APIService.getAIAssistance(query);
      const assistantMessage: Message = {
        type: 'assistant',
        content: response.content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get AI assistance',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (query: string) => {
    setQuery(query);
  };

  const exampleQueries = [
    "How can I improve my Supabase security configuration?",
    "What are the best practices for implementing MFA?",
    "Explain how to set up RLS policies effectively",
    "Guide me through PITR configuration",
  ];

  return (
    <div className="flex flex-col space-y-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about Supabase compliance and security
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Example queries */}
          {messages.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {exampleQueries.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="justify-start text-left h-auto py-2"
                  onClick={() => handleExampleClick(q)}
                >
                  <Lightbulb className="h-4 w-4 mr-2 shrink-0" />
                  <span className="line-clamp-2">{q}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Messages area */}
          <ScrollArea className="h-[500px] pr-4 mb-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    {message.type === 'assistant' ? (
                      <ReactMarkdown 
                        className="prose dark:prose-invert max-w-none prose-sm"
                        components={{
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-md font-semibold mt-3 mb-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-2" {...props} />,
                          li: ({node, ...props}) => <li className="my-1" {...props} />,
                          code: ({node, className, children, ...props}: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            const isInline = !match;
                            return isInline ? (
                              <code className="bg-muted-foreground/20 rounded px-1" {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className="block bg-muted-foreground/20 rounded p-2 my-2" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    <div
                      className={`text-xs mt-2 ${
                        message.type === 'user'
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4">
                    <LoadingSpinner />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="pt-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about Supabase compliance and security..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !query.trim()}>
                {loading ? (
                  <LoadingSpinner size={16} />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 