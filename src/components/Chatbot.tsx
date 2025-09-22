import { useState, useRef, useEffect } from "react";
import { ButtonShadcn as Button } from "@/components/ui/button-shadcn";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import axios from "axios";
import { supabase } from "@/lib/supabaseClient";
import type { ChatMessage, ChatSession } from "@/types/chat";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [startY, setStartY] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const subscriptionReadyPromise = useRef<Promise<void> | null>(null);
  const subscriptionResolve = useRef<(() => void) | null>(null);
  const displayedBotMessages = useRef<Set<string>>(new Set());
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleClose = (withAnimation = true) => {
    if (withAnimation) {
      setIsClosing(true);
      setTimeout(() => {
        setOpen(false);
        setIsExpanded(false);
        setIsClosing(false);
      }, 200); // Match animation duration
    } else {
      setOpen(false);
      setIsExpanded(false);
      setIsClosing(false);
    }
  };

  // Handle scroll to expand
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop } = scrollRef.current;
      if (scrollTop > 50 && !isExpanded) {
        setIsExpanded(true);
      }
    }
  };

  // Handle touch events for drag interactions
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768) return; // Only on mobile
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || window.innerWidth >= 768) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    setDragY(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || window.innerWidth >= 768) return;
    
    setIsDragging(false);
    
    if (dragY > 100) {
      // Drag down: Close chat without animation
      handleClose(false);
    } else if (dragY < -50 && !isExpanded) {
      // Drag up: Expand to fullscreen
      setIsExpanded(true);
    }
    
    setDragY(0);
  };

  // Session will be created when user sends first message

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset states when chat closes
  useEffect(() => {
    if (!open) {
      setIsExpanded(false);
      setDragY(0);
    }
  }, [open]);

  // Supabase Realtime subscription for new messages
  useEffect(() => {
    if (!currentSession?.id) return;

    console.log('Setting up Realtime subscription for session:', currentSession.id);
    
    // Clear displayed bot messages for new session
    displayedBotMessages.current.clear();
    
    // Create promise for subscription ready
    subscriptionReadyPromise.current = new Promise<void>((resolve) => {
      subscriptionResolve.current = resolve;
    });

    const channel = supabase
      .channel(`chat:${currentSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chatbot_messages',
          filter: `session_id=eq.${currentSession.id}`
        },
        async (payload) => {
          console.log('New message received via Realtime:', payload);
          const newMessage = payload.new as ChatMessage;
          
          // เพิ่มข้อความใหม่เข้า state
          setMessages(prev => {
            // ตรวจสอบว่าไม่มีข้อความนี้อยู่แล้ว (ป้องกัน duplicate)
            const existsById = prev.some(msg => msg.id === newMessage.id);
            const alreadyDisplayed = displayedBotMessages.current.has(newMessage.id);
            
            if (existsById || alreadyDisplayed) {
              console.log('Message already exists, skipping:', newMessage.id);
              return prev;
            }
            console.log('Adding new message to state:', newMessage.id);
            
            // Hide typing indicator if this is a bot message
            if (newMessage.is_bot) {
              setIsBotTyping(false);
              displayedBotMessages.current.add(newMessage.id);
              if (safetyTimeoutRef.current) {
                clearTimeout(safetyTimeoutRef.current);
                safetyTimeoutRef.current = null;
              }
              console.log('Bot response received, hiding typing indicator');
            }
            
            return [...prev, newMessage];
          });

          // Auto scroll to bottom after adding message
          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
      )
      .subscribe(async (status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime subscription active for session:', currentSession.id);
          setIsSubscribed(true);
          
          // Resolve the promise when subscription is ready
          if (subscriptionResolve.current) {
            subscriptionResolve.current();
            subscriptionResolve.current = null;
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime subscription error for session:', currentSession.id);
          setIsSubscribed(false);
          
          // Retry subscription after error
          setTimeout(() => {
            console.log('Retrying Realtime subscription...');
            channel.subscribe();
          }, 2000);
        } else {
          setIsSubscribed(false);
        }
      });

    // Cleanup subscription
    return () => {
      console.log('Cleaning up Realtime subscription for session:', currentSession.id);
      supabase.removeChannel(channel);
    };
  }, [currentSession?.id]);

  const createChatSession = async () => {
    try {
      // Use real API now that tables exist
      const { data } = await axios.post('/api/chat/sessions');
      setCurrentSession(data.session);
      
      // Fetch existing messages for this session
      fetchMessages(data.session.id);
    } catch (error) {
      console.error('Error creating chat session:', error);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      // Use real API now that tables exist
      const { data } = await axios.get(`/api/chat/messages`, {
        params: { sessionId }
      });
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Optimistic UI: Show message immediately
    const tempMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      session_id: currentSession?.id || 'temp',
      sender_id: null,
      message: userMessage,
      is_bot: false,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);

    try {
      // Create session if it doesn't exist (first message)
      let sessionToUse = currentSession;
      if (!sessionToUse) {
        const { data } = await axios.post('/api/chat/sessions');
        sessionToUse = data.session;
        setCurrentSession(sessionToUse);
        
        // Wait for subscription to be ready after creating new session
        console.log('Waiting for Realtime subscription to be ready...');
        if (subscriptionReadyPromise.current) {
          await subscriptionReadyPromise.current;
          console.log('✅ Realtime subscription is ready');
          
          // Additional wait to ensure subscription is fully established
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Show bot typing indicator
      setIsBotTyping(true);

      // Send message using the session
      const { data } = await axios.post(`/api/chat/messages`, {
        message: userMessage,
        isBot: false
      }, {
        params: { sessionId: sessionToUse!.id }
      });
      
      // Replace temp message with real message from database
      // Note: Realtime will also receive this message, but we replace it anyway
      // to ensure we have the correct database ID and timestamp
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? data.message : msg
        )
      );

      console.log('Message sent successfully:', data.message);
      
      // Safety timeout: Hide typing indicator after 10 seconds if no bot response
      safetyTimeoutRef.current = setTimeout(() => {
        console.log('Safety timeout: Hiding typing indicator after 10 seconds');
        setIsBotTyping(false);
      }, 10000);

      // Fallback: Check for bot response after a short delay if not received via Realtime
      setTimeout(async () => {
        try {
          const { data: latestMessages } = await axios.get(`/api/chat/messages`, {
            params: { sessionId: sessionToUse!.id }
          });
          
          const latestBotMessage = latestMessages.messages
            .filter((msg: ChatMessage) => msg.is_bot)
            .sort((a: ChatMessage, b: ChatMessage) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];
          
          if (latestBotMessage) {
            const messageExists = messages.some(msg => msg.id === latestBotMessage.id);
            const alreadyDisplayed = displayedBotMessages.current.has(latestBotMessage.id);
            
            if (!messageExists && !alreadyDisplayed) {
              console.log('Fallback: Adding bot message that was missed by Realtime:', latestBotMessage.id);
              setMessages(prev => [...prev, latestBotMessage]);
              displayedBotMessages.current.add(latestBotMessage.id);
              setIsBotTyping(false);
              if (safetyTimeoutRef.current) {
                clearTimeout(safetyTimeoutRef.current);
                safetyTimeoutRef.current = null;
              }
              console.log('Bot response received via fallback, hiding typing indicator');
            } else {
              console.log('Bot message already exists in UI, skipping fallback');
              setIsBotTyping(false);
              if (safetyTimeoutRef.current) {
                clearTimeout(safetyTimeoutRef.current);
                safetyTimeoutRef.current = null;
              }
              console.log('Bot response already exists, hiding typing indicator');
            }
          } else {
            console.log('No bot message found in database');
            setIsBotTyping(false);
            if (safetyTimeoutRef.current) {
              clearTimeout(safetyTimeoutRef.current);
              safetyTimeoutRef.current = null;
            }
          }
        } catch (error) {
          console.error('Error in fallback message check:', error);
        }
      }, 2000); // Check after 2 seconds
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove temp message if API fails
      setMessages(prev => 
        prev.filter(msg => msg.id !== tempMessage.id)
      );
    } finally {
      // Don't hide typing indicator here - let it be hidden when bot response is received
      // setIsBotTyping(false); // Removed - let bot response hide it
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Image
        src={open ? "/chatbot-close.svg" : "/chatbot.svg"}
        alt={open ? "Close chat" : "Open chat"}
        width={56}
        height={56}
        className="fixed bottom-6 right-6 w-14 h-14 cursor-pointer z-50 transition-all duration-200"
        onClick={() => {
          if (open) {
            handleClose();
          } else {
            setOpen(true);
          }
        }}
      />

      {/* Chat Widget - Fixed Positioned */}
      {open && (
        <>
          {/* Mobile Overlay */}
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => handleClose()} />
          
          <div 
            ref={chatRef}
            className={`
              fixed z-50 flex flex-col
              bg-white shadow-xl
              transition-all duration-300
              
              /* Mobile: Dynamic height bottom sheet */
              bottom-0 left-0 right-0
              ${isExpanded ? 'h-screen' : 'h-[80vh]'}
              ${isExpanded ? 'rounded-none' : 'rounded-t-xl'}
              
              /* Desktop: Corner popup */
              md:bottom-20 md:right-6 md:left-auto
              md:w-96 md:h-[500px]
              md:rounded-xl
              
              /* Animations */
              ${isClosing 
                ? 'animate-out slide-out-to-bottom-4 duration-200 ease-in' 
                : 'animate-in slide-in-from-bottom-4 duration-300 ease-out'
              }
            `}
            style={{
              transform: isDragging ? `translateY(${dragY}px)` : 'none'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
          {/* Drag Handle (Mobile only) */}
          {!isExpanded && (
            <div className="md:hidden flex justify-center py-1">
              <div className="w-8 h-1 bg-gray-400 rounded-full" />
            </div>
          )}

          {/* Header */}
          <div className={`flex justify-between items-center p-4 bg-white ${
            isExpanded ? 'rounded-none' : 'rounded-t-xl'
          } md:rounded-t-xl`}>
            <div className="flex items-center gap-2">
              <Image
                src="/chatbot.svg"
                alt="Neatly Assistant"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <h2 className="font-semibold text-gray-800">Neatly Assistant</h2>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleClose()}
              className="text-gray-500 hover:bg-gray-100 h-8 w-8"
            >
              ✖
            </Button>
          </div>

          {/* Body */}
          <ScrollArea 
            ref={scrollRef}
            className="p-4 bg-gray-50 shadow-[inset_0_-16px_16px_-8px_rgba(0,0,0,0.1)] h-[calc(100%-120px)] overflow-y-auto"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.is_bot ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.is_bot
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'bg-orange-500 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <p className="text-xs mt-1 text-gray-500 px-1">
                    {new Date(message.created_at).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
              
              {/* Bot Typing Indicator */}
              {isBotTyping && (
                <div key="bot-typing-indicator" className="flex flex-col items-start">
                  <div className="w-12 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Invisible div for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 bg-white rounded-b-xl md:rounded-b-xl">
            <div className="flex gap-2 items-center">
              <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write your message" 
                className="flex-1 border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-full px-4 py-2"
              />
              <Button 
                onClick={sendMessage}
                disabled={!inputValue.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 rounded-full p-2 w-10 h-10 flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </div>
          </div>
          </div>
        </>
      )}
    </>
  );
}
