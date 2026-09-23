import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StudyGenMessage, StudyGenMode } from '../../types';
import { StorageService } from '../../services/storageService';
import { getSupabase } from '../../lib/supabase';
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  GraduationCap,
  BookOpen,
  HelpCircle,
  FileText,
  Layers,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface StudyGenAIProps {
  onBack?: () => void;
  onNavigateToResources?: () => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

const QUICK_PROMPT_CHIPS = [
  {
    label: 'Differentiation',
    prompt: 'Explain differentiation step-by-step with formulas and intuition.',
    mode: 'general' as StudyGenMode,
  },
  {
    label: 'GST 111 Quiz',
    prompt: 'Give me 5 practice multiple choice questions on Communication in English (GST 111) with answer explanations.',
    mode: 'quiz_generator' as StudyGenMode,
  },
  {
    label: "Ohm's Law",
    prompt: "Explain Ohm's law, its formula, units, and a practical circuit calculation example.",
    mode: 'general' as StudyGenMode,
  },
  {
    label: 'CSC 204 Trees & Graphs',
    prompt: 'Teach me the difference between Binary Search Trees and Graphs with practical code examples.',
    mode: 'general' as StudyGenMode,
  },
  {
    label: 'Photosynthesis',
    prompt: 'Summarize the light-dependent and light-independent stages of photosynthesis clearly.',
    mode: 'summary' as StudyGenMode,
  },
  {
    label: 'Exam Revision Cards',
    prompt: 'Create 5 high-yield revision flashcards for Introduction to Macroeconomics.',
    mode: 'flashcards' as StudyGenMode,
  },
];

const MODES = [
  { id: 'general' as StudyGenMode, label: 'General Tutor', icon: Sparkles, desc: 'Ask any question' },
  { id: 'past_questions' as StudyGenMode, label: 'Past Q Explainer', icon: BookOpen, desc: 'Step-by-step solutions' },
  { id: 'assignment_help' as StudyGenMode, label: 'Problem Solver', icon: HelpCircle, desc: 'Work through exercises' },
  { id: 'summary' as StudyGenMode, label: 'Summarizer', icon: FileText, desc: 'Synthesize lecture notes' },
  { id: 'flashcards' as StudyGenMode, label: 'Flashcards', icon: Layers, desc: 'High-yield revision' },
  { id: 'quiz_generator' as StudyGenMode, label: 'Practice Quiz', icon: GraduationCap, desc: 'Test yourself' },
];

/**
 * Clean Academic Markdown text formatter
 */
const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Split into lines for structured academic rendering
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${i}`} className="my-2.5 rounded-xl bg-slate-900 text-slate-100 p-3.5 font-mono text-xs overflow-x-auto border border-slate-800">
            <pre>{codeBuffer.join('\n')}</pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={`blank-${i}`} className="h-2" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${i}`} className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-3.5 mb-1.5 flex items-center gap-2">
          {renderInlineFormatting(trimmed.replace('### ', ''))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${i}`} className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">
          {renderInlineFormatting(trimmed.replace('## ', ''))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h1-${i}`} className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-4 mb-2">
          {renderInlineFormatting(trimmed.replace('# ', ''))}
        </h2>
      );
      continue;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-2 shrink-0" />
          <span className="flex-1 leading-relaxed">{renderInlineFormatting(trimmed.replace(/^[-*]\s+/, ''))}</span>
        </div>
      );
      continue;
    }

    // Numbered lists
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-1 pl-1">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 mt-0.5">{numberMatch[1]}.</span>
          <span className="flex-1 leading-relaxed">{renderInlineFormatting(numberMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
};

// Helper for inline bold, italic, code tags
function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\$\$.*?\$\$|\$.*?\$)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return (
        <em key={idx} className="italic text-slate-700 dark:text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold border border-slate-200 dark:border-slate-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    if ((part.startsWith('$$') && part.endsWith('$$')) || (part.startsWith('$') && part.endsWith('$'))) {
      const mathExpr = part.replace(/^\$\$?/, '').replace(/\$\$?$/, '');
      return (
        <span key={idx} className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 font-mono text-xs text-indigo-900 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-800 inline-block my-0.5">
          {mathExpr}
        </span>
      );
    }
    return part;
  });
}

export const StudyGenAI: React.FC<StudyGenAIProps> = ({ onBack, onNavigateToResources, onOpenAuth }) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [selectedMode, setSelectedMode] = useState<StudyGenMode>('general');
  const [courseCode, setCourseCode] = useState('');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<StudyGenMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFreePhase1 = StorageService.isStudyGenFree();

  // Automatically load personal history whenever currentUser is synced
  useEffect(() => {
    if (currentUser) {
      const saved = StorageService.getStudyGenHistory(currentUser.id);
      if (saved && saved.length > 0) {
        setMessages(saved);
      } else {
        setMessages([]);
      }
      setApiError(null);
    } else {
      setMessages([]);
    }
  }, [currentUser?.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const queryToSend = (customPrompt || inputQuery).trim();
    if (!queryToSend || isLoading) return;

    // Reset error state
    setApiError(null);
    setLastFailedPrompt(null);

    // StudyGen requires an active signed-in student account to prevent AI credit abuse
    if (!currentUser) {
      setApiError('Please sign in with your student account to use StudyGen AI.');
      setLastFailedPrompt(queryToSend);
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    const userMsg: StudyGenMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: queryToSend,
      timestamp: new Date().toISOString(),
      mode: selectedMode,
      courseCode: courseCode.trim() || undefined,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Get the caller's real Supabase session token — the server verifies this
      // cryptographically, so this must be a genuine Supabase-issued token.
      const client = getSupabase();
      const { data: sessionData } = client ? await client.auth.getSession() : { data: { session: null } };
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        setApiError('Unable to synchronize your session. Please sign in to verify your account.');
        setLastFailedPrompt(queryToSend);
        setIsLoading(false);
        if (onOpenAuth) onOpenAuth('login');
        return;
      }

      const response = await fetch('/api/studygen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          prompt: queryToSend,
          mode: selectedMode,
          courseCode: courseCode.trim() || undefined,
          faculty: currentUser?.facultyName || undefined,
          department: currentUser?.departmentName || undefined,
          level: currentUser?.level || undefined,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (response.status === 401) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        throw new Error(errBody?.error || 'StudyGen AI is temporarily unavailable. Please try again later.');
      }

      const data = await response.json();
      const aiReplyText = data.reply || data.result || data.text;

      if (!aiReplyText || typeof aiReplyText !== 'string') {
        throw new Error('StudyGen AI returned an empty response. Please try again.');
      }

      // Successful response: strictly clear any error state
      setApiError(null);

      const aiMsg: StudyGenMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: aiReplyText,
        timestamp: new Date().toISOString(),
        mode: selectedMode,
        courseCode: courseCode.trim() || undefined,
      };

      const updatedAll = [...newHistory, aiMsg];
      setMessages(updatedAll);
      StorageService.saveStudyGenHistory(currentUser.id, updatedAll);
    } catch (err: any) {
      console.error('StudyGen AI Request Failed:', err);
      setApiError(err?.message || 'StudyGen is currently unavailable. Please try again later.');
      setLastFailedPrompt(queryToSend);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).catch(() => {
          // fallback
        });
      }
    } catch {
      // fallback
    }
    setCopiedId(id);
    success('Study note copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (!currentUser) return;
    if (window.confirm('Are you sure you want to clear your StudyGen conversation history?')) {
      StorageService.clearStudyGenHistory(currentUser.id);
      setMessages([]);
      setApiError(null);
      success('Study conversation cleared.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-170px)] min-h-[580px] bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
      {/* Top AI Bar */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to Study Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                StudyGen AI
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 uppercase tracking-wide">
                {isFreePhase1 ? 'Free Access' : 'Pro'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Intelligent academic assistant for university courses, calculations & exams
            </p>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2">
          {onNavigateToResources && (
            <button
              onClick={onNavigateToResources}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Past Questions
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector Strip */}
      <div className="bg-slate-100/70 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap pl-1 pr-2">
          Mode:
        </span>
        {MODES.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Synced Student Account Status Banner */}
      {currentUser ? (
        <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border-b border-emerald-200/70 dark:border-emerald-800/60 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-bold text-emerald-900 dark:text-emerald-200 truncate">
              Synced with {currentUser.fullName}
            </span>
            <span className="hidden sm:inline text-emerald-700 dark:text-emerald-400 text-[11px] truncate">
              • {[currentUser.departmentName || currentUser.facultyName, currentUser.level].filter(Boolean).join(' • ') || 'Verified Student'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            <span>AI Credits Protected</span>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/70 dark:border-amber-800/60 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate text-amber-900 dark:text-amber-200">
            <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-bold truncate">Student Sign-In Required</span>
            <span className="hidden sm:inline text-amber-700 dark:text-amber-300 text-[11px] truncate">
              • Sign in to protect campus AI credits & personalize answers
            </span>
          </div>
          {onOpenAuth && (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer shrink-0"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto my-auto text-center py-6 sm:py-8 space-y-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-xs border border-cyan-200/60 dark:border-cyan-800">
              <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                What would you like to study today?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Ask about complex lecture topics, solve mathematical problems, create practice quizzes, or summarize study materials.
              </p>
            </div>

            {/* Quick Prompt Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-xl mx-auto pt-2">
              {QUICK_PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!currentUser) {
                      setApiError('Please sign in with your student account to use StudyGen AI.');
                      if (onOpenAuth) onOpenAuth('login');
                      toastError('Please sign in with your student account to use StudyGen AI.');
                      return;
                    }
                    setSelectedMode(chip.mode);
                    handleSend(chip.prompt);
                  }}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-xs transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <span>{chip.label}</span>
                    <Sparkles className="w-3 h-3 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500" />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-1">
                    {chip.prompt}
                  </p>
                </button>
              ))}
            </div>

            {/* Unauthenticated Sign-In Required Notice */}
            {!currentUser && (
              <div className="max-w-xl mx-auto mt-4 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-amber-950 dark:text-amber-200">
                      Sign in required to protect campus AI credits:
                    </span>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                      Every study query automatically syncs with your course profile and academic level. Anonymous visitors cannot access StudyGen AI.
                    </p>
                  </div>
                </div>
                {onOpenAuth && (
                  <div className="flex items-center gap-2 pt-1 pl-9">
                    <button
                      type="button"
                      onClick={() => onOpenAuth('login')}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenAuth('signup')}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold text-xs hover:bg-amber-100/50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isUser
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                      : 'bg-indigo-600 dark:bg-cyan-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`rounded-3xl p-4 shadow-xs relative group ${
                    isUser
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                  }`}
                >
                  {/* Mode / Course pill on AI replies */}
                  {!isUser && (msg.courseCode || msg.mode) && (
                    <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {msg.courseCode && <span className="bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-sm">{msg.courseCode}</span>}
                      {msg.mode && <span className="text-slate-400 dark:text-slate-500">• {msg.mode.replace('_', ' ')}</span>}
                    </div>
                  )}

                  {isUser ? (
                    <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  ) : (
                    <FormattedContent content={msg.content} />
                  )}

                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span>StudyGen Assistant</span>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy note"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span className="text-[10px]">{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-3 max-w-2xl mr-auto">
            <div className="w-8 h-8 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl rounded-tl-xs p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>StudyGen is solving & formulating answer...</span>
              </div>
            </div>
          </div>
        )}

        {/* Genuine Error State */}
        {apiError && !isLoading && (
          <div className="flex gap-3 max-w-2xl mr-auto">
            <div className="w-8 h-8 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-3xl rounded-tl-xs p-4 shadow-xs space-y-2.5">
              <p className="text-xs font-bold leading-relaxed">{apiError}</p>
              <div className="flex flex-wrap items-center gap-2">
                {lastFailedPrompt && currentUser && (
                  <button
                    onClick={() => handleSend(lastFailedPrompt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry Question</span>
                  </button>
                )}
                {(!currentUser || apiError.toLowerCase().includes('sign in') || apiError.toLowerCase().includes('session')) && onOpenAuth && (
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Sign In to Continue</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 space-y-2 shrink-0">
        <div className="flex items-center gap-2">
          {/* Optional Course Code Input */}
          <div className="w-24 sm:w-28 shrink-0">
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
              placeholder="Course Code"
              className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal focus:border-cyan-500 outline-none uppercase"
            />
          </div>

          {/* Main Prompt Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onFocus={() => {
                if (!currentUser && onOpenAuth) {
                  onOpenAuth('login');
                  toastError('Please sign in with your student account to use StudyGen AI.');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!currentUser) {
                    onOpenAuth?.('login');
                    toastError('Please sign in with your student account to use StudyGen AI.');
                    return;
                  }
                  handleSend();
                }
              }}
              placeholder={
                currentUser
                  ? `Ask StudyGen AI about ${currentUser.departmentName || 'your course'}, calculations, or exams...`
                  : 'Please sign in with your student account to use StudyGen AI...'
              }
              className="w-full pl-4 pr-12 py-2.5 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
            />

            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth?.('login');
                  toastError('Please sign in with your student account to use StudyGen AI.');
                  return;
                }
                handleSend();
              }}
              disabled={isLoading || (currentUser && !inputQuery.trim())}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors cursor-pointer"
            >
              {currentUser ? <Send className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1">
          <span>Tuned for university academic curriculum</span>
          <span className="font-semibold text-cyan-600 dark:text-cyan-400">Phase 1 Launch • Free Student Access</span>
        </div>
      </div>
    </div>
  );
};
