import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudyGenAI } from './StudyGenAI';
import { StudyResources } from './StudyResources';
import { StudyTools } from './StudyTools';
import {
  Sparkles,
  BookOpen,
  Calculator,
  ArrowLeft,
  GraduationCap,
  Layers,
  Zap,
  BookMarked,
  FileText,
  FolderArchive,
  ArrowRight,
  Plus,
  Compass,
} from 'lucide-react';

interface StudyViewProps {
  onBack?: () => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  initialTab?: 'hub' | 'studygen' | 'resources' | 'tools';
  initialCategory?: string;
}

export const StudyView: React.FC<StudyViewProps> = ({
  onBack,
  onOpenAuth,
  initialTab = 'hub',
  initialCategory = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<'hub' | 'studygen' | 'resources' | 'tools'>(initialTab);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const { currentUser } = useAuth();

  const handleOpenCategory = (cat: string) => {
    setActiveCategory(cat);
    setActiveTab('resources');
  };

  return (
    <div className="min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Back to previous view"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Campus Academic Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Campus Study
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Your academic space for studying, sharing resources and getting help.
          </p>
        </div>

        {/* Global Study Tab Switcher */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl gap-1 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('hub')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hub'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Study Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('studygen')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'studygen'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>StudyGen AI</span>
          </button>

          <button
            onClick={() => {
              setActiveCategory('all');
              setActiveTab('resources');
            }}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'resources'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Resources</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>GPA & Tools</span>
          </button>
        </div>
      </div>

      {/* 1. STUDY HUB OVERVIEW LANDING */}
      {activeTab === 'hub' && (
        <div className="space-y-6">
          {/* PRIMARY / FEATURED SECTION: StudyGen AI */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-950 via-slate-950 to-blue-950 p-6 sm:p-8 text-white border border-cyan-900/60 shadow-md">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Featured Academic AI</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 rounded-full font-extrabold uppercase">
                  Free Access
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                  StudyGen AI Academic Assistant
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Ask deep academic questions, break down complex lecture concepts, solve calculation problems step-by-step, generate practice quizzes, and summarize course materials.
                </p>
              </div>

              {/* Quick Triggers */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab('studygen')}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Launch StudyGen AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleOpenCategory('past_question')}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-cyan-300" />
                  <span>Explore Past Questions</span>
                </button>
              </div>
            </div>
          </div>

          {/* ACADEMIC SECTIONS & RESOURCE CARDS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Academic Library & Study Resources
                </h3>
                <p className="text-xs text-slate-500">
                  Browse by category or contribute to help your department coursemates.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setActiveTab('resources');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Past Questions */}
              <div
                onClick={() => handleOpenCategory('past_question')}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Past Questions
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Past university exam papers, test series, and verified solution walkthroughs for revision.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>Browse Past Questions</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* 2. Textbooks & Academic Resources */}
              <div
                onClick={() => handleOpenCategory('textbook_resource')}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Textbooks & Academic Resources
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Open-access textbooks, reference readings, chapter summaries, and educational materials.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                  <span>Browse Textbooks</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* 3. Lecture Notes */}
              <div
                onClick={() => handleOpenCategory('lecture_notes')}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    Lecture Notes
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Student-uploaded lecture notes, class summaries, and course slides shared by reps.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Browse Lecture Notes</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* 4. Course Materials */}
              <div
                onClick={() => handleOpenCategory('course_material')}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                    Course Materials
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Departmental course outlines, syllabi, lab manuals, and supplementary reading packs.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                  <span>Browse Course Materials</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* 5. Study Guides */}
              <div
                onClick={() => handleOpenCategory('study_guide')}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                    Study Guides & Outlines
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    High-yield revision outlines, formula sheets, key definition summaries, and exam checklists.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                  <span>Browse Study Guides</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* 6. GPA & Academic Tools */}
              <div
                onClick={() => setActiveTab('tools')}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                    GPA Calculator & Focus Tools
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Calculate semester GPA on 5.0 Nigerian grading scale, simulate targets, and run Pomodoro timers.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
                  <span>Open Academic Tools</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. STUDYGEN AI VIEW */}
      {activeTab === 'studygen' && (
        <StudyGenAI
          onBack={() => setActiveTab('hub')}
          onOpenAuth={onOpenAuth}
          onNavigateToResources={() => {
            setActiveCategory('past_question');
            setActiveTab('resources');
          }}
        />
      )}

      {/* 3. RESOURCES DIRECTORY VIEW */}
      {activeTab === 'resources' && (
        <StudyResources
          initialCategory={activeCategory}
          onOpenStudyGen={() => setActiveTab('studygen')}
          onOpenAuth={onOpenAuth}
          onBackToHub={() => setActiveTab('hub')}
        />
      )}

      {/* 4. ACADEMIC TOOLS VIEW */}
      {activeTab === 'tools' && <StudyTools />}
    </div>
  );
};
