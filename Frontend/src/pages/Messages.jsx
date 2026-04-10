import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Search, 
  User, 
  MessageSquare, 
  MoreVertical,
  ChevronLeft,
  Loader2,
  Clock
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Messages = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
      setActiveConversation(null);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket listener for real-time messages
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (data) => {
        // Only add if it's from the other user (sender will update optimistically/immediately)
        if (conversationId && data.sessionId === conversationId && data.senderId !== user._id) {
          setMessages(prev => [...prev, {
            _id: data.messageId || Date.now(),
            conversationId: data.sessionId,
            senderId: { _id: data.senderId },
            text: data.message,
            createdAt: new Date()
          }]);
        }
        fetchConversations();
      });

      return () => socket.off('receive_message');
    }
  }, [socket, conversationId, user?._id]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
      
      if (conversationId) {
        const current = data.find(c => c._id === conversationId);
        if (current) setActiveConversation(current);
      }
    } catch (err) {
      console.error('Error fetching conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id) => {
    setMsgLoading(true);
    try {
      const { data } = await api.get(`/messages/history/${id}`);
      setMessages(data);
      
      // Join socket room for this conversation
      if (socket) {
        socket.emit('join_session', id);
      }
    } catch (err) {
      console.error('Error fetching messages', err);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const messageData = {
      conversationId: activeConversation._id,
      text: inputText,
      receiverId: activeConversation.participants.find(p => p._id !== user._id)._id
    };

    try {
      const { data } = await api.post('/messages/send', messageData);
      
      // Optimistic/Immediate update for sender profile
      setMessages(prev => [...prev, {
        _id: data._id,
        conversationId: activeConversation._id,
        senderId: { _id: user._id },
        text: inputText,
        createdAt: new Date()
      }]);

      if (socket) {
        socket.emit('send_message', {
          sessionId: activeConversation._id,
          senderId: user._id,
          messageId: data._id,
          message: inputText
        });
      }
      setInputText('');
      fetchConversations(); // Update sidebar last message
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  const getTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p._id !== user?._id);
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-sensai-primary" size={48} />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8">
      <div className="glass flex h-[calc(100vh-160px)] overflow-hidden">
        
        {/* Sidebar - Conversation List */}
        <div className={`w-full border-r border-glass lg:w-96 ${conversationId ? 'hidden lg:flex' : 'flex'} flex-col`}>
          <div className="p-6">
            <h2 className="mb-6 text-2xl font-bold text-white">Messages</h2>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sensai-muted" />
              <input 
                className="input-field pl-11 py-2.5 text-sm" 
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const otherUser = conv.participants.find(p => p._id !== user?._id);
                const isActive = conversationId === conv._id;
                
                return (
                  <motion.div 
                    key={conv._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveConversation(conv);
                      navigate(`/messages/${conv._id}`);
                    }}
                    className={`mb-2 cursor-pointer rounded-2xl p-4 transition-all duration-200 
                      ${isActive ? 'bg-sensai-primary shadow-[0_4px_15px_rgba(139,92,246,0.3)]' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 flex-shrink-0 animate-pulse-slow">
                        {otherUser?.profilePic ? (
                          <img src={otherUser.profilePic} className="h-full w-full rounded-xl object-cover" alt="" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-sensai-primary/20 to-sensai-secondary/20 font-bold text-white">
                            {otherUser?.name.charAt(0)}
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className={`truncate text-sm font-bold ${isActive ? 'text-white' : 'text-slate-100'}`}>
                            {otherUser?.name}
                          </h4>
                          <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-sensai-muted'}`}>
                            {conv.updatedAt ? getTime(conv.updatedAt) : ''}
                          </span>
                        </div>
                        <p className={`truncate text-[11px] ${isActive ? 'text-white/80' : 'text-sensai-muted'}`}>
                          {conv.lastMessage?.text || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-sensai-muted">
                <MessageSquare size={40} className="mb-3 opacity-20" />
                <p className="text-sm">No conversations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex flex-1 flex-col ${!conversationId ? 'hidden lg:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <header className="flex items-center justify-between border-b border-glass px-6 py-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate('/messages')} className="text-sensai-muted hover:text-white lg:hidden">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0">
                      {activeConversation.participants.find(p => p._id !== user?._id)?.profilePic ? (
                        <img 
                          src={activeConversation.participants.find(p => p._id !== user?._id).profilePic} 
                          className="h-full w-full rounded-xl object-cover" 
                          alt="" 
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-xl bg-sensai-primary/20 font-bold text-white">
                          {activeConversation.participants.find(p => p._id !== user?._id)?.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {activeConversation.participants.find(p => p._id !== user?._id)?.name}
                      </h3>
                      <div className="flex items-center gap-1.5 font-bold tracking-widest text-emerald-400 uppercase text-[9px]">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </div>
                    </div>
                  </div>
                </div>
                <button className="text-sensai-muted hover:text-white">
                  <MoreVertical size={20} />
                </button>
              </header>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {msgLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-sensai-primary" /></div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isMe = (msg.senderId._id || msg.senderId) === user._id;
                      return (
                        <motion.div 
                          key={msg._id || i}
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`group relative max-w-[80%] rounded-2xl px-5 py-3 
                            ${isMe ? 'bg-sensai-primary text-white rounded-tr-none shadow-[0_4px_15px_rgba(139,92,246,0.2)]' : 'bg-white/5 text-slate-100 rounded-tl-none border border-glass'}`}
                          >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <span className={`mt-1.5 block text-[9px] font-medium opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                              {getTime(msg.createdAt)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 pt-2">
                <form onSubmit={handleSendMessage} className="glass flex items-center gap-3 rounded-2xl border border-glass p-1.5">
                  <input 
                    className="flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-sensai-muted" 
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="btn-primary flex h-10 w-10 items-center justify-center p-0 transition-transform active:scale-90"
                    disabled={!inputText.trim()}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-sensai-muted">
              <div className="mb-6 rounded-3xl bg-white/5 p-8">
                <MessageSquare size={64} className="opacity-10" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Your Inbox</h3>
              <p className="max-w-[280px] text-center text-sm leading-relaxed">
                Connect with mentors and founders to share insights and build together.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
