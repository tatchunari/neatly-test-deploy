import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from "@/components/admin/Layout";
import { ButtonShadcn as Button } from "@/components/ui/button-shadcn";
import { Input } from "@/components/ui/input";
import { supabase } from '@/lib/supabaseClient';

interface ChatMessage {
  id: string;
  message: string;
  is_bot: boolean;
  created_at: string;
}

interface Ticket {
  id: string;
  session_id: string;
  user_message: string;
  status: string;
  created_at: string;
  closed_at?: string;
}

export default function TicketDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chat states
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isLiveChat, setIsLiveChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      fetchTicketData();
    }
  }, [id]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!ticket?.session_id) return;

    console.log('Setting up realtime subscription for session:', ticket.session_id);

    const channel = supabase
      .channel(`chat:${ticket.session_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chatbot_messages',
          filter: `session_id=eq.${ticket.session_id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as ChatMessage;
          
          // Add new message to state if it's not already there
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (!exists) {
              return [...prev, newMessage];
            }
            return prev;
          });
        }
      )
      .on('broadcast', { event: 'typing_status' }, (payload) => {
        if (payload.payload?.userType === 'user') {
          setUserTyping(payload.payload.isTyping);
        }
      })
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [ticket?.session_id]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      
      // Fetch ticket details
      const ticketResponse = await fetch(`/api/ticket/tickets?id=${id}`);
      const ticketData = await ticketResponse.json();
      
      if (!ticketResponse.ok) {
        throw new Error(ticketData.error || 'Failed to fetch ticket');
      }
      
      setTicket(ticketData.ticket);
      
      // Set live chat status from ticket data
      setIsLiveChat(ticketData.ticket.live_chat_enabled || false);
      
      // Fetch chat messages for this session
      const messagesResponse = await fetch(`/api/admin/messages?session_id=${ticketData.ticket.session_id}`);
      const messagesData = await messagesResponse.json();
      
      if (messagesResponse.ok) {
        setMessages(messagesData.messages || []);
      }
      
    } catch (err) {
      console.error('Error fetching ticket data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  // Send typing status
  const sendTypingStatus = async (typing: boolean) => {
    if (!ticket?.session_id) return;
    
    try {
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: ticket.session_id,
          isTyping: typing,
          userType: 'admin'
        })
      });
    } catch (error) {
      console.error('Error sending typing status:', error);
    }
  };

  // Handle input change with typing detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Send typing status if there's text
    if (value.trim()) {
      if (!isTyping) {
        setIsTyping(true);
      }
      sendTypingStatus(true);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing
    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
      setTypingTimeout(null);
    }, 1000);

    setTypingTimeout(timeout);
  };

  // Send message function
  const sendMessage = async () => {
    if (!newMessage.trim() || !ticket?.session_id) return;

    // Stop typing status
    setIsTyping(false);
    sendTypingStatus(false);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    setSendingMessage(true);
    try {
      const { data, error } = await supabase
        .from('chatbot_messages')
        .insert({
          session_id: ticket.session_id,
          message: newMessage.trim(),
          is_bot: true // Admin messages are treated as bot messages
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
      } else {
        setNewMessage('');
        // Add message to local state immediately
        setMessages(prev => [...prev, data]);
        
        // Update ticket status to "in_progress" if it's still "open"
        if (ticket?.status === 'open') {
          try {
            const updateResponse = await fetch(`/api/ticket/tickets?id=${ticket.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'in_progress' })
            });
            
            if (updateResponse.ok) {
              setTicket(prev => prev ? { ...prev, status: 'in_progress' } : null);
              console.log('✅ Ticket status updated to in_progress');
            }
          } catch (updateError) {
            console.error('Error updating ticket status:', updateError);
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-gray-100 flex-1 flex items-center justify-center" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ticket...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !ticket) {
    return (
      <Layout>
        <div className="bg-gray-100 flex-1 flex items-center justify-center" style={{ minHeight: '100vh' }}>
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Ticket not found'}</p>
            <Button onClick={() => router.push('/admin/ticket')} variant="outline">
              Back to Tickets
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-100 flex-1" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="w-full px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.id.substring(0, 8)}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {getStatusText(ticket.status)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Created: {new Date(ticket.created_at).toLocaleString('en-US')}
                  </span>
                  {ticket.closed_at && (
                    <span className="text-sm text-gray-500">
                      Closed: {new Date(ticket.closed_at).toLocaleString('en-US')}
                    </span>
                  )}
                </div>
              </div>
              <Button onClick={() => router.push('/admin/ticket')} variant="outline">
                Back to Tickets
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Ticket Info */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-600 mb-4">Ticket Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800">
                  <strong>Issue:</strong> {ticket.user_message}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Session ID:</strong> {ticket.session_id}
                </p>
              </div>
            </div>

            {/* Chat History */}
            <div>
              <h2 className="text-lg font-semibold text-gray-600 mb-4">Chat History</h2>
              {messages.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                   {messages.map((message) => (
                     <div key={message.id} className={`flex ${message.is_bot ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[70%] p-3 rounded-lg ${
                         message.is_bot 
                           ? 'bg-orange-500 text-white' 
                           : 'bg-gray-100 text-gray-800'
                       }`}>
                         <p className="text-sm">{message.message}</p>
                         <p className={`text-xs mt-1 ${
                           message.is_bot ? 'text-orange-100' : 'text-gray-500'
                         }`}>
                           {new Date(message.created_at).toLocaleTimeString('en-US', { 
                             hour: '2-digit', 
                             minute: '2-digit',
                             hour12: false 
                           })}
                         </p>
                       </div>
                     </div>
                   ))}
                   
                   {/* User Typing Indicator - Same as Bot Typing */}
                   {userTyping && (
                     <div className="flex justify-start">
                       <div className="w-12 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                         <div className="flex gap-1">
                           <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                           <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                           <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                         </div>
                       </div>
                     </div>
                   )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No chat messages found for this ticket.</p>
                </div>
              )}
            </div>

            {/* Admin Chat Input */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-600 mb-4">Reply to Customer</h3>
              {ticket.status === 'open' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-4 px-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-yellow-800 text-sm">
                        Please accept this ticket first to start chatting with the customer.
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/ticket/tickets?id=${ticket.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'in_progress' })
                          });
                          
                          if (response.ok) {
                            setTicket(prev => prev ? { ...prev, status: 'in_progress' } : null);
                            console.log('✅ Ticket accepted');
                          }
                        } catch (error) {
                          console.error('Error accepting ticket:', error);
                        }
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
                    >
                      Accept Ticket
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Live Chat Toggle */}
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">
                        Live Chat: {isLiveChat ? 'ON' : 'OFF'} - {isLiveChat ? 'Bot responses disabled' : 'Bot responses enabled'}
                      </span>
                    </div>
                    <Button 
                      onClick={async () => {
                        try {
                          const newLiveChatStatus = !isLiveChat;
                          const response = await fetch('/api/admin/live-chat', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              ticketId: ticket.id, 
                              liveChatEnabled: newLiveChatStatus 
                            })
                          });
                          
                          if (response.ok) {
                            setIsLiveChat(newLiveChatStatus);
                            console.log(`✅ Live chat ${newLiveChatStatus ? 'enabled' : 'disabled'}`);
                          }
                        } catch (error) {
                          console.error('Error toggling live chat:', error);
                        }
                      }}
                      className={`px-4 py-1 text-sm ${
                        isLiveChat 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {isLiveChat ? 'Turn OFF' : 'Turn ON'}
                    </Button>
                  </div>

                  {/* Chat Input */}
                  {isLiveChat ? (
                    <div className="flex gap-2 items-center">
                      <Input 
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message to the customer..." 
                        className="flex-1 border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-full px-4 py-2"
                        disabled={sendingMessage}
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 rounded-full p-2 w-10 h-10 flex items-center justify-center"
                      >
                        {sendingMessage ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4 px-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600 text-sm">
                          Turn ON Live Chat to start messaging the customer
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
