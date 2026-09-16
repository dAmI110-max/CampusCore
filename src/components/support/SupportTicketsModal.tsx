import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import { useToast } from '../../context/ToastContext';
import { SupportTicket, SupportTicketCategory, SupportTicketPriority } from '../../types';
import {
  X,
  LifeBuoy,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SupportTicketsModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const SupportTicketsModal: React.FC<SupportTicketsModalProps> = ({
  isOpen = true,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTab, setActiveTab] = useState<'my_tickets' | 'create'>('my_tickets');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // New ticket state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicketCategory>('disputes');
  const [priority, setPriority] = useState<SupportTicketPriority>('medium');
  const [description, setDescription] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = () => {
    if (currentUser) {
      setTickets(StorageService.getSupportTickets(currentUser.id));
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTickets();
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toastError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      StorageService.createSupportTicket({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userEmail: currentUser.email,
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      });

      success('Support ticket submitted to Ace Tech moderation team!');
      setSubject('');
      setDescription('');
      setActiveTab('my_tickets');
      loadTickets();
    } catch (err: any) {
      toastError(err.message || 'Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = () => {
    if (!selectedTicket || !replyText.trim()) return;

    StorageService.replySupportTicket(selectedTicket.id, {
      ticketId: selectedTicket.id,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: 'user',
      message: replyText.trim(),
    });

    setReplyText('');
    loadTickets();
    // Update active modal selected
    const updated = StorageService.getSupportTickets().find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
    success('Reply added.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">CampusCore Help & Support Hub</h2>
              <p className="text-[11px] text-slate-500">24/7 Escrow Disputes & Campus Inquiries</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50/30">
          <button
            onClick={() => {
              setActiveTab('my_tickets');
              setSelectedTicket(null);
            }}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'my_tickets'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            My Support Tickets ({tickets.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('create');
              setSelectedTicket(null);
            }}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Submit New Ticket
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: LIST / CONVERSATION VIEW */}
          {activeTab === 'my_tickets' && (
            <div>
              {selectedTicket ? (
                /* Ticket Details & Thread */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      ← Back to tickets
                    </button>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        selectedTicket.status === 'open'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedTicket.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-base">{selectedTicket.subject}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Category: {(selectedTicket.category || 'GENERAL').replace('_', ' ').toUpperCase()} • Priority:{' '}
                      {(selectedTicket.priority || 'NORMAL').toUpperCase()}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {selectedTicket.description}
                  </div>

                  {/* Messages Thread */}
                  <div className="space-y-3 pt-2">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Conversation Thread
                    </h4>

                    {(selectedTicket.replies || (selectedTicket as any).messages || []).map((m: any) => (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                          m.senderRole === 'support_admin' || m.senderRole === 'admin' || m.isAdmin
                            ? 'bg-indigo-50 border border-indigo-200 ml-4'
                            : 'bg-slate-50 border border-slate-200 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {m.senderName} {(m.senderRole === 'support_admin' || m.senderRole === 'admin' || m.isAdmin) && '(Campus Support)'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(m.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{m.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Box */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddReply()}
                      placeholder="Type your response to support..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddReply}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <LifeBuoy className="w-10 h-10 mx-auto text-slate-300" />
                  <h3 className="font-bold text-slate-800 text-sm">No support tickets found</h3>
                  <p className="text-xs text-slate-500">
                    Have an issue with a transaction, verification, or service delivery? Open a ticket.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                  >
                    Open New Ticket
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-slate-50/60 transition-all cursor-pointer flex items-center justify-between shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              t.status === 'open'
                                ? 'bg-amber-100 text-amber-800'
                                : t.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 uppercase">
                            {t.category.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{t.subject}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{t.description}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-bold text-indigo-600 mt-1 inline-block">
                          {t.messages.length} replies →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE TICKET */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject / Issue Title *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Escrow dispute for Laptop battery order #TX-902"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SupportTicketCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="transaction_dispute">Transaction / Escrow Dispute</option>
                    <option value="wallet_withdrawal">Wallet & Payment Issue</option>
                    <option value="account_verification">Student ID Verification</option>
                    <option value="service_delivery">Service Delivery Complaint</option>
                    <option value="bug_report">App Bug / Feature Request</option>
                    <option value="general">Other Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as SupportTicketPriority)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low (General Query)</option>
                    <option value="medium">Medium (Standard Request)</option>
                    <option value="high">High (Urgent Transaction Dispute)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Explanation & Transaction Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide all relevant details, including transaction reference numbers, seller usernames, or screenshots description..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 text-sm outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
