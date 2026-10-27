'use client';

import React, { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabaseClient'; // Uncomment and adjust path to your Supabase client

export interface DirectMessagesProps {
  currentUserHandle?: string;
  currentUserName?: string;
  onBackToFeed?: () => void;
}

export interface Message {
  id: string;
  sender_handle: string;
  receiver_handle: string;
  content: string;
  created_at: string;
}

export default function DirectMessages({
  currentUserHandle = 'unknown_user',
  currentUserName = 'User',
  onBackToFeed,
}: DirectMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<string>('study_buddy_1'); // Example active chat
  const [isLoading, setIsLoading] = useState(false);

  // Example: Fetch historical messages from Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      /* 
      // UNCOMMENT WHEN SUPABASE IS CONNECTED
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_handle.eq.${currentUserHandle},receiver_handle.eq.${selectedContact}),and(sender_handle.eq.${selectedContact},receiver_handle.eq.${currentUserHandle})`)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);
      */
      setIsLoading(false);
    };

    if (currentUserHandle && selectedContact) {
      fetchMessages();
    }

    /*
    // SUPABASE REALTIME LISTENER (Optional but recommended for DMs)
    const channel = supabase
      .channel('realtime_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    */
  }, [currentUserHandle, selectedContact]);

  // Handle sending a new message to Supabase
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messagePayload = {
      id: crypto.randomUUID(),
      sender_handle: currentUserHandle,
      receiver_handle: selectedContact,
      content: newMessage,
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, messagePayload]);
    setNewMessage('');

    /*
    // UNCOMMENT TO INSERT INTO SUPABASE
    const { error } = await supabase.from('messages').insert([
      {
        sender_handle: currentUserHandle,
        receiver_handle: selectedContact,
        content: messagePayload.content,
      }
    ]);
    if (error) console.error("Error sending message:", error);
    */
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-white rounded-lg overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
        <div className="flex items-center gap-3">
          {onBackToFeed && (
            <button
              onClick={onBackToFeed}
              className="md:hidden p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
            >
              ←
            </button>
          )}
          <div>
            <h2 className="text-lg font-semibold">{selectedContact}</h2>
            <p className="text-xs text-green-400">
              Chatting as @{currentUserHandle} ({currentUserName})
            </p>
          </div>
        </div>
      </div>

      {/* Message History Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No messages yet. Say hi!</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_handle === currentUserHandle;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] p-3 rounded-xl ${
                    isMe
                      ? 'bg-green-700 text-white rounded-br-none'
                      : 'bg-gray-800 text-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-gray-950">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-green-500 transition-all border border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-5 py-2 rounded-full font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}