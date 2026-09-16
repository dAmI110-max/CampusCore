import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StudyResource, StudyResourceCategory } from '../../types';
import { StorageService } from '../../services/storageService';
import {
  BookOpen,
  Download,
  FileText,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Share2,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowLeft,
  UploadCloud,
  X,
  FileCheck,
  Eye,
  Calendar,
  Building2,
  BookMarked,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

interface StudyResourcesProps {
  initialCategory?: string; // 'all' | 'past_question' | 'textbook' | 'lecture_notes' | 'course_materials' | 'study_guide'
  onOpenStudyGen?: (initialQuery?: string) => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  onReport?: (resourceId: string, resourceTitle: string) => void;
  onBackToHub?: () => void;
}

const CATEGORY_TABS: { id: string; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'All Resources', icon: Layers },
  { id: 'past_question', label: 'Past Questions', icon: HelpCircle },
  { id: 'textbook', label: 'Textbooks & Academic Resources', icon: BookOpen },
  { id: 'lecture_notes', label: 'Lecture Notes', icon: FileText },
  { id: 'course_materials', label: 'Course Materials', icon: FileSpreadsheet },
  { id: 'study_guide', label: 'Study Guides', icon: BookMarked },
];

export const StudyResources: React.FC<StudyResourcesProps> = ({
  initialCategory = 'all',
  onOpenStudyGen,
  onOpenAuth,
  onReport,
  onBackToHub,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [resources, setResources] = useState<StudyResource[]>(() =>
    StorageService.getStudyResources()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedResourceForDetail, setSelectedResourceForDetail] = useState<StudyResource | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCategory, setNewCategory] = useState<StudyResourceCategory>(
    initialCategory !== 'all' ? (initialCategory as StudyResourceCategory) : 'past_question'
  );
  const [newLevel, setNewLevel] = useState('100L');
  const [newSemester, setNewSemester] = useState('1st Semester');
  const [newSessionYear, setNewSessionYear] = useState('2024/2025');
  const [newFaculty, setNewFaculty] = useState(currentUser?.facultyName || 'Faculty of Engineering');
  const [newDepartment, setNewDepartment] = useState(currentUser?.departmentName || 'Mechanical Engineering');
  const [newDescription, setNewDescription] = useState('');

  const faculties = StorageService.getFaculties();

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleDownload = (resource: StudyResource) => {
    StorageService.incrementStudyResourceDownloads(resource.id);
    setResources(StorageService.getStudyResources());
    success(`Downloading "${resource.title}" (${resource.courseCode})`);
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    success('Resource saved to your study library.');
  };

  const handleShare = (resource: StudyResource) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Check out this study resource on CampusCore: ${resource.courseCode} - ${resource.title}`
      );
      success('Resource details copied to clipboard!');
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!newTitle.trim() || !newCourseCode.trim()) {
      toastError('Please fill in the document title and course code.');
      return;
    }

    StorageService.addStudyResource({
      title: newTitle.trim(),
      courseCode: newCourseCode.trim().toUpperCase(),
      courseTitle: newCourseTitle.trim() || newTitle.trim(),
      facultyName: newFaculty,
      departmentName: newDepartment,
      level: newLevel,
      semester: newSemester,
      session: newSessionYear,
      category: newCategory as any,
      fileType: 'pdf',
      fileSize: '2.8 MB',
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      downloadsCount: 0,
      viewsCount: 1,
      rating: 5.0,
      totalRatings: 1,
      verified: true,
      status: 'approved',
      description: newDescription.trim() || undefined,
    });

    setResources(StorageService.getStudyResources());
    setShowUploadModal(false);
    setNewTitle('');
    setNewCourseCode('');
    setNewCourseTitle('');
    setNewDescription('');
    success('Study resource published successfully to the course library!');
  };

  // Filter logic
  const filtered = resources.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.departmentName && r.departmentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category matching (including aliases)
    let matchCategory = true;
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'past_question') {
        matchCategory = r.category === 'past_question';
      } else if (selectedCategory === 'textbook') {
        matchCategory = r.category === 'textbook' || (r.category as any) === 'textbook_resource' || (r.category as any) === 'textbook_summary';
      } else if (selectedCategory === 'lecture_notes') {
        matchCategory = r.category === 'lecture_notes' || (r.category as any) === 'handout';
      } else if (selectedCategory === 'course_materials') {
        matchCategory = r.category === 'course_materials' || (r.category as any) === 'course_material';
      } else if (selectedCategory === 'study_guide') {
        matchCategory = r.category === 'study_guide' || (r.category as any) === 'solution_guide';
      } else {
        matchCategory = r.category === selectedCategory;
      }
    }

    const matchLevel = selectedLevel === 'all' || r.level === selectedLevel;
    const matchSemester = selectedSemester === 'all' || r.semester === selectedSemester;
    const matchFaculty = selectedFaculty === 'all' || r.facultyName === selectedFaculty;

    return matchSearch && matchCategory && matchLevel && matchSemester && matchFaculty;
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'past_question':
        return 'Past Question';
      case 'textbook':
      case 'textbook_resource':
      case 'textbook_summary':
        return 'Textbook & Academic';
      case 'lecture_notes':
      case 'handout':
        return 'Lecture Notes';
      case 'course_materials':
      case 'course_material':
        return 'Course Material';
      case 'study_guide':
      case 'solution_guide':
        return 'Study Guide';
      default:
        return 'Study Material';
    }
  };

  const getActiveTabTitle = () => {
    const tab = CATEGORY_TABS.find((t) => t.id === selectedCategory);
    return tab ? tab.label : 'Academic Resources';
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Campus Study Hub</span>
            </button>
          )}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {getActiveTabTitle()}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Free academic repository for Nigerian university coursework, exam papers, and syllabus resources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenStudyGen && (
            <button
              onClick={() => onOpenStudyGen()}
              className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Ask StudyGen AI</span>
            </button>
          )}

          <button
            onClick={() => {
              if (!currentUser && onOpenAuth) {
                onOpenAuth();
                return;
              }
              setShowUploadModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Resource</span>
          </button>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code (e.g. GST111, MAT201), course title, department, or topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-indigo-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Levels</option>
            <option value="100L">100 Level</option>
            <option value="200L">200 Level</option>
            <option value="300L">300 Level</option>
            <option value="400L">400 Level</option>
            <option value="500L">500 Level</option>
            <option value="Postgraduate">Postgraduate</option>
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Semesters</option>
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
          </select>

          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Faculties</option>
            {faculties.map((fac) => (
              <option key={fac.id} value={fac.name}>
                {fac.name}
              </option>
            ))}
          </select>

          {(searchQuery || selectedLevel !== 'all' || selectedSemester !== 'all' || selectedFaculty !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('all');
                setSelectedSemester('all');
                setSelectedFaculty('all');
              }}
              className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of study resources */}
      {filtered.length === 0 ? (
        <EmptyState
          type="search"
          title="No study resources found"
          description="There are currently no uploaded materials matching your query or filter in this section. Students build the library together — contribute yours today!"
          actionText="Upload Study Material"
          onAction={() => setShowUploadModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isBookmarked = bookmarkedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                      {item.courseCode}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md capitalize">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {item.courseTitle}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {item.level} {item.semester ? `• ${item.semester}` : ''}
                    </span>
                    <span>{item.fileSize || 'PDF'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Secondary actions: Save, Share, Detail */}
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <button
                      onClick={() => handleToggleBookmark(item.id)}
                      className="p-1.5 rounded-xl hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                      title={isBookmarked ? 'Saved' : 'Save resource'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleShare(item)}
                      className="p-1.5 rounded-xl hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                      title="Share resource"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSelectedResourceForDetail(item)}
                      className="p-1.5 rounded-xl hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Primary Download Button (100% Free) */}
                  <button
                    onClick={() => handleDownload(item)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resource Detail & Preview Modal */}
      {selectedResourceForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                  {selectedResourceForDetail.courseCode.substring(0, 3)}
                </div>
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wide">
                    {getCategoryLabel(selectedResourceForDetail.category)}
                  </span>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {selectedResourceForDetail.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedResourceForDetail(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Course Code</span>
                  <p className="font-black text-slate-900">{selectedResourceForDetail.courseCode}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Academic Level</span>
                  <p className="font-bold text-slate-900">{selectedResourceForDetail.level}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Semester / Session</span>
                  <p className="font-bold text-slate-900">
                    {selectedResourceForDetail.semester || 'All Semesters'} {selectedResourceForDetail.session ? `(${selectedResourceForDetail.session})` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">File Format</span>
                  <p className="font-bold text-slate-900">{selectedResourceForDetail.fileType.toUpperCase()} ({selectedResourceForDetail.fileSize || 'Standard'})</p>
                </div>
              </div>

              {selectedResourceForDetail.description && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Description</span>
                  <p className="mt-0.5 text-slate-700 leading-relaxed">{selectedResourceForDetail.description}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                <span>Contributed by {selectedResourceForDetail.authorName}</span>
                <span>{selectedResourceForDetail.downloadsCount} total downloads</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              {onReport && (
                <button
                  onClick={() => {
                    const res = selectedResourceForDetail;
                    setSelectedResourceForDetail(null);
                    onReport(res.id, res.title);
                  }}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => {
                    handleDownload(selectedResourceForDetail);
                    setSelectedResourceForDetail(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Free Resource</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Study Material Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Upload Study Material</h3>
                  <p className="text-xs text-slate-500">Share academic resources with fellow students</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="py-4 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 2024 Past Questions & Complete Solutions"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MAT 201"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 uppercase focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Level
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:border-indigo-500 outline-none"
                  >
                    <option value="100L">100 Level</option>
                    <option value="200L">200 Level</option>
                    <option value="300L">300 Level</option>
                    <option value="400L">400 Level</option>
                    <option value="500L">500 Level</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:border-indigo-500 outline-none"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Session / Year
                  </label>
                  <input
                    type="text"
                    value={newSessionYear}
                    onChange={(e) => setNewSessionYear(e.target.value)}
                    placeholder="e.g. 2024/2025"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Resource Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as StudyResourceCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="past_question">Past Examination Questions</option>
                  <option value="textbook">Textbooks & Academic Resources</option>
                  <option value="lecture_notes">Lecture Notes</option>
                  <option value="course_materials">Course Materials</option>
                  <option value="study_guide">Study Guides & Solution Keys</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Title / Topic
                </label>
                <input
                  type="text"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. Linear Algebra & Differential Equations"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Any extra context or topic breakdown..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
