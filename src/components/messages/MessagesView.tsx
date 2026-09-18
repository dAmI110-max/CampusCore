import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StorageService } from '../../services/storageService';
import { Conversation, Message } from '../../types';
import {
  MessageCircle,
  Send,
  Image as ImageIcon,
  ShieldCheck,
  Package,
  ArrowLeft,
  Lock,
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MessagesViewProps {
  initialConversationId?: string;
  onNavigateToOrder?: (orderId: string) => void;
  onNavigateToProduct?: (productId: string) => void;
}

const QUICK_CAMPUS_PROMPTS = [
  'Is this still available?',
  'Let us meet at SUB building for inspection.',
  'Can you do a slight discount for a student?',
  'I have just paid with Escrow on CampusCore.',
  'Are you on Osogbo campus today?',
];

export const MessagesView: React.FC<MessagesViewProps> = ({
  initialConversationId,
  onNavigateToOrder,
  onNavigateToProduct,
}) => {
  const { currentUser } = useAuth();
  const { success } = useToast();

  const [selectedConvId, setSelectedConvId] = useState<string | null>(initialConversationId || null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
        <p className="text-sm text-slate-600 mb-6">Log in to view your campus conversations and seller messages.</p>
      </div>
    );
  }

  const conversations = useMemo(() => {
    return StorageService.getConversations(currentUser.id);
  }, [currentUser.id]);

  const activeConversation = useMemo(() => {
    return selectedConvId ? StorageService.getConversationById(selectedConvId) : null;
  }, [selectedConvId]);

  const messages = useMemo(() => {
    return selectedConvId ? StorageService.getMessages(selectedConvId) : [];
  }, [selectedConvId]);

  // Auto select first conversation if none selected
  useEffect(() => {
    if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, [selectedConvId, conversations.length]);

  // Mark as read when opening conversation only if unread exists
  useEffect(() => {
    if (selectedConvId && currentUser?.id) {
      const conv = StorageService.getConversationById(selectedConvId);
      if (conv?.unreadCount && (conv.unreadCount[currentUser.id] || 0) > 0) {
        StorageService.markConversationAsRead(selectedConvId, currentUser.id);
      }
    }
  }, [selectedConvId, currentUser?.id]);

  // Scroll to bottom only when message count changes
  const lastMessageId = messages[messages.length - 1]?.id;
  useEffect(() => {
    if (lastMessageId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lastMessageId]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !selectedConvId) return;

    StorageService.sendMessage(selectedConvId, currentUser.id, text.trim());
    setInputText('');
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const otherParticipantId = c.participants.find((p) => p !== currentUser.id) || '';
    const otherDetails = c.participantDetails?.[otherParticipantId];
    return (
      (otherDetails?.name && otherDetails.name.toLowerCase().includes(q)) ||
      (c.productTitle && c.productTitle.toLowerCase().includes(q)) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
          <MessageCircle className="w-4 h-4" />
          CampusCore Instant Messenger
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Direct Student Messages</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Safely coordinate product inspections, negotiate prices, and communicate with verified UNIOSUN students.
        </p>
      </div>

      {/* Main Bento Messenger Box */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px] max-h-[750px]">
        {/* Left Sidebar: Conversations List */}
        <div
          className={`md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
            selectedConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Box */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No conversations</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Chat with Seller" on any marketplace listing to start talking.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherParticipantId = conv.participants.find((p) => p !== currentUser.id) || '';
                const other = conv.participantDetails?.[otherParticipantId] || {
                  name: 'Student',
                  avatar: undefined,
                  campus: 'UNIOSUN',
                  verificationBadge: undefined,
                };
                const unread = conv.unreadCount?.[currentUser.id] || 0;
                const isSelected = selectedConvId === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-4 cursor-pointer transition-colors flex items-start gap-3 relative ${
                      isSelected ? 'bg-white border-l-4 border-indigo-600 shadow-sm' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          other.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                        }
                        alt={other.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                      />
                      {conv.productImage && (
                        <img
                          src={conv.productImage}
                          alt="item"
                          className="w-5 h-5 rounded-md object-cover absolute -bottom-1 -right-1 border border-white shadow-xs"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="font-extrabold text-xs text-slate-900 truncate">{other.name}</span>
                          {other.verificationBadge && (
                            <span title="Verified Student" className="inline-flex shrink-0">
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {new Date(conv.lastMessageTime).toLocaleTimeString('en-NG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {conv.productTitle && (
                        <span className="text-[10px] font-semibold text-indigo-600 truncate block">
                          {conv.productTitle}
                        </span>
                      )}

                      <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage || 'Started conversation'}</p>
                    </div>

                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Area */}
        <div
          className={`md:col-span-8 flex flex-col bg-white ${
            !selectedConvId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Header */}
              {(() => {
                const otherId = activeConversation.participants.find((p) => p !== currentUser.id) || '';
                const other = activeConversation.participantDetails?.[otherId] || {
                  name: 'Student',
                  avatar: undefined,
                  campus: 'UNIOSUN',
                  verificationBadge: undefined,
                };

                return (
                  <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Mobile Back button */}
                      <button
                        onClick={() => setSelectedConvId(null)}
                        className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-600"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>

                      <img
                        src={
                          other.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                        }
                        alt={other.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-slate-900">{other.name}</span>
                          {other.verificationBadge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 block">{other.campus || 'UNIOSUN Student'}</span>
                      </div>
                    </div>

                    {/* Associated Product / Order Quick Banner */}
                    {activeConversation.productId && (
                      <div className="flex items-center gap-2">
                        {activeConversation.productImage && (
                          <img
                            src={activeConversation.productImage}
                            alt="product"
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 hidden sm:block"
                          />
                        )}
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 block truncate max-w-[140px]">
                            {activeConversation.productTitle}
                          </span>
                          {activeConversation.productPrice && (
                            <span className="text-xs font-black text-indigo-600">
                              ₦{activeConversation.productPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {activeConversation.orderId && onNavigateToOrder && (
                          <button
                            onClick={() => onNavigateToOrder(activeConversation.orderId!)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 flex items-center gap-1"
                          >
                            <Package className="w-3.5 h-3.5 text-indigo-400" />
                            Order Escrow
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Messages Content Stream */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-slate-50/40">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>No messages yet. Send a message to start coordinating!</span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === currentUser.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs ${
                            isMine
                              ? 'bg-indigo-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-900 border border-slate-200/80 rounded-bl-xs'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString('en-NG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  Quick:
                </span>
                {QUICK_CAMPUS_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message to student seller..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl shadow-md shadow-indigo-600/20 transition-all shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageCircle className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-extrabold text-base text-slate-700">Select a conversation</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Choose a conversation from the left to read messages and reply safely on CampusCore.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
